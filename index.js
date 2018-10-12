'use strict';

var keyLib = {};
var owsCommon = require('@owstack/ows-common');

// module information
keyLib.version = 'v' + require('./package.json').version;

// crypto
keyLib.crypto = {};
keyLib.crypto.BN = owsCommon.crypto.BN;
keyLib.crypto.ECDSA = require('./lib/crypto/ecdsa');
keyLib.crypto.Hash = owsCommon.crypto.Hash;
keyLib.crypto.Random = owsCommon.crypto.Random;
keyLib.crypto.Point = require('./lib/crypto/point');
keyLib.crypto.Signature = require('./lib/crypto/signature');

// encoding
keyLib.encoding = {};
keyLib.encoding.Base58 = owsCommon.encoding.Base58;
keyLib.encoding.Base58Check = owsCommon.encoding.Base58Check;
keyLib.encoding.BufferReader = owsCommon.encoding.BufferReader;
keyLib.encoding.BufferWriter = owsCommon.encoding.BufferWriter;
keyLib.encoding.Varint = owsCommon.encoding.Varint;

// utilities
keyLib.util = {};
keyLib.util.buffer = owsCommon.util.buffer;
keyLib.util.js = owsCommon.util.js;
keyLib.util.preconditions = owsCommon.util.preconditions;

// errors thrown by the library
keyLib.errors = owsCommon.errors;

// main crypto library
keyLib.HDPrivateKey = require('./lib/hdprivatekey.js');
keyLib.HDPublicKey = require('./lib/hdpublickey.js');
keyLib.Networks = require('./lib/networks');
keyLib.PrivateKey = require('./lib/privatekey');
keyLib.PublicKey = require('./lib/publickey');

// dependencies, subject to change
keyLib.deps = {};
keyLib.deps.bnjs = require('bn.js');
keyLib.deps.bs58 = require('bs58');
keyLib.deps.Buffer = Buffer;
keyLib.deps.elliptic = require('elliptic');
keyLib.deps._ = require('lodash');

module.exports = keyLib;
