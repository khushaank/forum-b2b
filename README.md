# B2B Industrial Solutions — Connect

Static contact form at **https://connect.b2bindustrial.in/**, published by GitHub Pages from the root of `main`. No build step, npm packages, or external fonts are needed.

Includes a responsive layout, accessible form validation, Web3Forms submission, canonical metadata, Open Graph/Twitter cover, Organization/ContactPage structured data, sitemap, robots.txt, and transparent favicons. Images are optimized; GitHub Pages handles HTTP compression.

## Preview and test

```sh
python -m http.server 8765 --bind 127.0.0.1
node --test tests/form.test.mjs
```

Open `http://127.0.0.1:8765/`. Tests use Node's built-in test runner and mock submissions, so no test emails are sent.

## Publish

Push changes to `main`. Keep `CNAME` and `.nojekyll`. The form uses the supplied public Web3Forms access key and redirects successful submissions to `https://b2bindustrial.in/success`.

The CSP permits local assets and Web3Forms without `unsafe-eval` or inline event handlers. If you edit the JSON-LD block, update its SHA-256 hash in the CSP; the test checks it. Preserve LF line endings for that hash.

After publishing, verify the live form and submit `https://connect.b2bindustrial.in/sitemap.xml` in Google Search Console. Browsers and social networks may cache old icons and previews. DNS forwarding is managed separately and is unchanged.
