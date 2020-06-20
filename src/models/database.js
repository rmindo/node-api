'use strict';

/**
 * Modules
 */
const mongo = require('mongoose');

// Connect
mongo.connect(process.env.DB_HOST, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Success connection
mongo.connection.once('open', () => console.log('Successfully connected to database'));


// Schema
const Schema = mongo.Schema;

// Create schema
const users = new Schema({
	_id: String,
	email: String,
	lastname: String,
	firstname: String,
});

// Export mongoose and model users
module.exports.mongo = mongo;
module.exports.users = mongo.model('users', users);