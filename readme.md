[![Build Status](https://travis-ci.org/twinwallet/cosignkey.svg?branch=master)](https://travis-ci.org/twinwallet/cosignkey)
[![Coverage Status](https://coveralls.io/repos/github/twinwallet/cosignkey/badge.svg?branch=master)](https://coveralls.io/github/twinwallet/cosignkey?branch=master)

Usage with bitcore-lib
------------------------------
To extract entropy from a HD private key:
```javascript
var hdk = Bitcore.HDPrivateKey(xPrivKey);
var entropy = cosignkey.extractEntropy(hdk._buffers.privateKey, hdk._buffers.chainCode);
```

To create the 3rd key from two entropies data:
```javascript
try {
  seed = cosignKey.get3rdKeySeed(entropy1, entropy2);
  var hdk = Bitcore.HDPrivateKey.fromSeed(seed, 'livenet');
} catch (e) { }
```