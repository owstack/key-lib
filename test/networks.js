'use strict';

var expect = require('chai').expect;
var should = require('chai').should();

var keyLib = require('..');
var networks = keyLib.Networks;
var _ = require('lodash');

describe('Networks', function() {

  var customnet;

  it('will get network based on string "TESTNET" value', function() {
    var network = networks.get('TESTNET');
    network.should.equal(networks.testnet);
  });

  it('should be able to define a custom Network', function() {
    var custom = {
      name: 'customnet',
      symbol: 'net',
      coin: 0x81234567,
      prefix: {
        pubkeyhash: 0x10,
        privatekey: 0x90,
        scripthash: 0x08
      },
      version: {
        xpubkey: 0x0278b20e,
        xprivkey: 0x0278ade4
      },
      networkMagic: 0xe7beb4d4,
      port: 20001,
      dnsSeeds: [
        'localhost',
        'mynet.localhost'
      ]
    };
    networks.add(custom);
    customnet = networks.get('customnet');

    var expected = new Buffer('e7beb4d4', 'hex');
    customnet.networkMagic.should.deep.equal(expected);

    for (var key in custom) {
      if (key !== 'networkMagic') {
        customnet[key].should.deep.equal(custom[key]);
      } else {
        var expected = new Buffer('e7beb4d4', 'hex');
        customnet[key].should.deep.equal(expected);
      }
    }
  });

  it('can remove a custom network', function() {
    networks.remove(customnet);
    var net = networks.get('customnet');
    should.equal(net, undefined);
  });

  it('should not set a network map for an undefined value', function() {
    var custom = {
      name: 'somenet',
      symbol: 'net',
      coin: 0x81234567,
      prefix: {
        pubkeyhash: 0x13,
        privatekey: 0x93,
        scripthash: 0x11
      },
      version: {
        xpubkey: 0x0278b20f,
        xprivkey: 0x0278ade5
      },
      networkMagic: 0xe7beb4d5,
      port: 20008,
      dnsSeeds: [
        'somenet.localhost'
      ]
    };
    networks.add(custom);
    var network = networks.get(undefined);
    should.not.exist(network);
    networks.remove(custom);
  });

  var constants = ['name', 'symbol', 'coin', 'prefix.pubkeyhash', 'prefix.scripthash', 'version.xpubkey', 'version.xprivkey'];

  constants.forEach(function(key) {
    it('should have constant '+key+' for all networks', function() {
      _.has(networks.get('BCH'), key).should.equal(true);
      _.has(networks.get('BTC'), key).should.equal(true);
      _.has(networks.get('LTC'), key).should.equal(true);
      _.has(networks.get('TESTNET'), key).should.equal(true);
    });
  });

  it('tests only for the specified key', function() {
    expect(networks.get(0x30, 'prefix.pubkeyhash')).to.equal(networks.get('LTC'));
    expect(networks.get(0xa0, 'prefix.privatekey')).to.equal(undefined);
  });

  it('can test for multiple keys', function() {
    expect(networks.get(0x30, ['prefix.pubkeyhash', 'prefix.scripthash'])).to.equal(networks.get('LTC'));
    expect(networks.get(0xa0, ['prefix.privatekey', 'port'])).to.equal(undefined);
  });

  it('converts to string using the "name" property', function() {
    networks.get('BTC').toString().should.equal('BTC');
  });

  it('network object should be immutable', function() {
    expect(networks.get('BTC').symbol).to.equal('BTC')
    var fn = function() { networks.get('BTC').symbol = 'Something else' }
    expect(fn).to.throw(TypeError)
  });

});
