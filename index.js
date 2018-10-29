'use strict';

var keyLib = {};

// module information
keyLib.version = 'v' + require('./package.json').version;

// crypto
keyLib.crypto = {};
keyLib.crypto.ECDSA = require('./lib/crypto/ecdsa');
keyLib.crypto.Point = require('./lib/crypto/point');
keyLib.crypto.Signature = require('./lib/crypto/signature');

// main crypto library
keyLib.HDPrivateKey = require('./lib/hdprivatekey.js');
keyLib.HDPublicKey = require('./lib/hdpublickey.js');
keyLib.Networks = require('./lib/networks');
keyLib.PrivateKey = require('./lib/privatekey');
keyLib.PublicKey = require('./lib/publickey');

// dependencies, subject to change
keyLib.deps = {};
keyLib.deps.Buffer = Buffer;
keyLib.deps.elliptic = require('elliptic');
keyLib.deps.lodash = require('lodash');

module.exports = keyLib;
