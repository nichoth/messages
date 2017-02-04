var test = require('tape')
// var Pushable = require('pull-pushable')
var S = require('pull-stream')
var Component = require('../')

test('component thing', function (t) {
    function model () {
        return 'hello'
    }
    model.update = {
        bar: function (state, ev) {
            return ev
        }
    }

    var ctrl = {
        foo: function (arg) {
            return ['bar', arg]
        }
    }

    t.plan(2)
    var c = Component(ctrl, model)
    S(
        c.source,
        S.map(function (ev) {
            var fn = ctrl[ev[0]]
            if (fn) return fn(ev[1])
            return ev
        }),
        c.state(),
        S.collect(function (err, res) {
            console.log(res)
            t.error(err)
            t.deepEqual(res, [ 'hello', 'world' ])
        })
    )

    c.source.push.foo('world')
    c.source.end()
})

