const path = require('path');
// Load environment variables relative to backend folder
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const {
  sendWelcomeEmail,
  sendRentalConfirmationEmail,
  sendMaintenanceTicketCreatedEmail,
  sendMaintenanceTicketStatusUpdateEmail
} = require('../services/emailService');

async function test() {
  console.log('🧪 Starting transactional email verification test...');

  try {
    // 1. Welcome Email
    console.log('\n--- 1. Welcome Email ---');
    const welcomeUrl = await sendWelcomeEmail('test-user@rentease.com', 'Jane Doe');
    if (welcomeUrl) console.log(`👉 Preview Welcome Email: ${welcomeUrl}`);

    // 2. Rental Confirmation
    console.log('\n--- 2. Rental Confirmation ---');
    const mockRentals = [
      {
        tenure: 12,
        monthlyRent: 45,
        securityDeposit: 150,
        deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        product: {
          title: 'Nordic 3-Seater Fabric Sofa',
          city: 'New York'
        }
      },
      {
        tenure: 6,
        monthlyRent: 85,
        securityDeposit: 250,
        deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        product: {
          title: 'Premium Smart Refrigerator 400L',
          city: 'New York'
        }
      }
    ];
    const rentalUrl = await sendRentalConfirmationEmail(
      'test-user@rentease.com',
      'Jane Doe',
      mockRentals,
      'Apartment 4B, 120 W 81st St, New York, NY 10024'
    );
    if (rentalUrl) console.log(`👉 Preview Rental Confirmation: ${rentalUrl}`);

    // 3. Maintenance Ticket Filed
    console.log('\n--- 3. Maintenance Ticket Filed ---');
    const mockTicket = {
      priority: 'high',
      issue: 'The refrigerator ice maker is leaking water on the floor.'
    };
    const ticketCreatedUrl = await sendMaintenanceTicketCreatedEmail(
      'test-user@rentease.com',
      'Jane Doe',
      mockTicket,
      'Premium Smart Refrigerator 400L'
    );
    if (ticketCreatedUrl) console.log(`👉 Preview Ticket Filed: ${ticketCreatedUrl}`);

    // 4. Maintenance Status Update
    console.log('\n--- 4. Maintenance Status Update ---');
    const ticketUpdateUrl = await sendMaintenanceTicketStatusUpdateEmail(
      'test-user@rentease.com',
      'Jane Doe',
      mockTicket,
      'Premium Smart Refrigerator 400L',
      'assigned'
    );
    if (ticketUpdateUrl) console.log(`👉 Preview Ticket Update: ${ticketUpdateUrl}`);

    console.log('\n✅ All email triggers completed successfully!');
  } catch (error) {
    console.error('❌ Email verification test failed:', error);
  } finally {
    process.exit(0);
  }
}

test();
