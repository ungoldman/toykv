import repl from 'node:repl'

let db = {}
const tr = []
let target = db

const COMMANDS = {
  // store the value for key
  SET (key, value) { target[key] = value },

  // return the current value for key
  GET (key) { return target[key] },

  // remove the entry for key
  DELETE (key) { delete target[key] },

  // return the number of keys that have the given value
  COUNT (value) { return Object.values(target).filter(v => v === value).length },

  // start a new transaction
  BEGIN () {
    tr.unshift(Object.assign({}, target))
    target = tr[0]
  },

  // complete the current transaction
  COMMIT () {
    if (tr[0] == null) return console.log('Error: No transaction to commit')
    db = tr.shift()
    target = tr[0] || db
  },

  // revert to state prior to BEGIN call
  ROLLBACK () {
    if (tr[0] == null) return console.log('Error: No transaction to rollback')
    tr.shift()
    target = tr[0] || db
  }
}

const HELP_CMDS = ['HELP', 'help', '?']

function help () {
  console.log(`
Available commands:

SET <key> <value>   store the value for key
GET <key>           return the current value for key
DELETE <key>        remove the entry for key
COUNT <value>       return the number of keys that have the given value
BEGIN               start a new transaction
COMMIT              complete the current transaction
ROLLBACK            revert to state prior to BEGIN call
HELP, help, ?       print this help text
`)
}

/**
 * evaluates user input and runs the appropriate command
 * @param {string} input - user input
 * @param {object} context - javascript context (top-level object) (not used)
 * @param {string} filename - not used
 * @param {function} callback - provide command result and continue repl
 * @returns
 */
function evalCmd (input, context, filename, callback) {
  // get args from input
  const [cmd, key, value] = input.trim().split(' ')

  if (HELP_CMDS.includes(cmd)) {
    help()
    return callback(null)
  }

  // handle invalid commands
  if (!(cmd in COMMANDS)) {
    console.log('Error: Invalid command')
    return callback(null)
  }

  // run the command
  const result = COMMANDS[cmd](key, value)

  // passing result prints to stdout
  callback(null, result)
}

repl.start({ prompt: '> ', eval: evalCmd, ignoreUndefined: true })
