const express = require('express')
const log = require('debug')('users-d')

const app = express.Router()
const db =
  process.env.WITH_PERSISTENT_DATA ? require('./utils/crud-wp') : require('./utils/crud')

app.post('/user', (req, res) => {
  var usr = req.body.username
  var usrPassw = req.body.password
  log(`Creating a new user (${usr}) identified with "${usrPassw}"`)
  return db.createUser(usr, usrPassw)
    .then((token) => {
      res.status(200).json({ status: 'success', token })
    })
    .catch((err) => {
      res.status(409).json({ status: 'error', message: String(err) })
    })
})

app.get('/user/:username/:password', (req, res) => {
  var usr = req.params.username
  var passw = req.params.password
  log(`Getting user (${usr})`)
  return db.getUser(usr, passw)
    .then((token) => {
      res.status(200).json({ status: 'success', token })
    })
    .catch((err) => {
      res.status(404).json({ status: 'error', message: String(err) })
    })
})

module.exports = app
