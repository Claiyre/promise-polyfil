var promisesAplusTests = require("promises-aplus-tests");
var MyPromise = require('./index')

const adapter = {
  deferred: () => {
    const result = {}
    result.promise = new MyPromise((resolve1, reject1) => {
      result.resolve = resolve1
      result.reject = reject1
    })
    return result
  }
}

promisesAplusTests(adapter, function (err) {
  // All done; output is in the console. Or check `err` for number of failures.
  console.log('done')
  console.log(err)
});