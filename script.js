(() => {
  "use strict";

  const form = document.getElementById("leadForm");
  const submitButton = document.getElementById("submitButton");
  const status = document.getElementById("formStatus");
  form.noValidate = true;

  const showError = (field, message) => {
    field.setAttribute("aria-invalid", "true");

    const error = form.querySelector(
      `[data-error-for="${field.id}"]`
    );

    if (error) error.textContent = message;
  };

  const clearError = (field) => {
    field.removeAttribute("aria-invalid");

    const error = form.querySelector(
      `[data-error-for="${field.id}"]`
    );

    if (error) error.textContent = "";
  };

  const validateForm = () => {
    const fields = [
      ...form.querySelectorAll(
        "input[required], textarea[required], select[required]"
      )
    ];

    let valid = true;

    fields.forEach((field) => {
      clearError(field);

      if (!field.value.trim()) {
        showError(field, "This field is required.");
        valid = false;
      } else if (field.type === "email" && !field.validity.valid) {
        showError(field, "Enter a valid email address.");
        valid = false;
      } else if (
        field.type === "tel" &&
        (!/^[+\d\s().-]+$/.test(field.value) ||
          !/^\d{8,15}$/.test(field.value.replace(/\D/g, "")))
      ) {
        showError(field, "Enter a valid contact number.");
        valid = false;
      }
    });

    form.querySelector('[aria-invalid="true"]')?.focus();

    return valid;
  };

  form.addEventListener("input", (event) => {
    if (event.target.matches("input, textarea, select")) {
      clearError(event.target);
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitButton.disabled) return;

    if (!validateForm()) return;

    if (form.elements.botcheck.checked) return;

    submitButton.disabled = true;
    submitButton.classList.add("is-loading");
    form.setAttribute("aria-busy", "true");
    status.textContent = "Sending your enquiry…";

    try {
      const data = new FormData(form);
      for (const [name, value] of data) {
        if (typeof value === "string") data.set(name, value.trim());
      }

      const response = await fetch(form.action, {
        method: "POST",
        body: data,
        signal: AbortSignal.timeout(20000),
        headers: {
          Accept: "application/json"
        }
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success !== true) {
        throw new Error("Submission failed. Your details are still here; please try again.");
      }

      window.location.assign(form.elements.redirect.value);
    } catch (error) {
      status.textContent = error.name === "TimeoutError"
        ? "The request timed out. Please try again shortly."
        : "We couldn’t confirm your submission. Please check your connection and try again.";
    } finally {
      submitButton.disabled = false;
      submitButton.classList.remove("is-loading");
      form.removeAttribute("aria-busy");
    }
  });
})();
