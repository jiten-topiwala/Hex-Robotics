# How to Implement a Working Contact Form (FormSubmit + AJAX)

To add a reliable, serverless contact form to your portfolio website, you can use **FormSubmit.co**. It works with just HTML and JavaScript—no backend code required.

Here is the exact setup we used for Hex Robotics.

## 1. The HTML Structure
Add this form to your HTML.
*   **Action URL**: `https://formsubmit.co/YOUR_EMAIL` (Replace `YOUR_EMAIL` with your actual email).
*   **Hidden Fields**:
    *   `_captcha="false"`: Disables the "I'm not a robot" popup (optional, but smoother).
    *   `_template="table"`: Formats the email you receive nicely.
    *   `_honey`: A hidden field to trap bots (spam protection).
    *   `id="contact-form"`: Important for selection in JavaScript.

```html
<form id="contact-form" action="https://formsubmit.co/your-email@example.com" method="POST">
  
  <!-- Configuration -->
  <input type="hidden" name="_captcha" value="false">
  <input type="hidden" name="_template" value="table">
  <input type="hidden" name="_subject" value="New Portfolio Submission">
  <!-- Honeypot Spam Protection (Hide this with CSS or inline style) -->
  <input type="text" name="_honey" style="display:none">

  <!-- Inputs -->
  <div class="form-group">
    <label for="name">Name</label>
    <input type="text" id="name" name="name" required placeholder="John Doe">
  </div>

  <div class="form-group">
    <label for="email">Email</label>
    <input type="email" id="email" name="email" required placeholder="john@example.com">
  </div>

  <div class="form-group">
    <label for="message">Message</label>
    <textarea id="message" name="message" rows="4" required placeholder="Hi, I'd like to work with you..."></textarea>
  </div>

  <button type="submit">Send Message</button>
  
  <!-- Status Message Area -->
  <p id="contact-status"></p>
</form>
```

## 2. The JavaScript (AJAX)
This script prevents the page from reloading (redirecting to FormSubmit's site) and instead sends the data silently.

```javascript
/* 
 * Contact Form Handler 
 * Intercepts submission and sends via AJAX (Fetch API) 
 */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#contact-form");
  const statusEl = document.querySelector("#contact-status");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault(); // Stop page reload

      const formData = new FormData(form);
      
      // OPTIONAL: Client-side validation
      const name = formData.get("name");
      const email = formData.get("email");
      const message = formData.get("message");
      if (!name || !email || !message) {
        if(statusEl) statusEl.textContent = "Please fill all fields.";
        return;
      }

      // Update UI to show sending state
      if(statusEl) statusEl.textContent = "Sending...";

      // Send Data
      fetch(form.action, {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json' // Important: requests JSON response
        }
      })
      .then(response => {
        if (response.ok) {
          if(statusEl) statusEl.textContent = "Thanks! Message sent.";
          form.reset(); // Clear form
        } else {
          if(statusEl) statusEl.textContent = "Oops! Something went wrong.";
        }
      })
      .catch(error => {
        if(statusEl) statusEl.textContent = "Network error. Please try again.";
        console.error(error);
      });
    });
  }
});
```

## 3. Important: Activation
The the **first time** you test this on your live site (or localhost):
1.  Submit the form.
2.  Check your email inbox.
3.  Click the **"Activate"** button in the email from FormSubmit.

After that, it will work forever!
