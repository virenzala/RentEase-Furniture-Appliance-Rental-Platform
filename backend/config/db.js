const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Load environment variables relative to this config directory
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const DB_FILE = path.join(__dirname, '../data/db.json');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("FATAL: DATABASE_URL environment variable is missing!");
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// Map model collection names to postgres table names
const tableMap = {
  users: 'users',
  products: 'products',
  rentals: 'rentals',
  maintenanceRequests: 'maintenance_requests'
};

// Initialize Supabase tables
let initPromise = null;
async function initDb() {
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
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
    } catch (err) {
      console.error('❌ Failed to initialize Supabase tables:', err);
      initPromise = null; // Allow retry
      throw err;
    }
  })();
  
  return initPromise;
}

// Trigger initial setup
initDb().catch(err => {
  console.error('Initial DB setup failed, will retry on demand.', err);
});

// Mongoose-like Model simulator (supports Supabase PostgreSQL backend)
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
    try {
      const res = await pool.query(`SELECT data FROM ${this.tableName}`);
      const items = res.rows.map(row => row.data);
      
      // Perform in-memory filter matching original JSON DB behavior
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
              if (item[key] !== query[key]) return false;
            }
          }
        }
        return true;
      });
    } catch (err) {
      console.error(`Supabase find error in ${this.tableName}:`, err);
      throw err;
    }
  }

  async findOne(query = {}) {
    await initDb();
    const items = await this.find(query);
    return items[0] || null;
  }

  async findById(id) {
    if (!id) return null;
    await initDb();
    try {
      const res = await pool.query(`SELECT data FROM ${this.tableName} WHERE _id = $1`, [id]);
      if (res.rows.length === 0) return null;
      return res.rows[0].data;
    } catch (err) {
      console.error(`Supabase findById error in ${this.tableName}:`, err);
      throw err;
    }
  }

  async create(data) {
    await initDb();
    try {
      const _id = data._id || this.generateId();
      const newItem = {
        _id,
        createdAt: data.createdAt || new Date().toISOString(),
        ...data
      };
      
      await pool.query(
        `INSERT INTO ${this.tableName} (_id, data) VALUES ($1, $2) ON CONFLICT (_id) DO UPDATE SET data = $2`,
        [_id, JSON.stringify(newItem)]
      );
      return newItem;
    } catch (err) {
      console.error(`Supabase create error in ${this.tableName}:`, err);
      throw err;
    }
  }

  async findByIdAndUpdate(id, updateData, options = { new: true }) {
    await initDb();
    try {
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

      await pool.query(
        `UPDATE ${this.tableName} SET data = $1 WHERE _id = $2`,
        [JSON.stringify(updatedItem), id]
      );
      return updatedItem;
    } catch (err) {
      console.error(`Supabase update error in ${this.tableName}:`, err);
      return null;
    }
  }

  async findByIdAndDelete(id) {
    await initDb();
    try {
      const item = await this.findById(id);
      if (!item) return null;
      await pool.query(`DELETE FROM ${this.tableName} WHERE _id = $1`, [id]);
      return item;
    } catch (err) {
      console.error(`Supabase delete error in ${this.tableName}:`, err);
      return null;
    }
  }

  async deleteMany(query = {}) {
    await initDb();
    try {
      const itemsToDelete = await this.find(query);
      if (itemsToDelete.length === 0) return { deletedCount: 0 };
      
      const ids = itemsToDelete.map(item => item._id);
      await pool.query(`DELETE FROM ${this.tableName} WHERE _id = ANY($1)`, [ids]);
      return { deletedCount: ids.length };
    } catch (err) {
      console.error(`Supabase deleteMany error in ${this.tableName}:`, err);
      return { deletedCount: 0 };
    }
  }
}

// Exports Mongoose-style model simulation (Supabase version)
module.exports = {
  User: new Model('users'),
  Product: new Model('products'),
  Rental: new Model('rentals'),
  MaintenanceRequest: new Model('maintenanceRequests'),
  dbFile: DB_FILE,
  readDb: () => ({ users: [], products: [], rentals: [], maintenanceRequests: [] }),
  writeDb: () => {}
};
