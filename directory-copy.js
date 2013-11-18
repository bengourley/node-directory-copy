module.exports = copy

var fs = require('fs')
  , async = require('async')
  , glob = require('glob')
  , join = require('path').join
  , mkdirp = require('mkdirp')
  , Emitter = require('events').EventEmitter

function copy(options, cb) {

  var emitter = new Emitter()

  if (!options.src || !options.dest) {
    return cb(new Error('src and dest must be supplied'))
  }

  process.nextTick(function () {

    emitter.emit('log', 'Reading directory for files to copy', 'debug')

    // Glob all of the files from options.src:
    // dot: true includes hidden files
    // mark: adds a trailing '/' to mark directories
    glob('**/*', { cwd: options.src, dot: true, mark: true }, function (err, paths) {

      if (err) return cb(err)

      emitter.emit('log', 'Glob found ' + paths.length + ' paths', 'debug')

      var excluded = []

      if (options.excludes) {
        paths = paths.filter(function (path) {
          var exclude = options.excludes.some(function (re) {
            var matches = re.test(path)
            if (matches && /\/$/.test(path)) excluded.push(path)
            return matches
          })
          if (exclude) emitter.emit('log', 'Excluding ' + path, 'debug')
          return !exclude
        })
      }

      emitter.emit('log', paths.length + ' paths to copy', 'debug')

      var dirs = []
        , files = []

      paths.filter(function (path) {
        var exclude = excluded.some(function (ex) {
          return path.indexOf(ex) === 0
        })
        if (exclude) return
        if  (/\/$/.test(path)) {
          dirs.push({
            src: join(options.src, path),
            dest: join(options.dest, path)
          });
        } else {
          files.push(
            { src: join(options.src, path)
            , dest: join(options.dest, path)
            })
        }
      })

      emitter.emit('log', dirs.length + ' dirs to create', 'debug')
      emitter.emit('log', files.length + ' files to copy', 'debug')

      if (files.length === 0) {
        emitter.emit('log', 'No files to copy, aborting', 'warn')
        return cb(null)
      }

      //set the umask 0 for no permission restriction for generated files
      oldmask = process.umask(0);

      // Make the new dirs first
      async.forEach(dirs, function(dirInfo, done) {
        fs.stat(dirInfo.src, function(err, status) {
          if (err) { return done(err); }
          var mode = status.mode & 0777;
          mkdirp(dirInfo.dest, mode, done);
        });
      }, function (err) {
        if (err) { 
          process.umask(oldmask); // before go back to caller, set the umask back
          return cb(err);
        }

        emitter.emit('log', 'Directory structure created', 'debug')

        async.forEach(files, function (file, done) {
          // get file permission and preserve
          fs.stat(file.src, function (err, status) {
            if (err) { return done(err); }
            var mode = status.mode & 0777;
            var readStream = fs.createReadStream(file.src)
            , writeStream = fs.createWriteStream(file.dest, {mode: mode});

            readStream.on('error', done)
            writeStream.on('error', done)
            readStream.pipe(writeStream).on('close', done)
          });
        }, function (err) {
          if (!err) emitter.emit('log', 'Files copied', 'debug');
          process.umask(oldmask); // before go back to caller, set the umask back
          cb(err);
        })
      })

    })
  })

  return emitter

}


