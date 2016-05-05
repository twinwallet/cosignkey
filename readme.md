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