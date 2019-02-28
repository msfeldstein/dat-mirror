const chalk = require('chalk')
const output = require('neat-log/output')
const fixedWidthString = require('fixed-width-string')

function view(state) {
  const width = process.stdout.columns
  return output(`
    ${chalk.bgGreen.black(fixedWidthString(`** ${chalk.bold('dat-mirror')} ** key: ${state.mirrorKey}`, width))}
    ${siteList(state)}
  `)
}

function siteList(state) {
  return state.currentlyHosted.map(siteEntry).join("\n---\n")
}

function siteEntry(site) {
  const noSubdomain = !site.http.subdomain || site.http.subdomain == ""
  const httpPrefix = noSubdomain ? '' : `${site.http.subdomain}.`
  const httpSuffix = noSubdomain ? site.datKey : ''
  const datURL = `dat://${site.datKey}`
  return output(`
      ${chalk.green(datURL)}
      http://${httpPrefix}yourdomain.com/${httpSuffix}
      Sync: ${Math.ceil(site.dat.syncPercent * 100)}%
    `)
}

module.exports = {
  view
}