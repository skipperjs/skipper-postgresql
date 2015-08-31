var Adapter = require('../');

Adapter()

setTimeout(function () {
  require('skipper-adapter-tests')({
    mocha: {
      timeout: 10 * 1000,
      reporter: 'spec'
    },
    module: Adapter,
    container: 'skipper-adapter-tests'
  })
}, 5000);

setTimeout(function () {
  global.adapter.teardown()
}, 60 * 1000);
