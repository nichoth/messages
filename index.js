var Scan = require('pull-scan')
var flatMerge = require('pull-flat-merge')
var S = require('pull-stream')
var Ev = require('event-manifest/event')

// return a writable bus and a readable stream of state
// i guess that's a duplex stream
// => { sink: writable, source: readable }

// S(view, component)
// S(component, view)
// i guess this is two duplux streams

// S(view, component, view)

function Component (effects, model) {
    var state = model()

    function scan () {
        return Scan(function (state, ev) {
            var type = Ev.type(ev)
            return model.update[type](state, Ev.data(ev))
        }, state)
    }

    function sink () {
        return S.map(function (ev) {
            var fn = effects[Ev.type(ev)]
            if (!fn) return ev
            return fn(state, Ev.data(ev))
        })
    }

    return function () {
        return S(
            sink(),
            flatMerge(),
            scan()
        )
    }
}

var view = S.values([
    Ev('foo', 'hello'),
    Ev('bar', 'world'),
    Ev('asyncThing', null),
    Ev('bla', '!!!')
])

var effects = {
    foo: (state, ev) => Ev('baz', ev),
    bar: (state, ev) => Ev('bla', ev),
    asyncThing: function (state, ev) {
        return S(
            S.values([ Ev('bla', '111') ]),
            S.asyncMap(function (ev, cb) {
                process.nextTick(cb.bind(null, null, ev))
            })
        )
    }
}

function model () { return '' }
model.update = {
    baz: (state, ev) => state + ev,
    bla: (state, ev) => state + ' ' + ev
}

var component = Component(effects, model)

S(
    view,
    component(),
    S.log()
)
