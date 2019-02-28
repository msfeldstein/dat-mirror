const fs = require('fs')
const readline = require('readline')
const chalk = require('chalk')
const dataFilePath = require('../data-file-path')

const configPath = dataFilePath('dat-mirror-client-config.json')

async function readStdin(prompt) {
  return new Promise((resolve) => {
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

function rekey() {
  try {
    fs.unlinkSync(configPath)  
  } catch (err) {}
}

module.exports = async function(force) {
  if (force) {
    rekey()
  }
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