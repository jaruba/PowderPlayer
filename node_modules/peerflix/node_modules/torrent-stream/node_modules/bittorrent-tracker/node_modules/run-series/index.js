module.exports = function (tasks, cb) {
  var current = 0
  var results = []
  cb = cb || function () {}

  function done (err, result) {
    if (err) return cb(err, results)
    results.push(result)

    if (++current >= tasks.length) {
      cb(null, results)
    } else {
      tasks[current](done)
    }
  }

  if (tasks.length) {
    tasks[0](done)
  } else {
    cb(null, [])
  }
}
