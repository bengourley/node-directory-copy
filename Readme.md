[![Build Status](https://travis-ci.org/bengourley/node-directory-copy.png?branch=master)](https://travis-ci.org/bengourley/node-directory-copy)

Copy the contents of one directory to another, and leave behind specified exclusions.

## Install

```
npm install directory-copy
```

## Usage

```js
var copy = require('directory-copy')
```

### copy(options, cb)

- `options` is an options hash
  - `src` the source directory (required)
  - `dest` the destination directory (required)
  - `excludes` an array of RegExp objects to `.test()` filenames
    against. If the test returns true, the file won't be copied.
- `cb` is the callback `function (err) {}` (`err` is null if ok)

`copy()` returns an event emitter that emits 'log' events.

Eg:
```js
copy(
    { src: __dirname + '/source/static'
    , dest: __dirname + '/output/static'
    , excludes: [ /^\./ ] // Exclude hidden files
    }
  , function () {
    console.log('done!')
  })
  .on('log', function (msg, level) {
    // Level is debug, info, warn or error
    console.log(level + ': ' + msg)
  })
```