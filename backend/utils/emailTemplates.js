// Email templates for various notifications

const emailTemplates = {
  // Welcome email template
  welcome: (userName) => ({
    subject: 'Welcome to Our Platform!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome, ${userName}!</h2>
        <p>Thank you for joining our platform. We're excited to have you on board.</p>
        <p>You can now:</p>
        <ul>
          <li>Browse available services</li>
          <li>Book appointments</li>
          <li>Manage your profile</li>
          <li>Track your bookings</li>
        </ul>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br>The Team</p>
      </div>
    `
  }),

  // Booking confirmation template
  bookingConfirmation: (userName, bookingDetails) => ({
    subject: 'Booking Confirmed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Booking Confirmation</h2>
        <p>Hi ${userName},</p>
        <p>Your booking has been confirmed!</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Booking Details:</h3>
          <p><strong>Service:</strong> ${bookingDetails.service}</p>
          <p><strong>Date:</strong> ${bookingDetails.date}</p>
          <p><strong>Time:</strong> ${bookingDetails.time}</p>
          <p><strong>Provider:</strong> ${bookingDetails.provider}</p>
        </div>
        <p>We look forward to serving you!</p>
      </div>
    `
  }),

  // Password reset template
  passwordReset: (userName, resetLink) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset</h2>
        <p>Hi ${userName},</p>
        <p>We received a request to reset your password.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      </div>
    `
  }),

  // Payment confirmation template
  paymentConfirmation: (userName, amount, transactionId) => ({
    subject: 'Payment Received',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Payment Confirmation</h2>
        <p>Hi ${userName},</p>
        <p>We have received your payment.</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Amount:</strong> $${amount}</p>
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
        </div>
        <p>Thank you for your payment!</p>
      </div>
    `
  })
};

module.exports = emailTemplates;
