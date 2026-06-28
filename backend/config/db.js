const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const dns = require('dns');

// Configure DNS to bypass local router lookup failures for Atlas SRV
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Load environment variables relative to this config directory
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const DB_FILE = path.join(__dirname, '../data/db.json');
const isMongo = !!process.env.MONGODB_URI;

let mongoClient = null;
let mongoDb = null;

if (isMongo) {
  mongoClient = new MongoClient(process.env.MONGODB_URI);
}

async function getMongoCollection(collectionName) {
  if (!mongoDb) {
    await mongoClient.connect();
    // MongoDB Atlas URI can specify a database name, MongoClient will use it by default
    mongoDb = mongoClient.db();
  }
  return mongoDb.collection(collectionName);
}

// Ensure database file and directory exist (for local JSON DB fallback)
function initDb() {
  if (isMongo) return;
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({
      users: [],
      products: [],
      rentals: [],
      maintenanceRequests: []
    }, null, 2));
  }
}

initDb();

// Helper to read DB (local JSON)
function readDb() {
  try {
    initDb();
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading JSON DB, resetting...', err);
    return { users: [], products: [], rentals: [], maintenanceRequests: [] };
  }
}

// Helper to write DB (local JSON)
function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing JSON DB:', err);
  }
}

// Mongoose-like Model simulator (supports Local JSON and MongoDB dynamically)
class Model {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  generateId() {
    return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  }

  async find(query = {}) {
    if (isMongo) {
      try {
        const col = await getMongoCollection(this.collectionName);
        return await col.find(query).toArray();
      } catch (err) {
        console.error(`MongoDB find error in ${this.collectionName}:`, err);
        return [];
      }
    }

    const db = readDb();
    const items = db[this.collectionName] || [];
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
  }

  async findOne(query = {}) {
    if (isMongo) {
      try {
        const col = await getMongoCollection(this.collectionName);
        return await col.findOne(query);
      } catch (err) {
        console.error(`MongoDB findOne error in ${this.collectionName}:`, err);
        return null;
      }
    }
    const items = await this.find(query);
    return items[0] || null;
  }

  async findById(id) {
    if (!id) return null;
    if (isMongo) {
      try {
        const col = await getMongoCollection(this.collectionName);
        return await col.findOne({ _id: id });
      } catch (err) {
        console.error(`MongoDB findById error in ${this.collectionName}:`, err);
        return null;
      }
    }
    const db = readDb();
    const items = db[this.collectionName] || [];
    return items.find(item => item._id === id || item.id === id) || null;
  }

  async create(data) {
    if (isMongo) {
      try {
        const col = await getMongoCollection(this.collectionName);
        const newItem = {
          _id: this.generateId(),
          createdAt: new Date().toISOString(),
          ...data
        };
        await col.insertOne(newItem);
        return newItem;
      } catch (err) {
        console.error(`MongoDB create error in ${this.collectionName}:`, err);
        throw err;
      }
    }

    const db = readDb();
    const newItem = {
      _id: this.generateId(),
      createdAt: new Date().toISOString(),
      ...data
    };
    db[this.collectionName].push(newItem);
    writeDb(db);
    return newItem;
  }

  async findByIdAndUpdate(id, updateData, options = { new: true }) {
    if (isMongo) {
      try {
        const col = await getMongoCollection(this.collectionName);
        let updateDoc = {};
        if (updateData.$push) {
          updateDoc.$push = updateData.$push;
          const directUpdates = { ...updateData };
          delete directUpdates.$push;
          if (Object.keys(directUpdates).length > 0) {
            updateDoc.$set = directUpdates;
          }
        } else {
          if (Object.keys(updateData).length > 0) {
            updateDoc.$set = updateData;
          }
        }

        if (Object.keys(updateDoc).length > 0) {
          await col.updateOne({ _id: id }, updateDoc);
        }
        return await this.findById(id);
      } catch (err) {
        console.error(`MongoDB update error in ${this.collectionName}:`, err);
        return null;
      }
    }

    const db = readDb();
    const items = db[this.collectionName] || [];
    const index = items.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;

    const currentItem = items[index];
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

    db[this.collectionName][index] = updatedItem;
    writeDb(db);
    return updatedItem;
  }

  async findByIdAndDelete(id) {
    if (isMongo) {
      try {
        const col = await getMongoCollection(this.collectionName);
        const item = await this.findById(id);
        if (!item) return null;
        await col.deleteOne({ _id: id });
        return item;
      } catch (err) {
        console.error(`MongoDB delete error in ${this.collectionName}:`, err);
        return null;
      }
    }

    const db = readDb();
    const items = db[this.collectionName] || [];
    const index = items.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;
    const deleted = items.splice(index, 1)[0];
    writeDb(db);
    return deleted;
  }

  async deleteMany(query = {}) {
    if (isMongo) {
      try {
        const col = await getMongoCollection(this.collectionName);
        const result = await col.deleteMany(query);
        return { deletedCount: result.deletedCount };
      } catch (err) {
        console.error(`MongoDB deleteMany error in ${this.collectionName}:`, err);
        return { deletedCount: 0 };
      }
    }

    const db = readDb();
    const items = db[this.collectionName] || [];
    const remaining = items.filter(item => {
      for (const key in query) {
        if (item[key] === query[key]) return false;
      }
      return true;
    });
    db[this.collectionName] = remaining;
    writeDb(db);
    return { deletedCount: items.length - remaining.length };
  }
}

// Exports Mongoose-style model simulation
module.exports = {
  User: new Model('users'),
  Product: new Model('products'),
  Rental: new Model('rentals'),
  MaintenanceRequest: new Model('maintenanceRequests'),
  dbFile: DB_FILE,
  readDb,
  writeDb
};
