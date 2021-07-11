/**
 * MyPromise
 * 
 * 三个状态 pending / fulfilled / rejected
 * 实例方法：then / catch / finall
 * 静态方法：reject / resolve / all / any / race / allSettled
 *
 */

function MyPromise (func) {
   this.state = 'pending'
   this.value = undefined
   this.onResolvedList = []
   this.onRejectedList = []
   try {
     func(this._resolve.bind(this), this._reject.bind(this))
   } catch (e) {
     this._reject(e)
   }
 }
MyPromise.prototype._resolve = function (data) {
  if (this.state !== 'pending') return
  this.state = 'fulfilled'
  this.value = data
  this.onResolvedList.forEach(item => {
    if (typeof item === 'function') {
      item(data)
    }
  })
}
MyPromise.prototype._reject = function (err) {
  if (this.state !== 'pending') return
  this.state = 'rejected'
  this.value = err
  this.onRejectedList.forEach(item => {
    if (typeof item === 'function') {
      item(err)
    }
  })
}
function excluteFunc (p2, func, resolve, reject, data) {
  let x, isError = false
  try {
    x = func(data)
  } catch (e) {
    reject(e)
    isError = true
  }
  if (isError) return
  if (x === p2) {
    reject(new TypeError('chaining cycle'))
  } else if (x && (typeof x === 'object' || typeof x === 'function')) {
    let used = false
    try {
      let then = x.then
      if (typeof then === 'function') {
        then.call(x, (y) => {
          if (used) return
          used = true
          // y 可能是一个Promise
          excluteFunc(p2, () => y, resolve, reject, data)
        }, (e) => {
          if (used) return
          used = true
          reject(e)
        })
      } else {
        if (used) return
        used = true
        resolve(x)
      }
    } catch (e) {
      if (used) return
      used = true
      reject(e)
    }
  } else {
    resolve(x)
  }
}
MyPromise.prototype.then = function (onResolved, onRejected) {
  if (typeof onResolved !== 'function') onResolved = (v) => v
  if (typeof onRejected !== 'function') onRejected = (err) => { throw err }
  // 返回一个新的Promise，假设叫A，
  // 当resolveFunc/rejectFunc执行出错时，A立即reject
  // 执行没有出错，且返回一个promise时，promise有结果时，A才有结果
  // 执行没有出错，且返回一个值时，A立即resolve
  const p2 = new MyPromise((resolve, reject) => {
    let resolveFunc = () => {
      setTimeout(() => {
        excluteFunc(p2, onResolved, resolve, reject, this.value)
      })
    }
    let rejectFunc = () => {
      setTimeout(() => {
        excluteFunc(p2, onRejected, resolve, reject, this.value)
      })
    }
    if (this.state === 'fulfilled') {
      resolveFunc()
    } else if (this.state === 'rejected') {
      rejectFunc()
    } else if (this.state === 'pending') {
      this.onResolvedList.push(resolveFunc)
      this.onRejectedList.push(rejectFunc)
    }
  })
  return p2
}
MyPromise.prototype.catch = function (rejectFunc) {
  return this.then(null, rejectFunc)
}
MyPromise.prototype.finally = function (func) {
  return this.then(func, func)
}
MyPromise.resolve = function (data) {
  return new MyPromise(function(resolve) {
    resolve(data)
  })
}
MyPromise.reject = function (data) {
  return new MyPromise(function(resolve, reject) {
    reject(data)
  })
}
/**
* 返回一个Promise
* 只有arr里的都fulfilled了，这个Promise才fulfilled
* 只要arr里的有一个rejected，这个promise就会rejected
*
* 下面几个类似，不再重复实现了
* any 和其相反，只要有一个成功就成功， 全部失败才失败
* race 返回一个Promise， arr里只要有一个有成功/失败了，返回的Promise就成功/失败了
* allSettled 返回一个promise，当arr里的都有结果了不论是成功或失败，这个Promise就会resolve，resolve的数据和上面也有所不同，是promise列表
*/
MyPromise.all = function (arr) {
  let temp = arr.length, res = []
  return new MyPromise((resolve, reject) => {
    const checkResolve = () => {
      if (temp === 0) resolve(res)
    }
    arr.forEach((p, index) => {
      if (p instanceof MyPromise) {
        p.then(data => {
          temp--
          res[index] = data
          checkResolve()
        }).catch(e => {
          reject(e)
        })
      } else {
        temp--
        res[index] = p
        checkResolve()
      }
    })
  })
}

module.exports = MyPromise