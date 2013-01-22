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

      if (options.excludes) {
        paths = paths.filter(function (path) {
          var exclude = options.excludes.some(function (re) {
            // Deal with case where a directory has had a '/' added
            if (/\/$/.test(path)) path = path.substr(0, path.length - 1)
            return re.test(path)
          })
          if (exclude) emitter.emit('log', 'Excluding ' + path, 'debug')
          return !exclude
        })
      }

      emitter.emit('log', paths.length + ' paths to copy', 'debug')

      var dirs = []
        , files = []

      paths.filter(function (path) {
        if  (/\/$/.test(path)) {
          dirs.push(join(options.dest, path))
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

      // Make the new dirs first
      async.forEach(dirs, mkdirp, function (err) {
        if (err) return cb(err)

        emitter.emit('log', 'Directory structure created', 'debug')

        async.forEach(files, function (file, done) {
          var readStream = fs.createReadStream(file.src)
            , writeStream = fs.createWriteStream(file.dest)

          readStream.on('error', done)
          writeStream.on('error', done)
          readStream.pipe(writeStream).on('close', done)

        }, function (err) {
          if (!err) emitter.emit('log', 'Files copied', 'debug')
          cb(err)
        })
      })

    })
  })

  return emitter

}