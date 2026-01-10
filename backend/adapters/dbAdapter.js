const { getDatabaseType } = require('../config/database');

// MongoDB models
const MongoUser = require('../models/User');
const MongoTrip = require('../models/Trip');
const MongoEvent = require('../models/Event');
const MongoBooking = require('../models/Booking');
const MongoEventBooking = require('../models/EventBooking');

// MySQL models (will be initialized when using MySQL)
let MySQLModels = {};

// Initialize MySQL models if needed
const initMySQLModels = () => {
  const { initializeModels } = require('../models/mysql');
  MySQLModels = initializeModels();
};

// Get the appropriate model based on DB type
const getModel = (modelName) => {
  const dbType = getDatabaseType();

  if (dbType === 'mysql') {
    if (Object.keys(MySQLModels).length === 0) {
      initMySQLModels();
    }
    return MySQLModels[modelName];
  } else {
    // MongoDB
    const models = {
      User: MongoUser,
      Trip: MongoTrip,
      Event: MongoEvent,
      Booking: MongoBooking,
      EventBooking: MongoEventBooking
    };
    return models[modelName];
  }
};

// Adapter for database operations
class DBAdapter {
  constructor(modelName) {
    this.modelName = modelName;
    this.model = getModel(modelName);
    this.dbType = getDatabaseType();
  }

  // Find operations
  async find(query = {}, options = {}) {
    if (this.dbType === 'mysql') {
      const { limit, skip, sort, select, populate } = options;
      const whereClause = this._convertQuery(query);
      const queryOptions = {
        where: whereClause
      };

      if (limit) queryOptions.limit = limit;
      if (skip) queryOptions.offset = skip;
      if (sort) queryOptions.order = this._convertSort(sort);
      if (select) queryOptions.attributes = select.split(' ');
      if (populate) queryOptions.include = this._convertPopulate(populate);

      return await this.model.findAll(queryOptions);
    } else {
      // MongoDB
      let query = this.model.find(query);
      if (options.limit) query = query.limit(options.limit);
      if (options.skip) query = query.skip(options.skip);
      if (options.sort) query = query.sort(options.sort);
      if (options.select) query = query.select(options.select);
      if (options.populate) query = query.populate(options.populate);
      return await query;
    }
  }

  async findById(id, options = {}) {
    if (this.dbType === 'mysql') {
      const queryOptions = {};
      if (options.populate) queryOptions.include = this._convertPopulate(options.populate);
      return await this.model.findByPk(id, queryOptions);
    } else {
      let query = this.model.findById(id);
      if (options.populate) query = query.populate(options.populate);
      return await query;
    }
  }

  async findOne(query = {}, options = {}) {
    if (this.dbType === 'mysql') {
      const whereClause = this._convertQuery(query);
      const queryOptions = { where: whereClause };
      if (options.populate) queryOptions.include = this._convertPopulate(options.populate);
      return await this.model.findOne(queryOptions);
    } else {
      let query = this.model.findOne(query);
      if (options.populate) query = query.populate(options.populate);
      return await query;
    }
  }

  // Create operation
  async create(data) {
    if (this.dbType === 'mysql') {
      return await this.model.create(data);
    } else {
      return await this.model.create(data);
    }
  }

  // Update operations
  async findByIdAndUpdate(id, update, options = {}) {
    if (this.dbType === 'mysql') {
      const record = await this.model.findByPk(id);
      if (!record) return null;
      await record.update(update);
      return record;
    } else {
      return await this.model.findByIdAndUpdate(id, update, { new: true, ...options });
    }
  }

  async updateOne(query, update) {
    if (this.dbType === 'mysql') {
      const whereClause = this._convertQuery(query);
      await this.model.update(update, { where: whereClause });
      return await this.model.findOne({ where: whereClause });
    } else {
      return await this.model.updateOne(query, update);
    }
  }

  // Delete operations
  async findByIdAndDelete(id) {
    if (this.dbType === 'mysql') {
      const record = await this.model.findByPk(id);
      if (!record) return null;
      await record.destroy();
      return record;
    } else {
      return await this.model.findByIdAndDelete(id);
    }
  }

  async deleteOne(query) {
    if (this.dbType === 'mysql') {
      const whereClause = this._convertQuery(query);
      const record = await this.model.findOne({ where: whereClause });
      if (record) await record.destroy();
      return record;
    } else {
      return await this.model.deleteOne(query);
    }
  }

  // Count operation
  async countDocuments(query = {}) {
    if (this.dbType === 'mysql') {
      const whereClause = this._convertQuery(query);
      return await this.model.count({ where: whereClause });
    } else {
      return await this.model.countDocuments(query);
    }
  }

  // Helper methods for MySQL query conversion
  _convertQuery(mongoQuery) {
    // Convert MongoDB query to Sequelize where clause
    // This is a simplified version - extend as needed
    const sequelizeQuery = {};

    for (const [key, value] of Object.entries(mongoQuery)) {
      if (typeof value === 'object' && value !== null) {
        // Handle operators like $gte, $lte, etc.
        if (value.$gte || value.$lte || value.$gt || value.$lt) {
          sequelizeQuery[key] = {};
          if (value.$gte) sequelizeQuery[key][Symbol.for('gte')] = value.$gte;
          if (value.$lte) sequelizeQuery[key][Symbol.for('lte')] = value.$lte;
          if (value.$gt) sequelizeQuery[key][Symbol.for('gt')] = value.$gt;
          if (value.$lt) sequelizeQuery[key][Symbol.for('lt')] = value.$lt;
        } else if (value.$in) {
          sequelizeQuery[key] = value.$in;
        } else if (value.$or) {
          sequelizeQuery[Symbol.for('or')] = value.$or.map(q => this._convertQuery(q));
        } else {
          sequelizeQuery[key] = value;
        }
      } else {
        sequelizeQuery[key] = value;
      }
    }

    return sequelizeQuery;
  }

  _convertSort(sortString) {
    // Convert MongoDB sort string to Sequelize order array
    const sortFields = sortString.split(' ');
    return sortFields.map(field => {
      if (field.startsWith('-')) {
        return [field.substring(1), 'DESC'];
      }
      return [field, 'ASC'];
    });
  }

  _convertPopulate(populate) {
    // Convert MongoDB populate to Sequelize include
    // This is a simplified version
    if (typeof populate === 'string') {
      return [{ association: populate }];
    }
    if (Array.isArray(populate)) {
      return populate.map(p => ({ association: p }));
    }
    return [];
  }

  // Save method (for instances)
  async save(instance) {
    if (this.dbType === 'mysql') {
      return await instance.save();
    } else {
      return await instance.save();
    }
  }
}

module.exports = DBAdapter;
