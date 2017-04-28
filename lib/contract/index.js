'use strict'

const Joi = require('joi')
const _ = require('lodash')
const async = require('async')
const request = require('request')
const pkg = require('../../package')
const mapHook = require('./map-hook')

const requiredOptions = [
  'name',
  'consumer',
  'request',
  'response'
]

const joiOptions = {
  allowUnknown: true,
  presence: 'required'
}

function validateOptions (options) {
  options = options || {}
  requiredOptions.forEach((key) => {
    if (!options.hasOwnProperty(key)) {
      throw new Error(`Invalid contract: Missing required property [${key}]`)
    }
  })
}

function createError (detail, path, res, body) {
  const message = `Contract failed: ${detail.message}`

  const err = new Error(message)
  err.message = message

  const status = `response.statusCode: ${res.statusCode}\n`

  const stringified = typeof body === 'string' ? body : JSON.stringify(body)
  const responseBody = `response.body: ${stringified.trim()}`

  err.detail = `${status}${responseBody}`

  return err
}

var Contract = function (options) {
  validateOptions(options)
  this.name = options.name
  this.consumer = options.consumer
  this.before = options.before
  this.after = options.after

  this._request = options.request
  this._response = options.response
  this._client = request.defaults({
    headers: { 'user-agent': 'jackal/' + pkg.version }
  })

  if (options.joiOptions) {
    this.joiOptions = _.merge(joiOptions, options.joiOptions)
  }
}

Contract.prototype.validate = function (cb) {
  const schema = Joi.object().keys(this._response)

  let beforeHooks = []
  let afterHooks = []

  if (this.before) { beforeHooks = this.before.map(mapHook) }
  if (this.after) { afterHooks = this.after.map(mapHook) }

  const execute = (done) => {
    const shouldBeJson = (body) => Array.isArray(body) || typeof body === 'object'
    const sanitiseBody = (body) => shouldBeJson(body) ? JSON.stringify(body) : body

    if (this._request.body) {
      this._request.body = sanitiseBody(this._request.body)
    }

    this._client(this._request, (err, res, body) => {
      if (err) { return done(new Error(`Request failed: ${err.message}`)) }

      const result = Joi.validate(res, schema, joiOptions)
      if (result.error) {
        const detail = result.error.details[0]
        const path = detail.path
        return done(createError(detail, path, res, body))
      }

      done()
    })
  }

  const afterHooksCb = (err) => err ? cb(err) : async.series(afterHooks, cb)
  const beforeHooksCb = (err) => err ? cb(err) : execute(afterHooksCb)

  async.series(beforeHooks, beforeHooksCb)
}

module.exports = Contract