var assert = require('assert')
  , copy = require('..')
  , rimraf = require('rimraf')
  , fs = require('fs')
  , tmpdir = 'tmp'
  , join = require('path').join

describe('copy()', function () {

  before(function (done) {
    var dir = join(__dirname, 'fixtures', 'perms')
      , file = join(dir, 'no')

    fs.mkdir(dir, function (err) {
      if (err) throw err
      fs.writeFile(file, 'foo', function (err) {
        if (err) throw err
        fs.chmod(file, '000', function (err) {
          if (err) throw err
          done()
        })
      })
    })
  })

  after(function (done) {
    var dir = join(__dirname, 'fixtures', 'perms')
    rimraf(dir, done)
  })

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
            assert.notEqual(list.indexOf('.hidden'), -1)
            assert.notEqual(list.indexOf('a.txt'), -1)
            assert.notEqual(list.indexOf('nest'), -1)
            assert.equal(list.length, 3)
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
            assert.notEqual(list.indexOf('a.txt'), -1)
            assert.notEqual(list.indexOf('nest'), -1)
            assert.equal(list.length, 2)
            done()
          })
        })
  })

  it('should ignore files below a directory that matched exclude pattern', function (done) {
    copy(
        { src: join(__dirname, 'fixtures', 'files')
        , dest: join(__dirname, 'fixtures', tmpdir)
        , excludes: [ /^\./, /^nest\/$/ ]
        }
      , function (err) {
          assert(!err)
          fs.readdir(join(__dirname, 'fixtures', tmpdir), function (err, list) {
            assert(!err)
            assert.notEqual(list.indexOf('a.txt'), -1)
            assert.equal(list.length, 1)
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

    copy(
        { src: join(__dirname, 'fixtures', 'perms')
        , dest: join(__dirname, 'fixtures', tmpdir)
        }
      , function (err) {
          assert(err)
          done()
        })
  })

  it('should copy the file permissions from the src', function (done) {
    copy(
        { src: join(__dirname, 'fixtures', 'files')
        , dest: join(__dirname, 'fixtures', tmpdir)
        }
      , function (err) {
          assert(!err)
          fs.readdir(join(__dirname, 'fixtures', tmpdir), function (err, list) {
            assert(!err)
            list.forEach(function(file){
              var src = join(__dirname, 'fixtures', 'files', file)
                , dest = join(__dirname, 'fixtures', tmpdir, file)
              ;
              assert.equal(fs.lstatSync(src).mode, fs.lstatSync(dest).mode);
            });
            done()
          })
        })
  })

})
