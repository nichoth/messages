var xtend = require('xtend')
var Ev = require('event-manifest/event')
var Store = require('pull-store')
var Push = require('./push')

function Component (effects, model) {
    var fns = xtend(effects, model.update)
    var component = {
        source: Push(Object.keys(fns)),
        state: Store(function scan (state, ev) {
            var fn = model.update[Ev.type(ev)]
            return fn(state, Ev.data(ev))
        }, model())
    }
    return component
}

module.exports = Component
