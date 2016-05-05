'use strict'

var util = require('util')
var crypto = require('crypto')

var cosignKey = module.exports = {}

var base64re = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/

/**
 * @description Extract the entropy for the cosignserver key from an BIP32 HD key. This entropy data should be passed to get3dKeySeed()
 * @param hdprivkey {Buffer} 
 * @param hdchaincode {Buffer} 
 * @returns {String} base64 encoded data
 * @throws {Error} 
 */
cosignKey.extractEntropy = function (hdprivkey, hdchaincode) {
  if (!util.isBuffer(hdprivkey) || !util.isBuffer(hdchaincode)) throw new Error('Invalid buffers')
  if (hdprivkey.length !== 32 || hdchaincode.length !== 32) throw new Error('Invalid buffer length')
  var buff = Buffer.concat([hdprivkey, hdchaincode])
  if (buff.length !== 64) throw new Error('Invalid data')
  return crypto.createHmac('sha256', 'Server key derivation').update(buff).digest('base64')
}

/**
 * @description Get the seed  for 3rd key from the entropy data obtained from the first two key
 * @param entropy1 {String|Buffer} First entropy data, should be 256 bit long
 * @param entropy2 {String|Buffer} Second entropy data, should be 256 bit long
 * @returns {Buffer} Buffer with 512 bits of data
 * @throws {Error}
 */
cosignKey.get3rdKeySeed = function (entropy1, entropy2) {
  var e1 = getBuffer(entropy1)
  var e2 = getBuffer(entropy2)
  if (e1.length !== 32 || e2.length !== 32) throw new Error('Source entropies should be 256 bits long')
  var seed = Buffer.concat(sortBuffers([e1, e2]))
  if (seed.length != 64) throw new Error('Not 512 bit resulting seed')
  return seed
}

function sortBuffers(buffs) {
  if (!util.isArray(buffs) || buffs.length !== 2) throw new Error('Invalid buffers')
  if (buffs[0].length > buffs[1].length) return buffs
  if (buffs[0].length < buffs[1].length) return [buffs[1], buffs[0]]
  for (var i = buffs[0].length - 1; i >= 0; i--) {
    if (buffs[0][i] > buffs[1][i]) return buffs
    if (buffs[0][i] < buffs[1][i]) return [buffs[1], buffs[0]]
  }
  return buffs
}

function getBuffer (entropy) {
  if (util.isString(entropy)) {
    if (!base64re.test(entropy)) {
      throw new Error('String entropy should be base64 encoded')
    }
    return new Buffer(entropy, 'base64')
  } else if (entropy instanceof Buffer) {
    return entropy
  } else throw new Error('Invalid entropy')
}
