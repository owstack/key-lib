'use strict';

var Bip44 = require('bip44-constants');

var owsCommon = require('@owstack/ows-common');
var Base58 = owsCommon.encoding.Base58;
var BufferUtil = owsCommon.util.buffer;
var JSUtil = owsCommon.util.js;
var _ = require('lodash');

var networks = [];
var networkMaps = {};

/**
 * name - The name of the network
 * symbol - The currency symbol for the network
 * coin - the SLIP44 'coin' assignment for the BIP44 derivation path
 * prefix - address prefixes
 *   pubkeyhash - The publickey hash prefix
 *   privatekey - The privatekey prefix
 *   scripthash - The scripthash prefix
 * version - Key prefix; see BIP32, SLIP132; used only for HD keys
 *   xpubkey - The extended public key magic
 *   xprivkey - The extended private key magic
 * networkMagic - The network magic number
 * port - The network port
 * dnsSeeds - An array of dns seeds
 */
var definedNetworks = {
	'BCH': {
		name: 'Bitcoin Cash',
		symbol: 'BCH',
		coin: Bip44['BCH'] ^ '0x80000000',
		prefix: {
		  pubkeyhash: 0x00,
		  privatekey: 0x80,
		  scripthash: 0x05,
		},
		version: {
		  xpubkey: 0x0488b21f, // using BTC version strings +1 (no BCH version strings registered); see SLIP132
		  xprivkey: 0x0488ade5
		},
	  networkMagic: 0xe3e1f3e8,
		port: 8333,
		dnsSeeds: [
	    'seed.bitcoinabc.org',
	    'seed-abc.bitcoinforks.org',
	    'btccash-seeder.bitcoinunlimited.info',
	    'seed.bitprim.org ',
	    'seed.deadalnix.me'
		]
	},
	'BTC': {
		name: 'Bitcoin',
		symbol: 'BTC',
		coin: Bip44['BTC'] ^ '0x80000000',
		prefix: {
		  pubkeyhash: 0x00,
		  privatekey: 0x80,
		  scripthash: 0x05,
		},
		version: {
		  xpubkey: 0x0488b21e,
		  xprivkey: 0x0488ade4
		},
	  networkMagic: 0xf9beb4d9,
		port: 8333,
		dnsSeeds: [
	    'seed.bitcoin.sipa.be',
	    'dnsseed.bluematt.me',
	    'dnsseed.bitcoin.dashjr.org',
	    'seed.bitcoinstats.com',
	    'seed.bitnodes.io',
	    'bitseed.xf2.org'
		]
	},
	'LTC': {
		name: 'Litecoin',
		symbol: 'LTC',
		coin: Bip44['LTC'] ^ '0x80000000',
		prefix: {
			pubkeyhash: 0x30,
		  privatekey: 0xb0,
		  scripthash: 0x05,
		  scripthash2: 0x32,
		},
		version: {
		  xpubkey: 0x019da462,
		  xprivkey: 0x019d9cfe,
		},
	  networkMagic: 0xfbc0b6db,
		port: 9333,
		dnsSeeds: [
	    'dnsseed.litecointools.com',
	    'dnsseed.litecoinpool.org',
	    'dnsseed.ltc.xurious.com',
	    'dnsseed.koin-project.com',
	    'seed-a.litecoin.loshan.co.uk',
	    'dnsseed.thrasher.io'
		]
	}
};

/**
 * A network is merely a map containing values that correspond to version
 * numbers for each network.
 * @constructor
 */
function Network() {}

Network.prototype.toString = function toString() {
  return this.symbol;
};

/**
 * Add all configured networks.
 */
_.each(Object.keys(definedNetworks), function(n) {
	addNetwork(definedNetworks[n]);
});

/**
 * @function
 * @member Networks#get
 * Retrieves the network associated with a magic number or string.
 * @param {string|number|Network} arg
 * @param {string|Array} keys - if set, only check if the keys associated with this name match
 * @return Network
 */
function get(arg, keys) {
  if (~networks.indexOf(arg)) {
    return arg;
  }

  if (keys) {
    if (!_.isArray(keys)) {
      keys = [keys];
    }
    var containsArg = function(key) {
      return _.get(networks[index], key) === arg;
    };
    for (var index in networks) {
      if (_.some(keys, containsArg)) {
        return networks[index];
      }
    }
    return undefined;
  }


  if (networkMaps[arg] != undefined) {
  	return networkMaps[arg];

  } else if (_.isString(arg) && Base58.validCharacters(arg)) {
		// Try to decode from an extended private or public key.
    var version = BufferUtil.integerFromBuffer(Base58.decode(arg));
  	return networkMaps[version];
  }
};

/**
 * @function
 * @member Networks#add
 * Will add a custom Network
 * @param {Object} data
 * @param {string} data.name - The name of the network chain
 * @param {string} data.symbol - The currency symbol for the network
 * @param {Number} data.prefix.pubkeyhash - The publickey hash prefix
 * @param {Number} data.prefix.privatekey - The privatekey prefix
 * @param {Number} data.prefix.scripthash - The scripthash prefix
 * @param {Number} data.version.xpubkey - The extended public key magic
 * @param {Number} data.version.xprivkey - The extended private key magic
 * @param {Number} data.networkMagic - The network magic number
 * @param {Number} data.port - The network port
 * @param {Array}  data.dnsSeeds - An array of dns seeds
 * @return Network
 */
function addNetwork(data) {
  var network = new Network();

  JSUtil.defineImmutable(network, {
    name: data.name,
    symbol: data.symbol,
    coin: data.coin,
    prefix: data.prefix,
		version: data.version
  });

  if (data.networkMagic) {
    JSUtil.defineImmutable(network, {
      networkMagic: BufferUtil.integerAsBuffer(data.networkMagic)
    });
  }

  if (data.port) {
    JSUtil.defineImmutable(network, {
      port: data.port
    });
  }

  if (data.dnsSeeds) {
    JSUtil.defineImmutable(network, {
      dnsSeeds: data.dnsSeeds
    });
  }

	var mappedFields = [
		'name',
		'symbol',
		'coin',
		'prefix.pubkeyhash',
		'prefix.privatekey',
		'prefix.scripthash', 
		'version.xpubkey',
		'version.xprivkey'
	];

	_.each(mappedFields, function(f) {
		var value = _.get(network, f);
		if (value) {
      networkMaps[value] = network;
		}
	});

  networks.push(network);
  return network;
};

/**
 * @function
 * @member Networks#remove
 * Will remove a custom network
 * @param {Network} network
 */
function removeNetwork(network) {
  for (var i = 0; i < networks.length; i++) {
    if (networks[i] === network) {
      networks.splice(i, 1);
    }
  }
  for (var key in networkMaps) {
    if (networkMaps[key] === network) {
      delete networkMaps[key];
    }
  }
};

/**
 * @namespace Networks
 */
module.exports = {
  add: addNetwork,
  remove: removeNetwork,
  get: get,
  defaultNetwork: get('BTC')
};
