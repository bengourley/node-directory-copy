var assert = require('assert')
  , copy = require('..')
  , rimraf = require('rimraf')
  , fs = require('fs')
  , tmpdir = 'tmp'
  , join = require('path').join
  , noop = function () {}

describe('copy()', function () {

  beforeEach(function (done) {
    rimraf(join(__dirname, tmpdir), function () {
      fs.mkdir(join(__dirname, tmpdir), done)
    })
  })

  afterEach(function (done) {
    rimraf(join(__dirname, tmpdir), done)
  })

  it('should copy the contents of one directory to another', function (done) {
    copy(
        { src: join(__dirname, 'fixtures')
        , dest: join(__dirname, tmpdir)
        , logger: { debug: noop, info: noop, warn: noop, error: noop }
        }
      , function (err) {
          assert(!err)
          fs.readdir(join(__dirname, tmpdir), function (err, list) {
            assert(!err)
            assert.deepEqual(list, [ '.hidden', 'a.txt' ])
            done()
          })
        })
  })

  it('should ignore files that match an exclude pattern', function (done) {
    copy(
        { src: join(__dirname, 'fixtures')
        , dest: join(__dirname, tmpdir)
        , logger: { debug: noop, info: noop, warn: noop, error: noop }
        , excludes: [ /^\./ ]
        }
      , function (err) {
          assert(!err)
          fs.readdir(join(__dirname, tmpdir), function (err, list) {
            assert(!err)
            assert.deepEqual(list, [ 'a.txt' ])
            done()
          })
        })
  })

})