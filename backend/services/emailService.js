const nodemailer = require('nodemailer');

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: { user, pass }
    });
    console.log(`✉️ Mailer initialized with custom SMTP server: ${host}`);
  } else {
    console.log(`✉️ Using safe mock mailer for serverless production deployment.`);
    transporter = {
      sendMail: async (mailOptions) => {
        console.log('✉️ [Mock Mailer Send]', mailOptions.to, mailOptions.subject);
        return { messageId: 'mock-id-' + Date.now() };
      }
    };
  }
  return transporter;
}

// Global helper to send email
async function sendMail({ to, subject, html }) {
  try {
    const activeTransporter = await getTransporter();
    const fromAddress = process.env.SMTP_FROM || '"RentEase Platform" <noreply@rentease.com>';
    
    const info = await activeTransporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html
    });

    console.log(`✉️ Email sent successfully to ${to} [ID: ${info.messageId}]`);
    
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 [Ethereal Preview URL] View sent email here: ${previewUrl}`);
      return previewUrl;
    }
    return null;
  } catch (error) {
    console.error('❌ Failed to send transactional email:', error);
    return null;
  }
}

// Styling wrapper template
function getHtmlWrapper(title, contentHtml) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Outfit:wght@400;700;800&display=swap');
          body {
            font-family: 'Inter', system-ui, sans-serif;
            background-color: #f8fafc;
            color: #0f172a;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 4px 20px -2px rgba(0,0,0,0.05);
          }
          .header {
            background: linear-gradient(135deg, #0f172a 0%, #0d9488 100%);
            padding: 40px 30px;
            text-align: center;
            color: #ffffff;
          }
          .header h1 {
            font-family: 'Outfit', sans-serif;
            margin: 0;
            font-size: 28px;
            font-weight: 800;
            letter-spacing: -0.5px;
          }
          .header p {
            margin: 8px 0 0 0;
            font-size: 14px;
            color: #ccfbf1;
            font-weight: 300;
          }
          .body {
            padding: 40px 30px;
            line-height: 1.6;
            font-size: 15px;
          }
          .body h2 {
            font-family: 'Outfit', sans-serif;
            font-size: 20px;
            color: #0f172a;
            margin-top: 0;
          }
          .footer {
            background-color: #f1f5f9;
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
          }
          .button {
            display: inline-block;
            background-color: #0d9488;
            color: #ffffff !important;
            padding: 12px 24px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            margin-top: 15px;
            box-shadow: 0 4px 6px -1px rgba(13,148,136,0.2);
          }
          .card {
            background: #f8fafc;
            border: 1px solid #f1f5f9;
            border-radius: 16px;
            padding: 20px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>RentEase</h1>
            <p>Premium Furniture & Appliance Rental Platform</p>
          </div>
          <div class="body">
            ${contentHtml}
          </div>
          <div class="footer">
            <p>&copy; 2026 RentEase Inc. All rights reserved.</p>
            <p>120 W 81st St, New York, NY 10024</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// 1. Welcome Email
async function sendWelcomeEmail(email, name) {
  const content = `
    <h2>Welcome to RentEase, ${name}! 🎉</h2>
    <p>We are absolutely thrilled to welcome you to our community. RentEase is designed to give you the ultimate flexibility in outfitting your space with top-tier furniture and home appliances without the heavy upfront cost.</p>
    
    <div class="card">
      <h3 style="margin-top: 0; font-family: 'Outfit'; color: #0d9488;">Here's how to get started:</h3>
      <ul style="padding-left: 20px; margin-bottom: 0;">
        <li><strong>Browse Catalog:</strong> Filter items by category, city, and stock availability.</li>
        <li><strong>Flexible Tenure:</strong> Choose lease options from 3 to 24 months.</li>
        <li><strong>White-glove Delivery:</strong> Enjoy express setup at your convenience.</li>
        <li><strong>Extend or Return:</strong> Adjust your leases smoothly online.</li>
      </ul>
    </div>

    <p>Sign in to your account now to start building your cart!</p>
    <div style="text-align: center;">
      <a href="http://localhost:3000/login" class="button">Access Your Dashboard</a>
    </div>
  `;

  return sendMail({
    to: email,
    subject: 'Welcome to RentEase! 🛋️✨',
    html: getHtmlWrapper(`Welcome to RentEase`, content)
  });
}

// 2. Order Checkout Confirmation
async function sendRentalConfirmationEmail(email, name, rentals, deliveryAddress) {
  let rentalItemsHtml = '';
  let grandTotalRent = 0;
  let grandTotalDeposit = 0;

  rentals.forEach((rental) => {
    const product = rental.product || { title: 'Rented Product', monthlyRent: rental.monthlyRent, securityDeposit: rental.securityDeposit };
    const duration = rental.tenure;
    const itemTotal = (rental.monthlyRent * duration) + rental.securityDeposit;

    grandTotalRent += rental.monthlyRent;
    grandTotalDeposit += rental.securityDeposit;

    rentalItemsHtml += `
      <div style="padding: 15px 0; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-weight: 600; color: #0f172a;">${product.title}</span><br>
          <span style="font-size: 13px; color: #64748b;">Duration: ${duration} Months &bull; ${product.city} Delivery</span>
        </div>
        <div style="text-align: right;">
          <span style="font-weight: 600; color: #0d9488;">$${rental.monthlyRent}/mo</span><br>
          <span style="font-size: 12px; color: #64748b;">+$${rental.securityDeposit} Deposit</span>
        </div>
      </div>
    `;
  });

  const estimatedDelivery = rentals[0] ? new Date(rentals[0].deliveryDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '3 days';

  const content = `
    <h2>Your rental is confirmed! 📦</h2>
    <p>Hi ${name}, thank you for choosing RentEase. We've processed your checkout transaction successfully. Our logistics partner will deliver and set up your items shortly.</p>
    
    <div class="card">
      <h3 style="margin-top: 0; font-family: 'Outfit';">Delivery Details</h3>
      <p style="margin: 5px 0; font-size: 14px;"><strong>Address:</strong> ${deliveryAddress}</p>
      <p style="margin: 5px 0; font-size: 14px;"><strong>Scheduled delivery:</strong> ${estimatedDelivery}</p>
    </div>

    <h3 style="font-family: 'Outfit'; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">Order Summary</h3>
    ${rentalItemsHtml}

    <div style="margin-top: 15px; text-align: right; font-size: 15px;">
      <p style="margin: 4px 0;">Total Monthly Rent: <strong>$${grandTotalRent}</strong></p>
      <p style="margin: 4px 0;">Total Security Deposit: <strong>$${grandTotalDeposit}</strong></p>
      <p style="margin: 8px 0 0 0; font-size: 18px; color: #0f172a; font-weight: 700;">Total Charged: <span style="color: #0d9488;">$${grandTotalRent + grandTotalDeposit}</span></p>
    </div>

    <div style="text-align: center; margin-top: 25px;">
      <a href="http://localhost:3000/rentals" class="button">Track Your Active Leases</a>
    </div>
  `;

  return sendMail({
    to: email,
    subject: 'Your RentEase Rental Order is Confirmed! 🚚',
    html: getHtmlWrapper(`Rental Confirmation`, content)
  });
}

// 3. Maintenance Ticket Filed
async function sendMaintenanceTicketCreatedEmail(email, name, ticket, productTitle) {
  const priorityColors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444'
  };
  const priorityColor = priorityColors[ticket.priority] || '#f59e0b';

  const content = `
    <h2>Maintenance ticket logged successfully 🛠️</h2>
    <p>Hi ${name}, we have logged your service request. Our technical staff is reviewing the issue details and scheduling dispatch.</p>

    <div class="card">
      <h3 style="margin-top: 0; font-family: 'Outfit';">Ticket Info</h3>
      <p style="margin: 5px 0; font-size: 14px;"><strong>Item:</strong> ${productTitle}</p>
      <p style="margin: 5px 0; font-size: 14px;"><strong>Priority:</strong> <span style="color: ${priorityColor}; font-weight: bold; text-transform: uppercase;">${ticket.priority}</span></p>
      <p style="margin: 5px 0; font-size: 14px;"><strong>Description:</strong> "${ticket.issue}"</p>
      <p style="margin: 5px 0; font-size: 14px;"><strong>Status:</strong> <span style="background: #e2e8f0; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">PENDING ASSIGNMENT</span></p>
    </div>

    <p>We will contact you via email or phone as soon as our technician is assigned to schedule the service visit.</p>
  `;

  return sendMail({
    to: email,
    subject: `Service Ticket Logged: ${productTitle} 🛠️`,
    html: getHtmlWrapper(`Maintenance Ticket Filed`, content)
  });
}

// 4. Maintenance Ticket Update
async function sendMaintenanceTicketStatusUpdateEmail(email, name, ticket, productTitle, status) {
  const statusLabels = {
    pending: 'Pending Assignment',
    assigned: 'Technician Assigned & Scheduled',
    resolved: 'Resolved & Closed'
  };
  const label = statusLabels[status] || status;

  let extraNote = '';
  if (status === 'assigned') {
    extraNote = '<p>Our field support technician has been scheduled. They will reach out to you shortly to finalize the exact home entry time.</p>';
  } else if (status === 'resolved') {
    extraNote = '<p>We hope the service met your expectations! If you notice any recurring issues with the rented product, please don\'t hesitate to log another ticket.</p>';
  }

  const content = `
    <h2>Your service ticket has been updated! 🔔</h2>
    <p>Hi ${name}, there has been a status update on your service request for <strong>${productTitle}</strong>.</p>

    <div class="card" style="border-left: 4px solid #0d9488;">
      <p style="margin: 5px 0; font-size: 15px;"><strong>New Ticket Status:</strong> <span style="color: #0d9488; font-weight: bold; text-transform: uppercase; font-size: 14px;">${label}</span></p>
      <p style="margin: 5px 0; font-size: 13px; color: #64748b;"><strong>Issue logged:</strong> "${ticket.issue}"</p>
    </div>

    ${extraNote}

    <div style="text-align: center; margin-top: 20px;">
      <a href="http://localhost:3000/maintenance" class="button">View Service History</a>
    </div>
  `;

  return sendMail({
    to: email,
    subject: `[Update] Service Ticket for ${productTitle}: ${label} 🔧`,
    html: getHtmlWrapper(`Service Ticket Update`, content)
  });
}

module.exports = {
  sendWelcomeEmail,
  sendRentalConfirmationEmail,
  sendMaintenanceTicketCreatedEmail,
  sendMaintenanceTicketStatusUpdateEmail
};
