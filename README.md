# <img src="http://i.imgur.com/cty9V02.png"></img> PostgreSQL Adapter

[![NPM version][npm-image]][npm-url]
[![Build status][ci-image]][ci-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Code Climate][codeclimate-image]][codeclimate-url]

Streaming Uploads/Downloads using [Sails.js](http://sailsjs.org) and PostgreSQL.

## Install

```sh
$ npm install skipper-postgresql --save
```

## Usage

#### `config/skipper.js`
```js
module.exports.skipper = {
  connection: {
    adapter: require('skipper-postgresql'),
    connection: {
      host: 'localhost',
      user: 'postgres',
      password: 'postgres'
    },

    /**
     * OR
     *
    connection: 'postgres://postgres:postgres@localhost:5432/postgres'
     */,

     /**
      * table to store files in
      */
     fileTable: 'file'
  }
}
```

#### `api/controllers/FileController.js`
```js
module.exports = {
  upload: function (req, res) {
    req.file('upload').upload(sails.config.skipper, function (err, files) {
      if (err) return res.negotiate(err);

      res.ok(files)
    })
  },
  download: function (req, res) {
    var SkipperAdapter = sails.config.skipper.adapter;
    SkipperAdapter(sails.config.skipper).read(req.param('fd'), function (err, file) {
      if (err) return res.negotiate(err);

      res.send(new Buffer(file))
    })
  }
}
```

## License
MIT

## Maintained By
##### [<img src='http://i.imgur.com/zM0ynQk.jpg' height='34px'>](http://balderdash.co)

[npm-image]: https://img.shields.io/npm/v/waterline-postgresql.svg?style=flat-square
[npm-url]: https://npmjs.org/package/waterline-postgresql
[ci-image]: https://img.shields.io/travis/waterlinejs/skipper-postgresql/master.svg?style=flat-square
[ci-url]: https://travis-ci.org/waterlinejs/skipper-postgresql
[daviddm-image]: http://img.shields.io/david/waterlinejs/skipper-postgresql.svg?style=flat-square
[daviddm-url]: https://david-dm.org/waterlinejs/skipper-postgresql
[codeclimate-image]: https://img.shields.io/codeclimate/github/waterlinejs/skipper-postgresql.svg?style=flat-square
[codeclimate-url]: https://codeclimate.com/github/waterlinejs/skipper-postgresql
