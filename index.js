'use strict';

/**
 * Modules
 */
const env = require('dotenv');

/**
 * HTTP
 */
const http = require('./src/http');

/**
 * Environment
 */
env.config();

/**
 * Run server
 */
http.run(2000);