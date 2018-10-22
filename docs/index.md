# KeyLib v0.0.2

## Principles

keyLib provides a reliable API for JavaScript apps that need to create, import, and derive ECDSA keys.

# Documentation Index

## Key Management

* [Using Different Networks](networks.md)
* [Private Keys](privatekey.md) and [Public Keys](publickey.md)
* [Hierarchically-derived Private and Public Keys](hierarchical.md)

## Extra
* [Crypto](crypto.md)
* [Encoding](encoding.md)

## Module Development
* [Browser Builds](browser.md)

# Examples

## Create and Save a Private Key - Bitcoin

```javascript
var privateKey = new keyLib.PrivateKey();

var exported = privateKey.toWIF();
// e.g. L3T1s1TYP9oyhHpXgkyLoJFGniEgkv2Jhi138d7R2yJ9F4QdDU2m
var imported = keyLib.PrivateKey.fromWIF(exported);
var hexa = privateKey.toString();
// e.g. 'b9de6e778fe92aa7edb69395556f843f1dce0448350112e14906efc2a80fa61a'
```

## Create and Save a Private Key - other cryptocurrencies

The default behavior creates a key for the Bitcoin network. You can specify another network by providing a string argument identifying the currency.

```javascript
var privateKey = new keyLib.PrivateKey();
var privateKey = new keyLib.PrivateKey('BTC');
var privateKey = new keyLib.PrivateKey('BCH');
var privateKey = new keyLib.PrivateKey('LTC');
```
