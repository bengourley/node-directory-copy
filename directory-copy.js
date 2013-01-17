module.exports = copy

var fs = require('fs')
  , async = require('async')
  , ncp = require('ncp').ncp
  , join = require('path').join
  , defaultLogger =
      { debug: console.log
      , info: console.log
      , warn: console.log
      , error: console.log
      }

function copy(options, cb) {

  var logger = options.logger || defaultLogger

  if (!options.src || !options.dest) {
    return cb(new Error('src and dest must be supplied'))
  }

  fs.readdir(options.src, function (err, files) {
    if (err) {
      logger.error('Failed to read directory')
      logger.error(err)
      return cb(err)
    }
    async.forEach(files, function (file, callback) {

      if (options.excludes) {
        var exclude = options.excludes.some(function (pattern) {
          return pattern.test(file)
        })
        if (exclude) return callback()
      }

      async.parallel([
        function (callback) {
          ncp(join(options.src, file), join(options.dest, file),
            function (err) {
              if (err) return callback(err)
              logger.debug('Copied ' + file + ' to preview')
              callback()
            }
          )
        }], callback)

    }, function (err) {
      if (err) {
        logger.error('Failed to copy files')
        console.log(err)
      }
      cb()
    })
  })

}