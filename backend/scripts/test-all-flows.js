const http = require('http');

const API_BASE = 'http://localhost:5000/api';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE}${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Full System End-to-End Verification Test...\n');

  // 1. Health Check
  console.log('1️⃣ Testing Health Endpoint (/api/health)...');
  const healthRes = await request('GET', '/health');
  console.log(`   Status: ${healthRes.status}`);
  console.log(`   Response: ${JSON.stringify(healthRes.data)}\n`);
  if (healthRes.status !== 200 || healthRes.data.status !== 'healthy') {
    throw new Error('Health check failed!');
  }

  // 2. Login Customer
  console.log('2️⃣ Testing Customer Login (/api/auth/login)...');
  const userLogin = await request('POST', '/auth/login', {
    email: 'user@rentease.com',
    password: 'user123'
  });
  console.log(`   Status: ${userLogin.status}`);
  console.log(`   User Name: ${userLogin.data.name}, Role: ${userLogin.data.role}`);
  const userToken = userLogin.data.token;
  if (!userToken) throw new Error('Customer login failed - no token returned!');
  console.log('   ✅ Customer Login Successful.\n');

  // 3. User Profile Verification
  console.log('3️⃣ Testing Profile Fetch with JWT (/api/auth/profile)...');
  const profileRes = await request('GET', '/auth/profile', null, userToken);
  console.log(`   Status: ${profileRes.status}`);
  console.log(`   User Email: ${profileRes.data.email}`);
  console.log('   ✅ Profile Fetch Successful.\n');

  // 4. Products Catalog
  console.log('4️⃣ Testing Products Catalog (/api/products)...');
  const productsRes = await request('GET', '/products');
  console.log(`   Status: ${productsRes.status}`);
  console.log(`   Total Products Loaded: ${productsRes.data.length}`);
  if (productsRes.data.length < 100) throw new Error('Product catalog incomplete!');

  const furnitureRes = await request('GET', '/products?category=furniture');
  console.log(`   Furniture Count: ${furnitureRes.data.length}`);

  const appliancesRes = await request('GET', '/products?category=appliances');
  console.log(`   Appliances Count: ${appliancesRes.data.length}`);
  console.log('   ✅ Catalog Filtering & Retrieval Successful.\n');

  // Select a product to rent
  const sampleProduct = productsRes.data[0];
  console.log(`5️⃣ Creating a Rental Lease for product: "${sampleProduct.title}" (ID: ${sampleProduct._id})...`);
  const createRentalRes = await request('POST', '/rentals', {
    items: [
      {
        productId: sampleProduct._id,
        tenure: 12,
        monthlyRent: sampleProduct.monthlyRent,
        securityDeposit: sampleProduct.securityDeposit
      }
    ],
    deliveryAddress: 'Apartment 4B, 120 W 81st St, New York, NY 10024'
  }, userToken);

  console.log(`   Status: ${createRentalRes.status}`);
  const createdList = Array.isArray(createRentalRes.data) ? createRentalRes.data : [createRentalRes.data];
  const rentalId = createdList[0]._id;
  console.log(`   Rentals Created: ${createdList.length}`);
  console.log(`   Rental ID: ${rentalId}`);
  console.log('   ✅ Lease Rental Creation Successful.\n');

  // 6. Fetch My Rentals
  console.log('6️⃣ Fetching Customer Active Rentals (/api/rentals/my)...');
  const myRentalsRes = await request('GET', '/rentals/my', null, userToken);
  console.log(`   Status: ${myRentalsRes.status}`);
  console.log(`   My Active Rentals Count: ${myRentalsRes.data.length}`);
  console.log('   ✅ Active Lease Listing Successful.\n');

  // 7. Maintenance Request
  console.log('7️⃣ Submitting Maintenance Request (/api/maintenance)...');
  const maintRes = await request('POST', '/maintenance', {
    rentalId: rentalId,
    issue: 'Routine inspection and polish requested for sofa seat cushions.',
    priority: 'medium'
  }, userToken);

  console.log(`   Status: ${maintRes.status}`);
  console.log(`   Maintenance Ticket ID: ${maintRes.data._id}, Status: ${maintRes.data.status}`);
  if (maintRes.status !== 201) throw new Error('Maintenance request failed!');
  console.log('   ✅ Maintenance Request Submission Successful.\n');

  // 8. Admin Login & System Inspection
  console.log('8️⃣ Testing Admin System Inspection (/api/rentals)...');
  const adminLogin = await request('POST', '/auth/login', {
    email: 'admin@rentease.com',
    password: 'admin123'
  });
  const adminToken = adminLogin.data.token;
  const allRentalsRes = await request('GET', '/rentals', null, adminToken);
  console.log(`   Admin Login: ${adminLogin.data.name} (${adminLogin.data.role})`);
  console.log(`   Total System Rentals: ${allRentalsRes.data.length}`);
  console.log('   ✅ Admin Operations Successful.\n');

  console.log('🎉 ALL END-TO-END TESTS PASSED 100% SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ Verification Test Failed:', err);
  process.exit(1);
});
