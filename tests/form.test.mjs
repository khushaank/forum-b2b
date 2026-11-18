import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';

const source = readFileSync(new URL('../script.js', import.meta.url), 'utf8');

function setup({ response = { ok: true, json: async () => ({ success: true }) }, fetchError, values = {} } = {}) {
  const handlers = {};
  const fields = ['name', 'email', 'designation', 'company', 'phone'].map((id) => ({
    id, type: id === 'phone' ? 'tel' : id === 'email' ? 'email' : 'text',
    value: values[id] ?? ({ email: 'alex@example.com', phone: '+91 98765 43210' }[id] || 'Example'),
    validity: { valid: values[id] !== 'invalid-email' },
    attributes: {}, error: { textContent: '' },
    setAttribute(key, value) { this.attributes[key] = value; },
    removeAttribute(key) { delete this.attributes[key]; },
    focus() { this.focused = true; },
    matches() { return true; },
  }));
  const button = { disabled: false, classList: { add() {}, remove() {} } };
  const status = { textContent: '' };
  const form = {
    action: 'https://api.web3forms.com/submit', attributes: {},
    elements: { botcheck: { checked: false }, redirect: { value: 'https://b2bindustrial.in/success' } },
    addEventListener(name, handler) { handlers[name] = handler; },
    querySelectorAll() { return fields; },
    querySelector(selector) {
      return selector.includes('data-error-for')
        ? fields.find((field) => selector.includes(`"${field.id}"`))?.error
        : fields.find((field) => field.attributes['aria-invalid'] === 'true');
    },
    setAttribute(key, value) { this.attributes[key] = value; },
    removeAttribute(key) { delete this.attributes[key]; },
  };
  const calls = [];
  const redirects = [];
  class FormDataMock extends Map {
    constructor() { super(fields.map(({ id, value }) => [id, value])); }
  }
  vm.runInNewContext(source, {
    document: { getElementById(id) { return { leadForm: form, submitButton: button, formStatus: status }[id]; } },
    window: { location: { assign(url) { redirects.push(url); } } },
    FormData: FormDataMock, AbortSignal,
    fetch: async (...args) => { calls.push(args); if (fetchError) throw fetchError; return response; },
  });
  return { fields, button, status, form, calls, redirects, handlers, submit: () => handlers.submit({ preventDefault() {} }) };
}

test('invalid required, email and international phone fields never send', async () => {
  for (const values of [{ name: ' ' }, { email: 'invalid-email' }, { phone: '1234567' }, { phone: '1234567890123456' }, { phone: 'abc9876543210' }]) {
    const page = setup({ values });
    await page.submit();
    assert.equal(page.calls.length, 0);
    assert.ok(page.fields.some((field) => field.focused && field.error.textContent));
  }
});

test('success sends trimmed details and follows the existing redirect', async () => {
  const page = setup({ values: { name: ' Alex ' } });
  await page.submit();
  assert.equal(page.calls[0][1].body.get('name'), 'Alex');
  assert.deepEqual(page.redirects, ['https://b2bindustrial.in/success']);
  assert.equal(page.button.disabled, false);
  assert.equal(page.form.attributes['aria-busy'], undefined);
});

test('HTTP errors, rejected submissions, malformed responses and network errors retain details', async () => {
  for (const options of [
    { response: { ok: false, json: async () => ({ success: true }) } },
    { response: { ok: true, json: async () => ({ success: false }) } },
    { response: { ok: true, json: async () => ({}) } },
    { response: { ok: true, json: async () => { throw new Error('Invalid JSON'); } } },
    { fetchError: new Error('Offline') },
    { fetchError: Object.assign(new Error('Timeout'), { name: 'TimeoutError' }) },
  ]) {
    const page = setup(options);
    await page.submit();
    assert.equal(page.redirects.length, 0);
    assert.equal(page.fields[0].value, 'Example');
    assert.ok(page.status.textContent.includes('try again'));
    assert.equal(page.button.disabled, false);
  }
});

test('duplicate submits and honeypot submissions are ignored', async () => {
  const page = setup();
  page.button.disabled = true;
  await page.submit();
  page.button.disabled = false;
  page.form.elements.botcheck.checked = true;
  await page.submit();
  assert.equal(page.calls.length, 0);
});

test('editing a field clears its accessible error state', async () => {
  const page = setup({ values: { name: '' } });
  await page.submit();
  page.handlers.input({ target: page.fields[0] });
  assert.equal(page.fields[0].attributes['aria-invalid'], undefined);
  assert.equal(page.fields[0].error.textContent, '');
});

test('SEO uses the canonical site and an exact CSP hash', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
  const hash = createHash('sha256').update(jsonLd).digest('base64');
  assert.ok(html.includes(`'sha256-${hash}'`));
  assert.ok(html.includes('rel="canonical" href="https://connect.b2bindustrial.in/"'));
  assert.equal(JSON.parse(jsonLd)['@graph'][1]['@type'], 'ContactPage');
  assert.ok(!html.includes('YOUR_ACCESS_KEY'));
  assert.ok(!/\son\w+=/.test(html));
  assert.ok(!html.includes('unsafe-eval'));
});
