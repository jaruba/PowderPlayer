var dezalgo = require('dezalgo')

module.exports = function (tasks, cb) {
  var current = 0
  var results = []
  if (cb) cb = dezalgo(cb)

  function done (err, result) {
    results.push(result)
    if (++current >= tasks.length || err) {
      if (cb) cb(err, results)
    } else {
      tasks[current](done)
    }
  }

  if (tasks.length) {
    tasks[0](done)
  } else {
    if (cb) cb(null, results)
  }
}
