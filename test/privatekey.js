'use strict';

var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

var keyLib = require('..');
var Base58Check = keyLib.encoding.Base58Check;
var BN = keyLib.crypto.BN;
var invalidbase58_bitcoind = require('./data/bitcoind/base58_keys_invalid.json');
var invalidbase58_bitcoinabc = require('./data/bitcoinabc/base58_keys_invalid.json');
var invalidbase58_litecoin = require('./data/litecoin/base58_keys_invalid.json');
var Networks = keyLib.Networks;
var Point = keyLib.crypto.Point;
var PrivateKey = keyLib.PrivateKey;
var validbase58_bitcoind = require('./data/bitcoind/base58_keys_valid.json');
var validbase58_bitcoinabc = require('./data/bitcoinabc/base58_keys_valid.json');
var validbase58_litecoin = require('./data/litecoin/base58_keys_valid.json');

// Setup some networks for tests.
require('./data/networks');

describe('PrivateKey', function() {

  var hex = '96c132224121b509b7d0a16245e957d9192609c5637c6228311287b1be21627a';
  var hex2 = '8080808080808080808080808080808080808080808080808080808080808080';
  var buf = new Buffer(hex, 'hex');
  var wifBTC = 'L2Gkw3kKJ6N24QcDuH4XDqt9cTqsKTVNDGz1CRZhk9cq4auDUbJy';
  var wifBTCUncompressed = '5JxgQaFM1FMd38cd14e3mbdxsdSa9iM2BV6DHBYsvGzxkTNQ7Un';
  var wifLTC = 'T5vjkWhLbgjwfR3bcnzAP3BShM6gUDhVjjpCTZqGga3k6VVqHkzu';
  var wifLTCUncompressed = '6vMsXf7UjHVTkMYBcqcUW1qxmBzqMq4gyQ12dcXsKjmSafByBxi';
  var wifTestnet = 'cSdkPxkAjA4HDr5VHgsebAPDEh9Gyub4HK8UJr2DFGGqKKy4K5sG';
  var wifTestnetUncompressed = '92jJzK4tbURm1C7udQXxeCBvXHoHJstDXRxAMouPG1k1XUaXdsu';
  var wifNamecoin = '74pxNKNpByQ2kMow4d9kF6Z77BYeKztQNLq3dSyU4ES1K5KLNiz';

  it('should create a new random private key', function() {
    var a = new PrivateKey();
    should.exist(a);
    should.exist(a.bn);
    var b = PrivateKey();
    should.exist(b);
    should.exist(b.bn);
  });

  it('should create a privatekey from hexa string', function() {
    var a = new PrivateKey(hex2);
    should.exist(a);
    should.exist(a.bn);
  });

  it('should create a new random testnet private key with only one argument', function() {
    var a = new PrivateKey(Networks.testnet);
    should.exist(a);
    should.exist(a.bn);
  });

  it('should create a new random private key with only one argument', function() {
    var a = new PrivateKey(Networks.get('BTC'));
    should.exist(a);
    should.exist(a.bn);

    var a = new PrivateKey('BCH');
    should.exist(a);
    should.exist(a.bn);

    var a = new PrivateKey('LTC');
    should.exist(a);
    should.exist(a.bn);
  });

  it('should create a private key from a custom network WIF string', function() {
    var nmc = {
      name: 'namecoin',
      symbol: 'nam',
      coin: 0x81234567,
      protocol: 'namecoin',
      prefix: {
        pubkeyhash: 0x34,
        privatekey: 0xB4,
        // these below aren't the real NMC version numbers
        scripthash: 0x08
      },
      version: {
        xpubkey: 0x0278b20e,
        xprivkey: 0x0278ade4
      },
      networkMagic: 0xf9beb4fe,
      port: 20001,
      dnsSeeds: [
        'localhost',
        'mynet.localhost'
      ],
      indexBy: Networks.indexAll
    };
    Networks.add(nmc);
    var nmcNet = Networks.get('namecoin');
    var a = new PrivateKey(wifNamecoin, nmcNet);
    should.exist(a);
    should.exist(a.bn);
    Networks.remove(nmcNet);
  });

  it('should create a new random private key with empty data', function() {
    var a = new PrivateKey(null, Networks.get('BTC'));
    should.exist(a);
    should.exist(a.bn);

    var a = new PrivateKey(null, 'BCH');
    should.exist(a);
    should.exist(a.bn);

    var a = new PrivateKey(null, 'LTC');
    should.exist(a);
    should.exist(a.bn);
  });

  it('should create a new random testnet private key with empty data', function() {
    var a = new PrivateKey(null, Networks.testnet);
    should.exist(a);
    should.exist(a.bn);
  });

  it('should create a private key from WIF string', function() {
    var a = new PrivateKey('L3T1s1TYP9oyhHpXgkyLoJFGniEgkv2Jhi138d7R2yJ9F4QdDU2m');
    should.exist(a);
    should.exist(a.bn);
  });

  it('should create a private key from WIF buffer', function() {
    var a = new PrivateKey(Base58Check.decode('L3T1s1TYP9oyhHpXgkyLoJFGniEgkv2Jhi138d7R2yJ9F4QdDU2m'));
    should.exist(a);
    should.exist(a.bn);
  });

  describe('bitcoind compliance', function() {

    validbase58_bitcoind.map(function(d) {
      if (d[2].isPrivkey) {
        it('should instantiate WIF private key ' + d[0] + ' with correct properties', function() {
          var network = Networks.get('BTC');
          if (d[2].isTestnet) {
            network = Networks.get('TESTNET');
          }
          var key = new PrivateKey(d[0], network);
          key.compressed.should.equal(d[2].isCompressed);
          key.network.should.equal(network);
        });
      }
    });

    invalidbase58_bitcoind.map(function(d) {
      it('should describe input ' + d[0].slice(0,10) + '... as invalid', function() {
        expect(function() {
          return new PrivateKey(d[0]);
        }).to.throw(Error);
      });
    });

  });

  describe('bitcoinabc compliance', function() {

    validbase58_bitcoinabc.map(function(d) {
      if (d[2].isPrivkey) {
        it('should instantiate WIF private key ' + d[0] + ' with correct properties', function() {
          var network = Networks.get('BCH');
          if (d[2].isTestnet) {
            network = Networks.get('BCHTEST');
          }
          var key = new PrivateKey(d[0], network);
          key.compressed.should.equal(d[2].isCompressed);
          key.network.should.equal(network);
        });
      }
    });

    invalidbase58_bitcoinabc.map(function(d) {
      it('should describe input ' + d[0].slice(0,10) + '... as invalid', function() {
        expect(function() {
          return new PrivateKey(d[0]);
        }).to.throw(Error);
      });
    });

  });

  describe('litecoin compliance', function() {

    validbase58_litecoin.map(function(d){
      if (d[2].isPrivkey) {
        it('should instantiate WIF private key ' + d[0] + ' with correct properties', function() {
          var network = Networks.get('LTC');
          if (d[2].isTestnet) {
            network = Networks.get('TESTNET');
          }
          var key = new PrivateKey(d[0], network);
          key.compressed.should.equal(d[2].isCompressed);
          key.network.should.equal(network);
        });
      }
    });

    invalidbase58_litecoin.map(function(d) {
      it('should describe input ' + d[0].slice(0,10) + '... as invalid', function() {
        expect(function() {
          return new PrivateKey(d[0]);
        }).to.throw(Error);
      });
    });

  });

  describe('instantiation', function() {

    it('should not be able to instantiate private key greater than N', function() {
      expect(function() {
        return new PrivateKey(Point.getN());
      }).to.throw('Number must be less than N');
    });

    it('should not be able to instantiate private key because of network mismatch', function() {
      expect(function() {
        return new PrivateKey('L3T1s1TYP9oyhHpXgkyLoJFGniEgkv2Jhi138d7R2yJ9F4QdDU2m', 'LTC');
      }).to.throw('Private key network mismatch');
    });

    it('should not be able to instantiate private key WIF is too long', function() {
      expect(function() {
        var buf = Base58Check.decode('L3T1s1TYP9oyhHpXgkyLoJFGniEgkv2Jhi138d7R2yJ9F4QdDU2m');
        var buf2 = Buffer.concat([buf, new Buffer(0x01)]);
        return new PrivateKey(buf2);
      }).to.throw('Length of buffer must be 33 (uncompressed) or 34 (compressed');
    });

    it('should not be able to instantiate private key WIF because of unknown network byte', function() {
      expect(function() {
        var buf = Base58Check.decode('L3T1s1TYP9oyhHpXgkyLoJFGniEgkv2Jhi138d7R2yJ9F4QdDU2m');
        var buf2 = Buffer.concat([new Buffer('ff', 'hex'), buf.slice(1, 33)]);
        return new PrivateKey(buf2);
      }).to.throw('Invalid network');
    });

    it('should not be able to instantiate private key WIF because of network mismatch', function() {
      expect(function(){
        var a = new PrivateKey(wifNamecoin, 'BTC');
      }).to.throw('Invalid network');
    });

    it('can be instantiated from a hex string', function() {
      var privhex = '906977a061af29276e40bf377042ffbde414e496ae2260bbf1fa9d085637bfff';
      var pubhex = '02a1633cafcc01ebfb6d78e39f687a1f0995c62fc95f51ead10a02ee0be551b5dc';
      var privkey = new PrivateKey(privhex);
      privkey.publicKey.toString().should.equal(pubhex);
    });

    it('should not be able to instantiate because of unrecognized data', function() {
      expect(function() {
        return new PrivateKey(new Error());
      }).to.throw('First argument is an unrecognized data type.');
    });

    it('should not be able to instantiate with unknown network', function() {
      expect(function() {
        return new PrivateKey(new BN(2), 'unknown');
      }).to.throw('Must specify the network');
    });

    it('should not create a zero private key', function() {
      expect(function() {
        var bn = new BN(0);
        return new PrivateKey(bn);
       }).to.throw(TypeError);
    });

    it('should create a BTC private key', function() {
      var privkey = new PrivateKey(BN.fromBuffer(buf), 'BTC');
      privkey.toWIF().should.equal(wifBTC);
    });

    it('returns the same instance if a PrivateKey is provided (immutable)', function() {
      var privkey = new PrivateKey();
      new PrivateKey(privkey).should.equal(privkey);
    });

  });

  describe('#json/object', function() {

    it('should input/output json', function() {
      var json = JSON.stringify({
        bn: '96c132224121b509b7d0a16245e957d9192609c5637c6228311287b1be21627a',
        compressed: false,
        network: 'BTC'
      });
      var key = PrivateKey.fromObject(JSON.parse(json));
      JSON.stringify(key).should.equal(json);
    });

    it('input json should correctly initialize network field', function() {
      ['BTC', 'BCH', 'LTC', 'TESTNET'].forEach(function (net) {
        var pk = PrivateKey.fromObject({
          bn: '96c132224121b509b7d0a16245e957d9192609c5637c6228311287b1be21627a',
          compressed: false,
          network: net
        });
        pk.network.should.be.deep.equal(Networks.get(net));
      });
    });

    it('fails on invalid argument', function() {
      expect(function() {
        return PrivateKey.fromJSON('¹');
      }).to.throw();
    });

    it('also accepts an object as argument', function() {
      expect(function() {
        return PrivateKey.fromObject(new PrivateKey().toObject());
      }).to.not.throw();
    });
  });

  it('coverage: public key cache', function() {

    expect(function() {
      var privateKey = new PrivateKey();
      /* jshint unused: false */
      var publicKey = privateKey.publicKey;
      return privateKey.publicKey;
    }).to.not.throw();
  });

  describe('#toString', function() {

    it('should output this private key correctly', function() {
      var privkey = PrivateKey.fromWIF(wifBTCUncompressed);
      privkey.toWIF().should.equal(wifBTCUncompressed);
    });

  });

  describe('#inspect', function() {

    it('should output known BTC key for console', function() {
      var privkey = PrivateKey.fromWIF('L3T1s1TYP9oyhHpXgkyLoJFGniEgkv2Jhi138d7R2yJ9F4QdDU2m');
      privkey.inspect().should.equal(
        '<PrivateKey: b9de6e778fe92aa7edb69395556f843f1dce0448350112e14906efc2a80fa61a, network: BTC>'
      );
    });

    it('should output known BCH key for console', function() {
      // Bitcoin and Bitcoin Cash private keys share the same version bytes. Since the default network is BTC
      // we must specify that the input key is BCH to ensure the output key information identifes a BCH key.
      var privkey = PrivateKey.fromWIF('Kz6UJmQACJmLtaQj5A3JAge4kVTNQ8gbvXuwbmCj7bsaabudb3RD', 'BCH');
      privkey.inspect().should.equal(
        '<PrivateKey: 55c9bccb9ed68446d1b75273bbce89d7fe013a8acd1625514420fb2aca1a21c4, network: BCH>'
      );
    });

    it('should output known LTC key for console', function() {
      var privkey = PrivateKey.fromWIF('T5vjkWhLbgjwfR3bcnzAP3BShM6gUDhVjjpCTZqGga3k6VVqHkzu');
      privkey.inspect().should.equal(
        '<PrivateKey: 55c9bccb9ed68446d1b75273bbce89d7fe013a8acd1625514420fb2aca1a21c4, network: LTC>'
      );
    });

    it('outputs "uncompressed" for uncompressed imported WIFs', function() {
      var privkey = PrivateKey.fromWIF(wifBTCUncompressed);
      privkey.inspect().should.equal('<PrivateKey: 96c132224121b509b7d0a16245e957d9192609c5637c6228311287b1be21627a, network: BTC, uncompressed>');
    });
  });

  describe('#getValidationError', function() {

    it('should get an error because private key greater than N', function() {
      var n = Point.getN();
      var a = PrivateKey.getValidationError(n);
      a.message.should.equal('Number must be less than N');
    });

    it('should validate as false because private key greater than N', function() {
      var n = Point.getN();
      var a = PrivateKey.isValid(n);
      a.should.equal(false);
    });

    it('should recognize that undefined is an invalid private key', function() {
      PrivateKey.isValid().should.equal(false);
    });

    it('should validate as true', function() {
      var a = PrivateKey.isValid('L3T1s1TYP9oyhHpXgkyLoJFGniEgkv2Jhi138d7R2yJ9F4QdDU2m');
      a.should.equal(true);
    });

  });

  describe('buffer serialization', function() {

    it('returns an expected value when creating a PrivateKey from a buffer', function() {
      var privkey = new PrivateKey(BN.fromBuffer(buf));
      privkey.toString().should.equal(buf.toString('hex'));
    });

    it('roundtrips correctly when using toBuffer/fromBuffer', function() {
      var privkey = new PrivateKey(BN.fromBuffer(buf));
      var toBuffer = new PrivateKey(privkey.toBuffer());
      var fromBuffer = PrivateKey.fromBuffer(toBuffer.toBuffer());
      fromBuffer.toString().should.equal(privkey.toString());
    });

    it('will output a 31 byte buffer', function() {
      var bn = BN.fromBuffer(new Buffer('9b5a0e8fee1835e21170ce1431f9b6f19b487e67748ed70d8a4462bc031915', 'hex'));
      var privkey = new PrivateKey(bn);
      var buffer = privkey.toBufferNoPadding();
      buffer.length.should.equal(31);
    });

    // TODO: enable for v1.0.0 when toBuffer is changed to always be 32 bytes long
    // it('will output a 32 byte buffer', function() {
    //   var bn = BN.fromBuffer(new Buffer('9b5a0e8fee1835e21170ce1431f9b6f19b487e67748ed70d8a4462bc031915', 'hex'));
    //   var privkey = new PrivateKey(bn);
    //   var buffer = privkey.toBuffer();
    //   buffer.length.should.equal(32);
    // });

    // TODO: enable for v1.0.0 when toBuffer is changed to always be 32 bytes long
    // it('should return buffer with length equal 32', function() {
    //   var bn = BN.fromBuffer(buf.slice(0, 31));
    //   var privkey = new PrivateKey(bn, 'BTC');
    //   var expected = Buffer.concat([ new Buffer([0]), buf.slice(0, 31) ]);
    //   privkey.toBuffer().toString('hex').should.equal(expected.toString('hex'));
    // });
  });

  describe('#toBigNumber', function() {

    it('should output known BN', function() {
      var a = BN.fromBuffer(buf);
      var privkey = new PrivateKey(a);
      var b = privkey.toBigNumber();
      b.toString('hex').should.equal(a.toString('hex'));
    });
  });

  describe('#fromRandom', function() {

    it('should set bn gt 0 and lt n, and should be compressed', function() {
      var privkey = PrivateKey.fromRandom();
      privkey.bn.gt(new BN(0)).should.equal(true);
      privkey.bn.lt(Point.getN()).should.equal(true);
      privkey.compressed.should.equal(true);
    });

  });

  describe('#fromWIF', function() {

    it('should parse this compressed BTC private key correctly', function() {
      var privkey = PrivateKey.fromWIF(wifBTC);
      privkey.toWIF().should.equal(wifBTC);
    });

  });

  describe('#toWIF', function() {

    it('should parse this compressed LTC private key correctly', function() {
      var privkey = PrivateKey.fromWIF(wifLTC);
      privkey.toWIF().should.equal(wifLTC);
    });

    it('should parse this compressed testnet private key correctly', function() {
      var privkey = PrivateKey.fromWIF(wifTestnet);
      privkey.toWIF().should.equal(wifTestnet);
    });

  });

  describe('#fromString', function() {

    it('should parse this uncompressed LTC private key correctly', function() {
      var privkey = PrivateKey.fromString(wifLTCUncompressed);
      privkey.toWIF().should.equal(wifLTCUncompressed);
    });

    it('should parse this uncompressed testnet private key correctly', function() {
      var privkey = PrivateKey.fromString(wifTestnetUncompressed);
      privkey.toWIF().should.equal(wifTestnetUncompressed);
    });

  });

  describe('#toString', function() {

    it('should parse this uncompressed BTC private key correctly', function() {
      var privkey = PrivateKey.fromString(wifBTCUncompressed);
      privkey.toString().should.equal("96c132224121b509b7d0a16245e957d9192609c5637c6228311287b1be21627a");
    });

  });

  describe('#toPublicKey', function() {

    it('should convert this known PrivateKey to known PublicKey', function() {
      var privhex = '906977a061af29276e40bf377042ffbde414e496ae2260bbf1fa9d085637bfff';
      var pubhex = '02a1633cafcc01ebfb6d78e39f687a1f0995c62fc95f51ead10a02ee0be551b5dc';
      var privkey = new PrivateKey(new BN(new Buffer(privhex, 'hex')));
      var pubkey = privkey.toPublicKey();
      pubkey.toString().should.equal(pubhex);
    });

    it('should have a "publicKey" property', function() {
      var privhex = '906977a061af29276e40bf377042ffbde414e496ae2260bbf1fa9d085637bfff';
      var pubhex = '02a1633cafcc01ebfb6d78e39f687a1f0995c62fc95f51ead10a02ee0be551b5dc';
      var privkey = new PrivateKey(new BN(new Buffer(privhex, 'hex')));
      privkey.publicKey.toString().should.equal(pubhex);
    });

    it('should convert this known PrivateKey to known PublicKey and preserve compressed=true', function() {
      var privwif = 'L3T1s1TYP9oyhHpXgkyLoJFGniEgkv2Jhi138d7R2yJ9F4QdDU2m';
      var privkey = new PrivateKey(privwif);
      var pubkey = privkey.toPublicKey();
      pubkey.compressed.should.equal(true);
    });

    it('should convert this known PrivateKey to known PublicKey and preserve compressed=false', function() {
      var privwif = '5Kd3NBUAdUnhyzenEwVLy9pBKxSwXvE9FMPyR4UKZvpe6E3AgLr';
      var privkey = new PrivateKey(privwif);
      var pubkey = privkey.toPublicKey();
      pubkey.compressed.should.equal(false);
    });

  });

  describe('#toAESKey', function() {

    it('should be ok', function() {
      var privKey = new PrivateKey('09458c090a69a38368975fb68115df2f4b0ab7d1bc463fc60c67aa1730641d6c');
      privKey.toAESKey().should.be.equal('2HvmUYBSD0gXLea6z0n7EQ==');
    });

  });

  describe('#decryptBIP38PrivateKey', function() {

    it.skip('should decrypt bip38 encrypted private key', function(done) {
      this.timeout(60000);
      clients[0].decryptBIP38PrivateKey('6PfRh9ZnWtiHrGoPPSzXe6iafTXc6FSXDhSBuDvvDmGd1kpX2Gvy1CfTcA', 'passphrase', {}, function(err, result) {
        should.not.exist(err);
        result.should.equal('5KjBgBiadWGhjWmLN1v4kcEZqWSZFqzgv7cSUuZNJg4tD82c4xp');
        done();
      });
    });

    it.skip('should fail to decrypt bip38 encrypted private key with incorrect passphrase', function(done) {
      this.timeout(60000);
      clients[0].decryptBIP38PrivateKey('6PfRh9ZnWtiHrGoPPSzXe6iafTXc6FSXDhSBuDvvDmGd1kpX2Gvy1CfTcA', 'incorrect passphrase', {}, function(err, result) {
        should.exist(err);
        err.message.should.contain('passphrase');
        done();
      });
    });

  });

});
