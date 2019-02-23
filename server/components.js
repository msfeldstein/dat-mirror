const chalk = require('chalk')
const output = require('neat-log/output')
function siteList(state) {
  return state.currentlyHosted.map(siteEntry).join("\n---\n")
}

function siteEntry(site) {
  return output(`
      ${chalk.green(site.datKey)}
  
    `)
}

module.exports = {
  siteList
}