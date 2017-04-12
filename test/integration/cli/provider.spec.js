'use strict'

const fs = require('fs')
const exec = require('child_process').exec
const request = require('request')
const jackal = require('../helpers/jackal')
const Provider = require('../helpers/provider')

describe('CLI.Run Integration Test', function () {
  let providerOne, providerTwo

  before(function (done) {
    providerOne = new Provider()
    providerOne.start({ port: 8379 }, done)
  })

  before(function (done) {
    providerTwo = new Provider()
    providerTwo.start({ port: 8380 }, done)
  })

  after(function (done) {
    providerOne.stop(done)
  })

  after(function (done) {
    providerTwo.stop(done)
  })

  context('using JSON reporter', function () {
    let port, dbPath, options

    before(function (done) {
      port = 8378
      dbPath = 'test/integration/api/provider.json'
      options = {
        port: port,
        quiet: true,
        db: { path: dbPath }
      }

      jackal.start(options, done)
    })

    before(function (done) {
      const buf = fs.readFileSync('test/integration/contracts/provider.json')

      const req = {
        url: `http://localhost:${port}/api/contracts`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: buf
      }

      request(req, (err, res, body) => {
        if (err) { return done(err) }
        done()
      })
    })

    it('should get a list of contract results for the specified provider', function (done) {
      const expected = [
        { name: 'provider_one/receipt_api/OK', consumer: 'consumer', status: 'Pass', error: null},
        { name: 'provider_one/user_api/OK', consumer: 'consumer', status: 'Pass', error: null}
      ]

      exec(`node index run -r json http://localhost:${port} provider_one`, (err, stdout, stderr) => {
        const parsed = JSON.parse(stdout)
        const parsedBody = JSON.parse(parsed.body)

        expect(err).to.not.exist
        expect(parsed.statusCode).to.equal(200)
        expect(parsedBody).to.eql(expected)
        expect(stderr).to.equal('')
        done()
      })
    })

    it('should get a list of contract results including failures for the specified provider', function (done) {
      const expected = [
        { name: 'provider_two/product_api/OK', consumer: 'consumer', status: 'Fail', error: 'Error: Contract failed: "description" must be a number' }
      ]

      exec(`node index run -r json http://localhost:${port} provider_two`, (err, stdout, stderr) => {
        const parsed = JSON.parse(stdout)
        const parsedBody = JSON.parse(parsed.body)

        expect(err).to.not.exist
        expect(parsed.statusCode).to.equal(200)
        expect(parsedBody).to.eql(expected)
        expect(stderr).to.equal('')
        done()
      })
    })

    it('should get a no contracts found message for an unknown provider', function (done) {
      exec(`node index run -r json http://localhost:${port} provider_three`, (err, stdout, stderr) => {
        const parsed = JSON.parse(stdout)
        const parsedBody = JSON.parse(parsed.body)

        expect(err).to.not.exist
        expect(parsed.statusCode).to.equal(200)
        expect(parsedBody).to.eql({ message: 'No contracts exist for provider: provider_three' })
        expect(stderr).to.equal('')
        done()
      })
    })

    after(function (done) {
      fs.stat(dbPath, (err, stats) => {
        if (stats) { fs.unlink(dbPath, done) }
        else { done() }
      })
    })

    after(jackal.stop)
  })

  context('using spec reporter', function () {
    let port, dbPath, options

    before(function (done) {
      port = 8378
      dbPath = 'test/integration/api/provider.json'
      options = {
        port: port,
        quiet: true,
        db: { path: dbPath }
      }

      jackal.start(options, done)
    })

    before(function (done) {
      const buf = fs.readFileSync('test/integration/contracts/provider.json')

      const req = {
        url: `http://localhost:${port}/api/contracts`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: buf
      }

      request(req, (err, res, body) => {
        if (err) { return done(err) }
        done()
      })
    })

    it('should get a list of contract results for the specified provider', function (done) {
      const expected = 'provider_one contracts executed\n  consumer contracts executed against provider_one\n    ✔ Test receipt_api-OK passed for consumer against provider_one\n    ✔ Test user_api-OK passed for consumer against provider_one\n'

      exec(`node index run -r spec http://localhost:${port} provider_one`, (err, stdout, stderr) => {
        expect(err).to.not.exist
        expect(stdout).to.equal(expected)
        expect(stderr).to.equal('')
        done()
      })
    })

    it('should get a list of contract results including failures for the specified provider', function (done) {
      const expected = 'Failure - not all contracts passed\nprovider_two contracts executed\n  consumer contracts executed against provider_two\n    ✖ Test product_api-OK failed for consumer against provider_two\n    Error: Contract failed: "description" must be a number\n'

      exec(`node index run -r spec http://localhost:${port} provider_two`, (err, stdout, stderr) => {
        expect(err).to.not.exist
        expect(stdout).to.equal(expected)
        expect(stderr).to.equal('')
        done()
      })
    })

    it('should get a no contracts found message for an unknown provider', function (done) {
      const expected = 'No contracts exist for provider: provider_three\n'

      exec(`node index run -r spec http://localhost:${port} provider_three`, (err, stdout, stderr) => {
        expect(err).to.not.exist
        expect(stdout).to.equal(expected)
        expect(stderr).to.equal('')
        done()
      })
    })

    after(function (done) {
      fs.stat(dbPath, (err, stats) => {
        if (stats) { fs.unlink(dbPath, done) }
        else { done() }
      })
    })

    after(jackal.stop)
  })

  context('using teamcity reporter', function () {
    let port, dbPath, options

    before(function (done) {
      port = 8378
      dbPath = 'test/integration/api/provider.json'
      options = {
        port: port,
        quiet: true,
        db: { path: dbPath }
      }

      jackal.start(options, done)
    })

    before(function (done) {
      const buf = fs.readFileSync('test/integration/contracts/provider.json')

      const req = {
        url: `http://localhost:${port}/api/contracts`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: buf
      }

      request(req, (err, res, body) => {
        if (err) { return done(err) }
        done()
      })
    })

    it('should get a list of contract results for the specified provider', function (done) {
      const expected = '##teamcity[testSuiteStarted name=\'provider_one-contracts\']\n##teamcity[testSuiteStarted name=\'consumer-contracts-executed-against-provider_one\']\n##teamcity[testStarted name=\'consumer.receipt_api.OK\']\n##teamcity[testFinished name=\'consumer.receipt_api.OK\']\n##teamcity[testStarted name=\'consumer.user_api.OK\']\n##teamcity[testFinished name=\'consumer.user_api.OK\']\n##teamcity[testSuiteEnded name=\'consumer-contracts-executed-against-provider_one\']\n##teamcity[testSuiteEnded name=\'provider_one-contracts\']\n'

      exec(`node index run -r teamcity http://localhost:${port} provider_one`, (err, stdout, stderr) => {
        expect(err).to.not.exist
        expect(stdout).to.equal(expected)
        expect(stderr).to.equal('')
        done()
      })
    })

    it('should get a list of contract results including failures for the specified provider', function (done) {
      const expected = '##teamcity[testSuiteStarted name=\'provider_two-contracts\']\n##teamcity[testSuiteStarted name=\'consumer-contracts-executed-against-provider_two\']\n##teamcity[testStarted name=\'consumer.product_api.OK\']\n##teamcity[testFailed name=\'consumer.product_api.OK\' message=\'Test failed for consumer\' details=\'Error: Contract failed: "description" must be a number\']\n##teamcity[testFinished name=\'consumer.product_api.OK\']\n##teamcity[testSuiteEnded name=\'consumer-contracts-executed-against-provider_two\']\n##teamcity[testSuiteEnded name=\'provider_two-contracts\']\n'

      exec(`node index run -r teamcity http://localhost:${port} provider_two`, (err, stdout, stderr) => {
        expect(err).to.not.exist
        expect(stdout).to.equal(expected)
        expect(stderr).to.equal('')
        done()
      })
    })

    it('should get a no contracts found message for an unknown provider', function (done) {
      const expected = '{"message":"No contracts exist for provider: provider_three"}\n'

      exec(`node index run -r teamcity http://localhost:${port} provider_three`, (err, stdout, stderr) => {
        expect(err).to.not.exist
        expect(stdout).to.equal(expected)
        expect(stderr).to.equal('')
        done()
      })
    })

    after(function (done) {
      fs.stat(dbPath, (err, stats) => {
        if (stats) { fs.unlink(dbPath, done) }
        else { done() }
      })
    })

    after(jackal.stop)
  })
})
