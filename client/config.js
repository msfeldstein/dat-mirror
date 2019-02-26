const homedir = require('os').homedir()
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const readline = require('readline');
const chalk = require('chalk')

async function readStdin(prompt) {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question(prompt, answer => {
      rl.close()
      resolve(answer)
    })
  })
}

module.exports = async function() {
  const configPath = path.join(homedir, 'dat-mirror-client-config.json')
  let config = null
  try {
    config = JSON.parse(fs.readFileSync(configPath).toString())
  } catch (e) {
    const key = await readStdin('dat-mirror key > ')
    config = {
      mirrorKey: key
    }
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    console.log(`dat-mirror key set to ${chalk.green(key)}`)
  }
  return config
}