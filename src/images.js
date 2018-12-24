// @preval

const fs = require('fs')
const splash = fs.readdirSync(__dirname + '/../public/splash').map(name => '/splash/' + name)
const people = {}
fs.readdirSync(__dirname + '/../private/images').forEach(file => {
  const parts = file.split('.')
  const person = parts[0].replace(/-/g, ' ')
  if (!people[person]) {
    people[person] = []
  }
  people[person].push(file)
})

module.exports = {splash, people}
