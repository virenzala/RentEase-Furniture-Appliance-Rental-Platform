const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Load environment variables relative to this config directory
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const BUNDLED_DB_FILE = path.join(__dirname, '../data/db.json');
const DATA_DIR = process.env.VERCEL ? '/tmp' : path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const connectionString = process.env.DATABASE_URL;
const isPgConfigured = Boolean(
  connectionString && 
  !connectionString.includes('postgres.example') &&
  !connectionString.includes('<project-id>')
);

let pool = null;
if (isPgConfigured) {
  try {
    pool = new Pool({
      connectionString: connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    });
    pool.on('error', (err) => {
      console.warn('⚠️ Unexpected PG pool background error:', err.message);
    });
  } catch (e) {
    console.warn('⚠️ PG Pool creation failed, using local datastore:', e.message);
    pool = null;
  }
}

// Map model collection names to postgres table names
const tableMap = {
  users: 'users',
  products: 'products',
  rentals: 'rentals',
  maintenanceRequests: 'maintenance_requests'
};

const defaultSeedData = require('../data/db.json');

// In-memory cache fallback for serverless/read-only environments
let memoryDb = null;

// Local JSON DB Helper
function readLocalDb() {
  if (memoryDb && Array.isArray(memoryDb.products) && memoryDb.products.length > 0) {
    return memoryDb;
  }
  
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.products) && parsed.products.length > 0) {
        memoryDb = parsed;
        return memoryDb;
      }
    }
  } catch (e) {
    console.warn('Error reading local DB file:', e.message);
  }
  
  try {
    memoryDb = defaultSeedData || { users: [], products: [], rentals: [], maintenanceRequests: [] };
  } catch (e) {
    memoryDb = { users: [], products: [], rentals: [], maintenanceRequests: [] };
  }
  return memoryDb;
}

function writeLocalDb(data) {
  memoryDb = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.warn('Notice: Local DB file write skipped (read-only filesystem):', e.message);
  }
}

// Initialize DB (Supabase or Local)
let initPromise = null;
async function initDb() {
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    try {
      if (isPgConfigured && pool) {
        console.log('🔄 Initializing Supabase PostgreSQL tables...');
        
        await pool.query(`
          CREATE TABLE IF NOT EXISTS users (
            _id TEXT PRIMARY KEY,
            data JSONB NOT NULL
          );
          ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        `);

        await pool.query(`
          CREATE TABLE IF NOT EXISTS products (
            _id TEXT PRIMARY KEY,
            data JSONB NOT NULL
          );
          ALTER TABLE products ENABLE ROW LEVEL SECURITY;
        `);

        await pool.query(`
          CREATE TABLE IF NOT EXISTS rentals (
            _id TEXT PRIMARY KEY,
            data JSONB NOT NULL
          );
          ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
        `);

        await pool.query(`
          CREATE TABLE IF NOT EXISTS maintenance_requests (
            _id TEXT PRIMARY KEY,
            data JSONB NOT NULL
          );
          ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
        `);

        console.log('⚡ Supabase PostgreSQL tables initialized with RLS enabled successfully');

        // Check if products table has less than 100 products and auto-populate 104 products
        const countRes = await pool.query('SELECT COUNT(*) FROM products');
        const currentCount = parseInt(countRes.rows[0].count, 10);
        if (currentCount < 100) {
          console.log(`🌱 Supabase PostgreSQL has ${currentCount} products (< 100). Auto-populating full 104 catalog...`);
          const initialData = readLocalDb();
          
          if (initialData.users && initialData.users.length > 0) {
            for (const u of initialData.users) {
              await pool.query(
                `INSERT INTO users (_id, data) VALUES ($1, $2) ON CONFLICT (_id) DO UPDATE SET data = $2`,
                [u._id, JSON.stringify(u)]
              );
            }
          }
          
          if (initialData.products && initialData.products.length > 0) {
            for (const p of initialData.products) {
              await pool.query(
                `INSERT INTO products (_id, data) VALUES ($1, $2) ON CONFLICT (_id) DO UPDATE SET data = $2`,
                [p._id, JSON.stringify(p)]
              );
            }
          }
          console.log('🎉 Supabase PostgreSQL auto-seeded 104 products successfully!');
        }
      } else {
        console.log('📂 Using Local JSON Datastore (backend/data/db.json)');
        readLocalDb();
      }
    } catch (err) {
      console.warn('⚠️ Supabase PG connection failed, falling back to local JSON database:', err.message);
      readLocalDb();
    }
  })();
  
  return initPromise;
}

// Trigger initial setup
initDb().catch(err => {
  console.warn('Initial DB setup completed with fallback mode:', err.message);
});

// Mongoose-like Model simulator (supports Supabase PostgreSQL & Local JSON datastore)
class Model {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.tableName = tableMap[collectionName] || collectionName;
  }

  generateId() {
    return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  }

  async find(query = {}) {
    try {
      await initDb();
    } catch (e) {
      console.warn('DB init error, proceeding with local fallback:', e.message);
    }
    
    let items = [];
    
    if (isPgConfigured && pool) {
      try {
        const res = await pool.query(`SELECT data FROM ${this.tableName}`);
        items = res.rows.map(row => row.data);
      } catch (err) {
        const db = readLocalDb();
        items = db[this.collectionName] || [];
      }
    } else {
      const db = readLocalDb();
      items = db[this.collectionName] || [];
    }

    // Perform in-memory filter matching original behavior safely
    return (items || []).filter(item => {
      if (!item) return false;
      for (const key in query) {
        if (query[key] !== undefined) {
          const itemVal = item[key];
          const queryVal = query[key];

          if (Array.isArray(queryVal)) {
            if (!queryVal.includes(itemVal)) return false;
          } else if (typeof queryVal === 'object' && queryVal !== null) {
            const operator = Object.keys(queryVal)[0];
            const value = queryVal[operator];
            if (operator === '$in') {
              if (!Array.isArray(value) || !value.includes(itemVal)) return false;
            } else if (operator === '$ne') {
              if (itemVal === value) return false;
            }
          } else {
            if (typeof itemVal === 'string' && typeof queryVal === 'string') {
              if (itemVal.trim().toLowerCase() !== queryVal.trim().toLowerCase()) return false;
            } else if (itemVal !== queryVal) {
              return false;
            }
          }
        }
      }
      return true;
    });
  }

  async findOne(query = {}) {
    try {
      await initDb();
    } catch (e) {}
    const items = await this.find(query);
    return items[0] || null;
  }

  async findById(id) {
    if (!id) return null;
    try {
      await initDb();
    } catch (e) {}
    
    if (isPgConfigured && pool) {
      try {
        const res = await pool.query(`SELECT data FROM ${this.tableName} WHERE _id = $1`, [id]);
        if (res.rows.length === 0) return null;
        return res.rows[0].data;
      } catch (err) {
        const db = readLocalDb();
        const items = db[this.collectionName] || [];
        return items.find(item => item._id === id) || null;
      }
    } else {
      const db = readLocalDb();
      const items = db[this.collectionName] || [];
      return items.find(item => item._id === id) || null;
    }
  }

  async create(data) {
    await initDb();
    const _id = data._id || this.generateId();
    const newItem = {
      _id,
      createdAt: data.createdAt || new Date().toISOString(),
      ...data
    };

    if (isPgConfigured && pool) {
      try {
        await pool.query(
          `INSERT INTO ${this.tableName} (_id, data) VALUES ($1, $2) ON CONFLICT (_id) DO UPDATE SET data = $2`,
          [_id, JSON.stringify(newItem)]
        );
        return newItem;
      } catch (err) {
        console.warn(`PG Create error in ${this.tableName}, falling back to local JSON:`, err.message);
      }
    }

    const db = readLocalDb();
    if (!db[this.collectionName]) db[this.collectionName] = [];
    const index = db[this.collectionName].findIndex(item => item._id === _id);
    if (index >= 0) {
      db[this.collectionName][index] = newItem;
    } else {
      db[this.collectionName].push(newItem);
    }
    writeLocalDb(db);
    return newItem;
  }

  async findByIdAndUpdate(id, updateData, options = { new: true }) {
    await initDb();
    const currentItem = await this.findById(id);
    if (!currentItem) return null;

    let updatedItem = { ...currentItem };

    if (updateData.$push) {
      for (const key in updateData.$push) {
        if (!Array.isArray(updatedItem[key])) {
          updatedItem[key] = [];
        }
        updatedItem[key].push(updateData.$push[key]);
      }
      const directUpdates = { ...updateData };
      delete directUpdates.$push;
      updatedItem = { ...updatedItem, ...directUpdates };
    } else {
      updatedItem = { ...updatedItem, ...updateData };
    }

    if (isPgConfigured && pool) {
      try {
        await pool.query(
          `UPDATE ${this.tableName} SET data = $1 WHERE _id = $2`,
          [JSON.stringify(updatedItem), id]
        );
        return updatedItem;
      } catch (err) {
        console.warn(`PG Update error in ${this.tableName}, falling back to local JSON:`, err.message);
      }
    }

    const db = readLocalDb();
    const items = db[this.collectionName] || [];
    const index = items.findIndex(item => item._id === id);
    if (index >= 0) {
      db[this.collectionName][index] = updatedItem;
      writeLocalDb(db);
    }
    return updatedItem;
  }

  async findByIdAndDelete(id) {
    await initDb();
    const item = await this.findById(id);
    if (!item) return null;

    if (isPgConfigured && pool) {
      try {
        await pool.query(`DELETE FROM ${this.tableName} WHERE _id = $1`, [id]);
        return item;
      } catch (err) {
        console.warn(`PG Delete error in ${this.tableName}, falling back to local JSON:`, err.message);
      }
    }

    const db = readLocalDb();
    const items = db[this.collectionName] || [];
    db[this.collectionName] = items.filter(i => i._id !== id);
    writeLocalDb(db);
    return item;
  }

  async deleteMany(query = {}) {
    await initDb();
    const itemsToDelete = await this.find(query);
    if (itemsToDelete.length === 0) return { deletedCount: 0 };
    
    const ids = itemsToDelete.map(item => item._id);

    if (isPgConfigured && pool) {
      try {
        await pool.query(`DELETE FROM ${this.tableName} WHERE _id = ANY($1)`, [ids]);
        return { deletedCount: ids.length };
      } catch (err) {
        console.warn(`PG DeleteMany error in ${this.tableName}, falling back to local JSON:`, err.message);
      }
    }

    const db = readLocalDb();
    const items = db[this.collectionName] || [];
    db[this.collectionName] = items.filter(item => !ids.includes(item._id));
    writeLocalDb(db);
    return { deletedCount: ids.length };
  }
}

// Exports Mongoose-style model simulation (Supabase + Local JSON Dual Engine)
module.exports = {
  User: new Model('users'),
  Product: new Model('products'),
  Rental: new Model('rentals'),
  MaintenanceRequest: new Model('maintenanceRequests'),
  dbFile: DB_FILE,
  readDb: readLocalDb,
  writeDb: writeLocalDb,
  checkDbHealth: async () => {
    if (isPgConfigured && pool) {
      try {
        const res = await pool.query('SELECT NOW()');
        return { connected: true, provider: 'Supabase PostgreSQL', timestamp: res.rows[0].now };
      } catch (err) {
        return { connected: false, provider: 'Local JSON Fallback', error: err.message };
      }
    }
    return { connected: true, provider: 'Local JSON Datastore', timestamp: new Date().toISOString() };
  }
};
