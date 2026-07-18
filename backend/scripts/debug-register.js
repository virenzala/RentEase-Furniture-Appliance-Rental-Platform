const { User } = require('../config/db');
const bcrypt = require('bcryptjs');

async function run() {
  try {
    const email = 'test' + Math.random().toString(36).substring(7) + '@test.com';
    const password = 'testpassword';
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = {
      _id: 'usr_test_' + Date.now(),
      createdAt: new Date().toISOString(),
      name: 'Test User',
      email: email,
      password: hashedPassword,
      role: 'user',
      phone: '1234567890',
      address: 'Test Address'
    };
    
    console.log('Inserting test user via User model:', newUser);
    await User.create(newUser);
    console.log('User inserted successfully!');
    
    // Query it back
    const fetchedUser = await User.findOne({ email });
    console.log('Fetched user:', fetchedUser);

    // Clean up
    await User.findByIdAndDelete(newUser._id);
    console.log('Cleaned up successfully!');
  } catch (err) {
    console.error('Registration test failed:', err);
  } finally {
    process.exit(0);
  }
}
run();
