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
  pool = new Pool({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });
}

// Map model collection names to postgres table names
const tableMap = {
  users: 'users',
  products: 'products',
  rentals: 'rentals',
  maintenanceRequests: 'maintenance_requests'
};

// In-memory cache fallback for serverless/read-only environments
let memoryDb = null;

// Local JSON DB Helper
function readLocalDb() {
  if (memoryDb) return memoryDb;
  
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      memoryDb = JSON.parse(content);
      return memoryDb;
    }
    if (fs.existsSync(BUNDLED_DB_FILE)) {
      const content = fs.readFileSync(BUNDLED_DB_FILE, 'utf-8');
      memoryDb = JSON.parse(content);
      return memoryDb;
    }
  } catch (e) {
    console.warn('Error reading local DB:', e.message);
  }
  
  memoryDb = { users: [], products: [], rentals: [], maintenanceRequests: [] };
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
    if (isPgConfigured && pool) {
      try {
        console.log('🔄 Initializing Supabase PostgreSQL tables...');
        
        await pool.query(`
          CREATE TABLE IF NOT EXISTS users (
            _id TEXT PRIMARY KEY,
            data JSONB NOT NULL
          );
        `);

        await pool.query(`
          CREATE TABLE IF NOT EXISTS products (
            _id TEXT PRIMARY KEY,
            data JSONB NOT NULL
          );
        `);

        await pool.query(`
          CREATE TABLE IF NOT EXISTS rentals (
            _id TEXT PRIMARY KEY,
            data JSONB NOT NULL
          );
        `);

        await pool.query(`
          CREATE TABLE IF NOT EXISTS maintenance_requests (
            _id TEXT PRIMARY KEY,
            data JSONB NOT NULL
          );
        `);

        console.log('⚡ Supabase PostgreSQL tables initialized successfully');

        // Check if products table is empty and auto-populate 104 products
        const countRes = await pool.query('SELECT COUNT(*) FROM products');
        if (parseInt(countRes.rows[0].count, 10) === 0) {
          console.log('🌱 Supabase PostgreSQL products table is empty. Auto-populating catalog...');
          const initialData = readLocalDb();
          
          if (initialData.users && initialData.users.length > 0) {
            for (const u of initialData.users) {
              await pool.query(
                `INSERT INTO users (_id, data) VALUES ($1, $2) ON CONFLICT (_id) DO NOTHING`,
                [u._id, JSON.stringify(u)]
              );
            }
          }
          
          if (initialData.products && initialData.products.length > 0) {
            for (const p of initialData.products) {
              await pool.query(
                `INSERT INTO products (_id, data) VALUES ($1, $2) ON CONFLICT (_id) DO NOTHING`,
                [p._id, JSON.stringify(p)]
              );
            }
          }
          console.log('🎉 Supabase PostgreSQL auto-seeded default catalog successfully!');
        }
      } catch (err) {
        console.warn('⚠️ Supabase PG connection failed, falling back to local JSON database:', err.message);
        readLocalDb();
      }
    } else {
      console.log('📂 Using Local JSON Datastore (backend/data/db.json)');
      readLocalDb();
    }
  })();
  
  return initPromise;
}

// Trigger initial setup
initDb().catch(err => {
  console.warn('Initial DB setup completed with fallback mode.');
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
    await initDb();
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

    // Perform in-memory filter matching original behavior
    return items.filter(item => {
      for (const key in query) {
        if (query[key] !== undefined) {
          if (Array.isArray(query[key])) {
            if (!query[key].includes(item[key])) return false;
          } else if (typeof query[key] === 'object' && query[key] !== null) {
            const operator = Object.keys(query[key])[0];
            const value = query[key][operator];
            if (operator === '$in') {
              if (!value.includes(item[key])) return false;
            } else if (operator === '$ne') {
              if (item[key] === value) return false;
            }
          } else {
            if (typeof item[key] === 'string' && typeof query[key] === 'string') {
              if (item[key].trim().toLowerCase() !== query[key].trim().toLowerCase()) return false;
            } else if (item[key] !== query[key]) {
              return false;
            }
          }
        }
      }
      return true;
    });
  }

  async findOne(query = {}) {
    await initDb();
    const items = await this.find(query);
    return items[0] || null;
  }

  async findById(id) {
    if (!id) return null;
    await initDb();
    
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
