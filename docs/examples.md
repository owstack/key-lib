# KeyLib examples

## Generate a random key for Bitcoin network
```javascript
var privateKey = new keyLib.PrivateKey();
// OR
var privateKey = new keyLib.PrivateKey('BTC');
```

## Generate a random key for Bitcoin Cash network
```javascript
var privateKey = new keyLib.PrivateKey('BCH');
```

## Generate a random key for Litecoin network
```javascript
var privateKey = new keyLib.PrivateKey('LTC');
```

## Generate a key from a SHA256 hash
```javascript
var value = new Buffer('correct horse battery staple');
var hash = owsCommon.crypto.Hash.sha256(value);
var bn = owsCommon.crypto.BN.fromBuffer(hash);

var privateKey = new keyLib.PrivateKey(bn);
```

## Import a key via WIF for Bitcoin network
```javascript
var wif = 'Kxr9tQED9H44gCmp6HAdmemAzU3n84H3dGkuWTKvE23JgHMW8gct';

var privateKey = new keyLib.PrivateKey(wif, 'BTC');
```
## Import a key via WIF for Bitcoin Cash network
```javascript
var wif = 'Kxr9tQED9H44gCmp6HAdmemAzU3n84H3dGkuWTKvE23JgHMW8gct';

var privateKey = new keyLib.PrivateKey(wif, 'BCH');
```
## Import a key via WIF for Litecoin network
```javascript
var wif = 'Kxr9tQED9H44gCmp6HAdmemAzU3n84H3dGkuWTKvE23JgHMW8gct';

var privateKey = new keyLib.PrivateKey(wif, 'LTC');
```
