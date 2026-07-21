# B2B Industrial Solutions — Forum Lead Form

A fast, responsive, dependency-free HTML/CSS/JavaScript page for collecting visitor details at `forum-b2bindustrial.in`.

## Setup

1. Add your logo as `logo.png` in this folder.
2. Open `index.html` and replace:

   ```html
   YOUR_WEB3FORMS_ACCESS_KEY
   ```

   with your Web3Forms access key.
3. Upload all files to the root folder of `forum-b2bindustrial.in`.
4. Serve the site over HTTPS so mobile camera access works reliably.

## Important Web3Forms note

The form itself works with a standard Web3Forms access key. Sending the visiting-card image as an email attachment requires a Web3Forms plan that supports file attachments. The manual details remain usable even when no photo is selected.

## Files

- `index.html` — page structure and form
- `style.css` — responsive styling
- `script.js` — preview, validation, camera/upload handling and AJAX submission
- `logo.png` — add your own logo file
