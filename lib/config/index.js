'use strict'

const fs = require('fs')
const yaml = require('js-yaml')
const defaultConfig = require('./default-config')

const getConfig = (options) => {
  let config = Object.assign({}, defaultConfig())
  const configPath = options.configPath || './jackal.json'

  if (fs.existsSync(configPath)) {
    const buffer = fs.readFileSync(configPath)

    return configPath.endsWith('json')
      ? Object.assign(config, JSON.parse(buffer.toString()))
      : Object.assign(config, yaml.safeLoad(buffer.toString()))
  }

  return config
}

module.exports = (options) => {
  let config = getConfig(options)

  config.jackal.port = options.port || config.jackal.port
  config.quiet = options.quiet || config.quiet
  config.db = options.db || config.db

  return config
}
