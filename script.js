(() => {
  "use strict";
  const form = document.getElementById("leadForm");
  const steps = [...document.querySelectorAll(".quest-step")];
  const progress = [...document.querySelectorAll(".progress li")];
  const backButton = document.getElementById("backButton");
  const nextButton = document.getElementById("nextButton");
  const submitButton = document.getElementById("submitButton");
  const status = document.getElementById("formStatus");
  const confirmation = document.getElementById("confirmation");
  let activeStep = 0;

  const showError = (field, message) => {
    field.setAttribute("aria-invalid", "true");
    form.querySelector(`[data-error-for="${field.id}"]`).textContent = message;
  };
  const clearError = (field) => {
    field.removeAttribute("aria-invalid");
    const error = form.querySelector(`[data-error-for="${field.id}"]`);
    if (error) error.textContent = "";
  };
  const validateStep = () => {
    const fields = [...steps[activeStep].querySelectorAll("input[required]")];
    let valid = true;
    fields.forEach((field) => {
      clearError(field);
      if (!field.value.trim()) { showError(field, "This field is required."); valid = false; }
      else if (field.type === "email" && !field.validity.valid) { showError(field, "Enter a valid email address."); valid = false; }
      else if (field.type === "tel" && field.value.replace(/\D/g, "").length < 8) { showError(field, "Enter a valid contact number."); valid = false; }
    });
    if (!valid) steps[activeStep].querySelector('[aria-invalid="true"]').focus();
    return valid;
  };
  const render = () => {
    steps.forEach((step, index) => { const current = index === activeStep; step.hidden = !current; step.classList.toggle("is-active", current); });
    progress.forEach((item, index) => { item.classList.toggle("is-active", index === activeStep); item.classList.toggle("is-complete", index < activeStep); });
    backButton.hidden = activeStep === 0;
    nextButton.hidden = activeStep === steps.length - 1;
    submitButton.hidden = activeStep !== steps.length - 1;
    status.textContent = "";
  };
  nextButton.addEventListener("click", () => { if (validateStep()) { activeStep += 1; render(); steps[activeStep].querySelector("input, textarea")?.focus(); } });
  backButton.addEventListener("click", () => { activeStep -= 1; render(); });
  form.addEventListener("input", (event) => { if (event.target.matches("input")) clearError(event.target); });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validateStep()) return;
    const accessKey = form.elements.access_key.value.trim();
    if (!accessKey || accessKey === "YOUR_WEB3FORMS_ACCESS_KEY") { status.textContent = "Add your Web3Forms access key in index.html before publishing."; return; }
    submitButton.disabled = true; submitButton.classList.add("is-loading");
    try {
      const response = await fetch(form.action, { method:"POST", body:new FormData(form), headers:{ Accept:"application/json" } });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === false) throw new Error(result.message || "Submission failed. Please try again.");
      form.hidden = true; confirmation.hidden = false;
    } catch (error) { status.textContent = error.message; }
    finally { submitButton.disabled = false; submitButton.classList.remove("is-loading"); }
  });
})();
