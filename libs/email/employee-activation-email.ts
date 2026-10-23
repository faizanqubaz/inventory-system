
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function employeeActivationEmail(
  name: string,
  activationUrl: string
) {
  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(activationUrl);

  return `
    <!DOCTYPE html>
    <html>
      <body style="font-family:Arial,sans-serif;color:#222;line-height:1.6">
        <div style="max-width:600px;margin:30px auto;padding:24px;border:1px solid #ddd;border-radius:12px">
          <h2>Your employee account has been created</h2>

          <p>Hello ${safeName},</p>

          <p>
            An administrator has created an employee profile for you
            in our Inventory Management System.
          </p>

          <p>
            Your login email is the email address to which this message
            was sent. Please activate your account and create your own
            password using the button below.
          </p>

          <p style="margin:28px 0">
            <a href="${safeUrl}"
              style="background:#0f766e;color:#fff;padding:12px 22px;
              text-decoration:none;border-radius:6px;display:inline-block">
              Activate My Account
            </a>
          </p>

          <p>
            This link expires in 24 hours and can only be used once.
          </p>

          <p>
            If you were not expecting this account, please contact
            your administrator.
          </p>

          <p>Regards,<br/>Inventory Management Team</p>
        </div>
      </body>
    </html>
  `;
}
