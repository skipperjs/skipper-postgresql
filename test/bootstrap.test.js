require('skipper-adapter-tests')({
  mocha: {
    timeout: 10 * 1000,
    reporter: 'spec'
  },
  module: require('../'),
  container: 'skipper-adapter-tests'
})

setTimeout(function () {
  adapter.teardown()
}, 60 * 1000);
