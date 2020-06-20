/**
 * Crytography
 */
const crypto = require('crypto');


/**
 * Export functions
 */
const fn = module.exports = {};


/**
 * Check if property exist
 * @param {mixed} key - A property name
 * @param {object} data - The data where to search
 */
fn.has = (key, data) => {
  if(Object.keys(data).includes(key)) {
    return data[key];
  }
};


/**
 * Sign the payload with secret key
 * @param {string} opt.secret - A secret key
 * @param {object} opt.payload - A payload to sign
 * @param {string} opt.algo - Algorithm to use
 * @param {string} opt.type - Type of authentication
 */
fn.sign = (opt, algo = 'sha256', type = 'hmac') => {

  if(typeof opt.payload === 'object') {
    opt.payload = fn.encode(JSON.stringify(opt.payload));
  }

  switch(type) {
    case 'rsa':
      const sign = crypto.createSign(algo);
      const args = {
        'key': opt.private,
        'passphrase': opt.secret
      };
      /**
       * * Sign the payload
       */
      sign.write(opt.payload);
      sign.end();
      /**
       * Signature
       */
      return fn.encode(sign.sign(args,'hex'));

    default:
      const hmac = crypto.createHmac(algo, fn.encode(opt.secret));
      /**
       * Sign the payload
       */
      hmac.update(opt.payload);
      /**
       * Signature
       */
      return fn.encode(hmac.digest('hex'));
  }

};


/**
 * Buffer data
 * @param {mixed} data - Data to buffer
 */
fn.buffer = (data) => {
  return data.map(item => item && Buffer.from(item));
};


/**
 * Encode string to base64
 * @param {string} string - A string to encode
 */
fn.encode = (string) => {
  if(string) {
    return Buffer.from(string).toString('base64').replace(/=/g,'');
  }
};


/**
 * Decode base64 string
 * @param {string} string - A base64 string to decode
 */
fn.decode = (string) => {
  if(string) {
    return Buffer.from(string, 'base64').toString('utf-8');
  }
};


/**
 * Parse access token
 * @param {string} token - An access token
 */
fn.parse = (token) => {
  const start = token.slice(32);
  try {
    return {
      payload: JSON.parse(fn.decode(start.slice(0, -86))),
      signature: start.slice(start.length-86)
    };
  } catch(e) {
    /**
     * Catch json parsing
     * error and return code
     */
    return {code: 401, message: 'Invalid Access Token'};
  }
};


/**
 * Expiration date of the token
 * @param {int} days - Number of days
 */
fn.expire = (days = 30) => {
  const date = new Date;
  // Set expiration date
  if(typeof days === 'number') {
    date.setDate(date.getDate() + days);
  }
  return date.getTime();
};


/**
 * Create access token
 * @param {string} secret - A secret key
 * @param {object} payload - A payload to sign
 */
fn.create = (secret, payload, type = 'hmac') => {
  if(typeof payload === 'object') {
    if(typeof payload.exp === 'undefined') {
      throw new Error('Missing required expiration property.');
    }
    // Token
    return fn.random(32) + fn.encode(JSON.stringify(payload)) + fn.sign({type, secret, payload});
  }
};


/**
 * Create random string
 * @param {int} length - Length of the desired string
 */
fn.random = (length) => {
  var r = '';
  var c = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  for(let i = 0; i < length; i++) {
    r += c.charAt(Math.floor(Math.random() * c.length));
  }
  return r;
};


/**
 * Verify signature if its correct
 * @param {string} option.type - Type of authentication
 * @param {string} option.secret - A secret key
 * @param {string} option.private - A private key
 * @param {string} option.token - An access token
 */
fn.verify = (option) => {
  // Has token?
  if(!fn.has('token', option)) {
    return {code: 401, message: 'Access token is required'};
  }
  /**
   * Parse token
   */
  if(parsed = fn.parse(option.token.replace('Bearer ', ''))) {
    if(fn.has('code', parsed)) {
      return parsed;
    }
    // Check token if expired
    if(parsed.payload.exp < Date.now()) {
      return {code: 401, message: 'Access token is expired'};
    }
    switch(option.type) {
      case 'rsa':
        return fn.verifyRSA(parsed, option.public);
      default:
        return fn.verifyHMAC(parsed, option.secret);
    }
  }
};


/**
 * Verify RSA with public key
 * @param {object} option.payload - A payload or data signed
 * @param {string} option.signature - A signature used to sign
 * @param {string} public - A public key
 */
fn.verifyRSA = (option, public) => {

  // Has token?
  if(!fn.has('signature', option)) {
    return {code: 401, message: 'RSA signature is required'};
  }

  const verify = crypto.createVerify('sha256');
  /**
   * Sign data
   */
  if(typeof option.payload === 'string') {
    verify.write(option.payload);
  } else {
    verify.write(JSON.stringify(option.payload));
  }
  verify.end();
  
  try {
    /**
     * Verify with public key
     */
    if(verify.verify(public, fn.decode(option.signature), 'hex')) {
      return true;
    }
  } catch(e) {
    return {code: 401, message: 'Invalid Public Key'};
  }
  
  return {code: 401, message: 'Invalid RSA Signature'};
};


/**
 * Verify RSA with public key
 * @param {object} parsed.payload - A payload or data signed
 * @param {string} parsed.signature - A signature used to sign
 * @param {string} secret - A secret key
 */
fn.verifyHMAC = (parsed, secret) => {

  const args = {
    secret,
    payload: parsed.payload
  };
  // Create buffer with signature
  const buff = fn.buffer([parsed.signature, fn.sign(args)]);
  /**
   * Check if the same length
   */
  if(buff[0].length === buff[1].length) {
    // Compare the signature if its correct
    if(crypto.timingSafeEqual(buff[0], buff[1])) {
      return true;
    }
  }
  return {code: 401, message: 'Invalid Access Token'};
};