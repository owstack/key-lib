'use strict';

var owsCommon = require('@owstack/ows-common');
var Base58Check = owsCommon.encoding.Base58Check;
var Bip38 = require('bip38');
var BN = owsCommon.BN;
var Hash = owsCommon.Hash;
var JSUtil = owsCommon.util.js;
var Networks = require('@owstack/network-lib');
var Point = require('./crypto/point');
var PublicKey = require('./publickey');
var Random = owsCommon.Random;
var lodash = owsCommon.deps.lodash;
var $ = owsCommon.util.preconditions;

/**
 * Instantiate a PrivateKey from a BN, Buffer and WIF.
 *
 * @example
 * ```javascript
 * // generate a new random key
 * var key = PrivateKey();
 *
 * // encode into wallet export format
 * var exported = key.toWIF();
 *
 * // instantiate from the exported (and saved) private key
 * var imported = PrivateKey.fromWIF(exported);
 * ```
 *
 * @param {string} data - The encoded data in various formats
 * @param {Network|string=} network - a {@link Network} object, or a string with the network name
 * @returns {PrivateKey} A new valid instance of an PrivateKey
 * @constructor
 */
function PrivateKey(data, network) {
  /* jshint maxstatements: 20 */
  /* jshint maxcomplexity: 8 */
  if (!(this instanceof PrivateKey)) {
    return new PrivateKey(data, network);
  }
  if (data instanceof PrivateKey) {
    return data;
  }

  var info = this._classifyArguments(data, network);

  // validation
  if (!info.bn || info.bn.cmp(new BN(0)) === 0){
    throw new TypeError('Number can not be equal to zero, undefined, null or false');
  }
  if (!info.bn.lt(Point.getN())) {
    throw new TypeError('Number must be less than N');
  }
  if (typeof(info.network) === 'undefined') {
    throw new TypeError('Must specify the network ("livenet" or "testnet")');
  }

  JSUtil.defineImmutable(this, {
    bn: info.bn,
    compressed: info.compressed,
    network: info.network
  });

  Object.defineProperty(this, 'publicKey', {
    configurable: false,
    enumerable: true,
    get: this.toPublicKey.bind(this)
  });

  return this;

};

/**
 * Internal helper to instantiate PrivateKey internal `info` object from
 * different kinds of arguments passed to the constructor.
 *
 * @param {*} data
 * @param {Network|string=} network - a {@link Network} object, or a string with the network name
 * @return {Object}
 */
PrivateKey.prototype._classifyArguments = function(data, network) {
  /* jshint maxcomplexity: 10 */
  var info = {
    compressed: true,
    network: network ? Networks.get(network) : Networks.defaultNetwork
  };

  // detect type of data
  if (lodash.isUndefined(data) || lodash.isNull(data)){
    info.bn = PrivateKey._getRandomBN();
  } else if (data instanceof BN) {
    info.bn = data;
  } else if (data instanceof Buffer || data instanceof Uint8Array) {
    info = PrivateKey._transformBuffer(data, network);
  } else if (data.bn && data.network){
    info = PrivateKey._transformObject(data);
  } else if (!network && Networks.get(data)) {
    info.bn = PrivateKey._getRandomBN();
    info.network = Networks.get(data);
  } else if (typeof(data) === 'string'){
    if (JSUtil.isHexa(data)) {
      info.bn = new BN(new Buffer(data, 'hex'));
    } else {
      info = PrivateKey._transformWIF(data, network);
    }
  } else {
    throw new TypeError('First argument is an unrecognized data type.');
  }

  return info;
};

/**
 * Internal function to get a random Big Number (BN)
 *
 * @returns {BN} A new randomly generated BN
 * @private
 */
PrivateKey._getRandomBN = function(){
  var condition;
  var bn;
  do {
    var privbuf = Random.getRandomBuffer(32);
    bn = BN.fromBuffer(privbuf);
    condition = bn.lt(Point.getN());
  } while (!condition);
  return bn;
};

/**
 * Internal function to transform a WIF Buffer into a private key
 *
 * @param {Buffer} buf - An WIF string
 * @param {Network|string=} network - a {@link Network} object, or a string with the network name
 * @returns {Object} An object with keys: bn, network and compressed
 * @private
 */
PrivateKey._transformBuffer = function(buf, network) {
  var info = {};

  if (buf.length === 32) {
    return PrivateKey._transformBNBuffer(buf, network);
  }

  // Buffer defined network must be valid.
  if (!Networks.get(buf[0], 'prefix.privatekey')) {
    throw new Error('Invalid network');
  }

  var n;
  if (!network) {
    // Prefer the default network if the buffer matches it. For example, BTC and BCH share version bytes, if
    // BCH is desired then BCH must be specified in 'network' otherwise the default is selected (BTC).
    if (buf[0] == Networks.defaultNetwork.prefix.privatekey) {
      n = Networks.defaultNetwork;
    } else {
      n = Networks.get(buf[0], 'prefix.privatekey');
    }
  } else {
    n = Networks.get(network);
  }

  // Several networks share the same one byte private key prefix so it's not possible to discern the specific
  // network when this prefix is detected in the buffer. This livenet 'shared' prefix and the testnet 'shared'
  // prefix is defined by the bitcoin standard WIF one byte prefix.
  //
  // Determine whether or not there is a network mismatch between the specified key string and the specified
  // network (if provided).
  //
  // If there is a difference in the one byte private key prefixes then there is network mismatch.
  if (buf[0] != n.prefix.privatekey) {
    throw new TypeError('Private key network mismatch');
  }

  // If the buffer indicates a shared prefix AND a network is specified then set the network as specified
  // (pass it through).
  if (Networks.isSharedPrefix(buf[0], 'prefix.privatekey') && network) {
    n = Networks.get(network);
  }

  if (buf.length === 1 + 32 + 1 && buf[1 + 32 + 1 - 1] === 1) {
    info.compressed = true;
  } else if (buf.length === 1 + 32) {
    info.compressed = false;
  } else {
    throw new Error('Length of buffer must be 33 (uncompressed) or 34 (compressed)');
  }

  info.bn = BN.fromBuffer(buf.slice(1, 32 + 1));
  info.network = n;

  return info;
};

/**
 * Internal function to transform a BN buffer into a private key
 *
 * @param {Buffer} buf
 * @param {Network|string=} network - a {@link Network} object, or a string with the network name
 * @returns {object} an Object with keys: bn, network, and compressed
 * @private
 */
PrivateKey._transformBNBuffer = function(buf, network) {
  var info = {};
  info.network = Networks.get(network) || Networks.defaultNetwork;
  info.bn = BN.fromBuffer(buf);
  info.compressed = false;
  return info;
};

/**
 * Internal function to transform a WIF string into a private key
 *
 * @param {string} buf - An WIF string
 * @returns {Object} An object with keys: bn, network and compressed
 * @private
 */
PrivateKey._transformWIF = function(str, network) {
  return PrivateKey._transformBuffer(Base58Check.decode(str), network);
};

/**
 * Instantiate a PrivateKey from a Buffer with the DER or WIF representation
 *
 * @param {Buffer} arg
 * @param {Network} network
 * @return {PrivateKey}
 */
PrivateKey.fromBuffer = function(arg, network) {
  return new PrivateKey(arg, network);
};

/**
 * Internal function to transform a JSON string on plain object into a private key
 * return this.
 *
 * @param {string} json - A JSON string or plain object
 * @returns {Object} An object with keys: bn, network and compressed
 * @private
 */
PrivateKey._transformObject = function(json) {
  var bn = new BN(json.bn, 'hex');
  var network = Networks.get(json.network);
  return {
    bn: bn,
    network: network,
    compressed: json.compressed
  };
};

/**
 * Instantiate a PrivateKey from a WIF string
 *
 * @param {string} str - The WIF encoded private key string
 * @returns {PrivateKey} A new valid instance of PrivateKey
 */
PrivateKey.fromString = PrivateKey.fromWIF = function(str, network) {
  $.checkArgument(lodash.isString(str), 'First argument is expected to be a string.');
  return new PrivateKey(str, network);
};

/**
 * Instantiate a PrivateKey from a plain JavaScript object
 *
 * @param {Object} obj - The output from privateKey.toObject()
 */
PrivateKey.fromObject = function(obj) {
  $.checkArgument(lodash.isObject(obj), 'First argument is expected to be an object.');
  return new PrivateKey(obj);
};

/**
 * Instantiate a PrivateKey from random bytes
 *
 * @param {string=} network - Network name
 * @returns {PrivateKey} A new valid instance of PrivateKey
 */
PrivateKey.fromRandom = function(network) {
  var bn = PrivateKey._getRandomBN();
  return new PrivateKey(bn, network);
};

/**
 * Check if there would be any errors when initializing a PrivateKey
 *
 * @param {string} data - The encoded data in various formats
 * @param {string=} network - Network name
 * @returns {null|Error} An error if exists
 */

PrivateKey.getValidationError = function(data, network) {
  var error;
  try {
    /* jshint nonew: false */
    new PrivateKey(data, network);
  } catch (e) {
    error = e;
  }
  return error;
};

/**
 * Check if the parameters are valid
 *
 * @param {string} data - The encoded data in various formats
 * @param {string=} network - Network name
 * @returns {Boolean} If the private key is would be valid
 */
PrivateKey.isValid = function(data, network){
  if (!data) {
    return false;
  }
  return !PrivateKey.getValidationError(data, network);
};

PrivateKey.decryptBIP38PrivateKey = function(encryptedPrivateKeyBase58, passphrase, opts, cb) {
  var bip38 = new Bip38();
  var privateKeyWif;

  try {
    privateKeyWif = bip38.decrypt(encryptedPrivateKeyBase58, passphrase);
  } catch (ex) {
    return cb(new Error('Could not decrypt BIP38 private key', ex));
  }

  var privateKey = new PrivateKey(privateKeyWif);
  var address = privateKey.publicKey.toAddress().toString();
  var addrBuff = new Buffer(address, 'ascii');
  var actualChecksum = Hash.sha256sha256(addrBuff).toString('hex').substring(0, 8);
  var expectedChecksum = Base58Check.decode(encryptedPrivateKeyBase58).toString('hex').substring(6, 14);

  if (actualChecksum != expectedChecksum)
    return cb(new Error('Incorrect passphrase'));

  return cb(null, privateKeyWif);
};

/**
 * Will output the PrivateKey encoded as hex string
 *
 * @returns {string}
 */
PrivateKey.prototype.toString = function() {
  return this.toBuffer().toString('hex');
};

/**
 * Will output the PrivateKey to a WIF string
 *
 * @returns {string} A WIP representation of the private key
 */
PrivateKey.prototype.toWIF = function() {
  var network = this.network;
  var compressed = this.compressed;

  var buf;
  if (compressed) {
    buf = Buffer.concat([new Buffer([network.prefix.privatekey]), this.bn.toBuffer({size: 32}), new Buffer([0x01])]);
  } else {
    buf = Buffer.concat([new Buffer([network.prefix.privatekey]), this.bn.toBuffer({size: 32})]);
  }

  return Base58Check.encode(buf);
};

/**
 * Will return the private key as a BN instance
 *
 * @returns {BN} A BN instance of the private key
 */
PrivateKey.prototype.toBigNumber = function(){
  return this.bn;
};

/**
 * Will return the private key as a BN buffer
 *
 * @returns {Buffer} A buffer of the private key
 */
PrivateKey.prototype.toBuffer = function(){
  // TODO: use `return this.bn.toBuffer({ size: 32 })` in v1.0.0
  return this.bn.toBuffer();
};

/**
 * Will return the private key as a BN buffer without leading zero padding
 *
 * @returns {Buffer} A buffer of the private key
 */
PrivateKey.prototype.toBufferNoPadding = function() {
  return this.bn.toBuffer();
};

/**
 * Will return the corresponding public key
 *
 * @returns {PublicKey} A public key generated from the private key
 */
PrivateKey.prototype.toPublicKey = function() {
  if (!this._pubkey) {
    this._pubkey = PublicKey.fromPrivateKey(this);
  }
  return this._pubkey;
};

PrivateKey.prototype.toAESKey = function() {
  return Hash.sha256(this.toBuffer()).slice(0, 16).toString('base64');
};

/**
 * @returns {Object} A plain object representation
 */
PrivateKey.prototype.toObject = PrivateKey.prototype.toJSON = function toObject() {
  return {
    bn: this.bn.toString('hex'),
    compressed: this.compressed,
    network: this.network.toString()
  };
};

/**
 * Will return a string formatted for the console
 *
 * @returns {string} Private key
 */
PrivateKey.prototype.inspect = function() {
  var uncompressed = !this.compressed ? ', uncompressed' : '';
  return '<PrivateKey: ' + this.toString() + ', network: ' + this.network + uncompressed + '>';
};

module.exports = PrivateKey;
