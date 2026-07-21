(() => {
  "use strict";

  const form = document.getElementById("leadForm");
  const submitButton = document.getElementById("submitButton");
  const status = document.getElementById("formStatus");

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
        field.value.replace(/\D/g, "").length < 8
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

    if (!validateForm()) return;

    submitButton.disabled = true;
    submitButton.classList.add("is-loading");
    status.textContent = "";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: {
          Accept: "application/json"
        }
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Submission failed. Please try again."
        );
      }

      window.location.href = "https://b2bindustrial.in/success";
    } catch (error) {
      status.textContent =
        error.message || "Submission failed. Please try again.";
    } finally {
      submitButton.disabled = false;
      submitButton.classList.remove("is-loading");
    }
  });
})();