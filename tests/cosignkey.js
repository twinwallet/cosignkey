'use strict'

var sinon = require('sinon')
var chai = require('chai')
var should = chai.should()
var expect = chai.expect
var rewire = require("rewire")
var cosignkey = rewire('../lib/cosignkey')

var MOCK_DATA_BASE64 = 'Oxtf4DnG2Ff0FMuZ0MIn15Nc20QIdAGCeFV82YzAPE8='

describe('cosingKey', function () {
  describe('private functions', function () {
    describe('getBuffer()', function () {
      var getBuffer = cosignkey.__get__("getBuffer")
      it('should return the same buffer', function () {
        var buff = new Buffer(MOCK_DATA_BASE64)
        var result = getBuffer(buff)
        expect(result).to.equal(buff)
      })
      it('should accept base64 encoded string', function () {
        var result = getBuffer(MOCK_DATA_BASE64)
        expect(result.toString('base64')).to.equal(MOCK_DATA_BASE64)
      })
      it('should throw error #1', function () {
        expect(function () {
          var result = getBuffer('invalid base64 data')
        }).to.throw(Error)
      })
      it('should throw error #2', function () {
        expect(function () {
          var result = getBuffer(345)
        }).to.throw(Error)
      })
    })
    describe('sortBuffers()', function () {
      var sortBuffers = cosignkey.__get__("sortBuffers")
      var MOCK_BUFF1 = new Buffer('ffffffff', 'hex')
      var MOCK_BUFF2 = new Buffer('00000000', 'hex')
      var errorTestCases = [null, 123, 'xxx', [], [MOCK_BUFF1], [MOCK_BUFF1, MOCK_BUFF2, MOCK_BUFF2]]
      var returningTestCases = [
        [new Buffer('000000ff', 'hex'), new Buffer('ffffff00', 'hex')],
        [new Buffer('000000ff', 'hex'), new Buffer('00000000', 'hex')],
        [new Buffer('12345678', 'hex'), new Buffer('abcdef', 'hex')],
        [new Buffer('12345678', 'hex'), new Buffer('fedcba', 'hex')],
        [new Buffer('ffffffff', 'hex'), new Buffer('ffffffff', 'hex')],
        [new Buffer('ffffffff', 'hex'), new Buffer('00ffffff', 'hex')],
        [new Buffer('ffffffff', 'hex'), new Buffer('ffff0000', 'hex')],
      ]
      
      errorTestCases.forEach(function (testcase, idx) {
        it('should throw error #' + idx, function () {
          expect(function () {
            sortBuffers(testcase)
          }).to.throw(Error)
        })
      })
      returningTestCases.forEach(function (testcase, idx) {
        it('should sort buffers #' + idx, function () {
          var result = sortBuffers(testcase)
          expect(result.length).to.equal(2)
          expect(result).to.equal(testcase)
        })
        it('should sort buffers #' + idx + ' inverted', function () {
          var result = sortBuffers([testcase[1], testcase[0]])
          expect(result.length).to.equal(2)
          expect(result).to.deep.equal(testcase)
        })
      })
    })
  })
  describe('.extractEntropy', function () {
    var errorTestCases = [
      [],
      [new Buffer(32)],
      [new Buffer(32), null],
      [null, new Buffer(32)],
      ['xx', 'xx'],
      [123, 456],
      [new Buffer(32), new Buffer(31)],
      [new Buffer(31), new Buffer(32)],
      [new Buffer(33), new Buffer(32)],
      [new Buffer(34), new Buffer(30)]
    ]
    errorTestCases.forEach(function (testcase, idx) {
      it('should throw error #' + idx, function () {
        expect(function () {
          cosignkey.extractEntropy.apply(cosignkey, testcase)
        }).to.throw(Error)
      })
    })
    it('should return a string', function () {
      var result = cosignkey.extractEntropy(new Buffer(32), new Buffer(32))
      expect(result).to.be.a('string')
    })
    it('should return a base64 ancoded string', function () {
      var result = cosignkey.extractEntropy(new Buffer(MOCK_DATA_BASE64, 'base64'), new Buffer(MOCK_DATA_BASE64, 'base64'))
      expect(result).to.match(/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/)
    })
    it('shoul return the correct value', function () {
      var pk = new Buffer('zvAHPC9c1V97LG5rcmUWRYA8tn39i/F1lsmj4YF1CIo=', 'base64')
      var cc = new Buffer('5y/eRIgDt7okFbqqWGaIOMMK8mm87oHmVlnADi8GSKA=', 'base64')
      cosignkey.extractEntropy(pk, cc).should.equal('Oxtf4DnG2Ff0FMuZ0MIn15Nc20QIdAGCeFV82YzAPE8=')
    })
  })
  describe('.get3rdKeySeed', function () {
    var e1 = 'Oxtf4DnG2Ff0FMuZ0MIn15Nc20QIdAGCeFV82YzAPE8='
    var e2 = 'YD6FfjHGLX7fZC6IK0f+z1/6jOapnmExOCSmczW+2y0='
    var expected_seed = 'Oxtf4DnG2Ff0FMuZ0MIn15Nc20QIdAGCeFV82YzAPE9gPoV+McYtft9kLogrR/7PX/qM5qmeYTE4JKZzNb7bLQ=='

    it('should return the seed', function () {
      cosignkey.get3rdKeySeed(e1, e2).toString('base64').should.equal(expected_seed)
    })
  })
}) 