var S = require('pull-stream')
var pushable = require('pull-pushable')
var StringModel = require('./string')
var Model = require('../model')

var model = Model(StringModel)

var p = pushable()
S(
    S(p, model.effects()),
    model.store,
    S.log()
)

p.push(model.msg.foo('hello'))
p.push(model.msg.bar(' hi'))
p.push(model.msg.asyncThing())
p.end()


