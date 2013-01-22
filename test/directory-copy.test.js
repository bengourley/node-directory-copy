var assert = require('assert')
  , copy = require('..')
  , rimraf = require('rimraf')
  , fs = require('fs')
  , tmpdir = 'tmp'
  , join = require('path').join

describe('copy()', function () {

  beforeEach(function (done) {
    rimraf(join(__dirname, 'fixtures', tmpdir), function () {
      fs.mkdir(join(__dirname, 'fixtures', tmpdir), done)
    })
  })

  afterEach(function (done) {
    rimraf(join(__dirname, 'fixtures', tmpdir), done)
  })

  it('should copy the contents of one directory to another', function (done) {
    copy(
        { src: join(__dirname, 'fixtures', 'files')
        , dest: join(__dirname, 'fixtures', tmpdir)
        }
      , function (err) {
          assert(!err)
          fs.readdir(join(__dirname, 'fixtures', tmpdir), function (err, list) {
            assert(!err)
            assert.deepEqual(list, [ '.hidden', 'a.txt', 'nest' ])
            done()
          })
        })
  })

  it('should ignore files that match an exclude pattern', function (done) {
    copy(
        { src: join(__dirname, 'fixtures', 'files')
        , dest: join(__dirname, 'fixtures', tmpdir)
        , excludes: [ /^\./ ]
        }
      , function (err) {
          assert(!err)
          fs.readdir(join(__dirname, 'fixtures', tmpdir), function (err, list) {
            assert(!err)
            assert.deepEqual(list, [ 'a.txt', 'nest' ])
            done()
          })
        })
  })

  it('should emit log events', function (done) {
    var logs = 0
    copy(
        { src: join(__dirname, 'fixtures', 'files')
        , dest: join(__dirname, 'fixtures', tmpdir)
        }
      , function (err) {
          assert(!err)
          fs.readdir(join(__dirname, 'fixtures', tmpdir), function (err, list) {
            assert(logs > 0)
            done()
          })
        })
      .on('log', function () { logs++ })
  })

    it('should warn when there are no files to copy', function (done) {
    var log
    copy(
        { src: join(__dirname, 'fixtures', 'doesnotexist')
        , dest: join(__dirname, 'fixtures', tmpdir)
        }
      , function (err) {
          assert(!err)
          fs.readdir(join(__dirname, 'fixtures', tmpdir), function () { })
        })
      .on('log', function (msg, level) {
        if (level !== 'warn') return
        assert.equal('No files to copy, aborting', msg)
        done()
      })
  })

  it('should callback with the error as the first argument', function (done) {
    var logs = 0
    copy(
        { src: join(__dirname, 'fixtures', 'perms')
        , dest: join(__dirname, 'fixtures', tmpdir)
        }
      , function (err) {
          assert(err)
          done()
        })
  })

})