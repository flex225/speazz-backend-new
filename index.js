var express = require('express')
var logger = require('morgan')
var indexRouter = require('./routes')
var app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/', indexRouter)


app.use(function (err, req, res, next) {
  res.locals.message = err.message
  res.locals.error = err

  res.status(err.status || 500)
})

module.exports = app
