const axios=require('axios');
const express = require('express')
const log = require('debug')('users-d')
const moment = require('moment')
const log_url = process.env.LOG_URL

const app = express.Router()
const db = require('./utils/crud-wp')

// POST /user $(data)
// Registers a user (identified with "username") with role "role" and returns a token
// $(data) is a JSON object with a "username" and a "role" field (string)
app.post('/user', (req, res) => {
  var usr = req.body.username
  var role = req.body.role
  if (!(role === "user") && !(role === "admin")) {
    res.status(404).json({ status: 'error', message: "Incorrect role"})
    log("Incorrect role")
    return
  }
  var usrPassw = req.body.password
  const start = moment()
  log("db url:" + process.env.LOG_URL)
  log(`Creating a new user (${usr}) identified with "${usrPassw}"`)
  return db.createUser(usr, role, usrPassw)
    .then((token) => {
      logAction(usr, "register").then((out)=>{
        const handling_time = -start.diff(moment())
        logPerformance(usr, role, handling_time, "creation of a user")
        res.status(200).json({ status: 'success', token })
      })
    })
    .catch((err) => {
      log(String(err))
      res.status(409).json({ status: 'error', message: "User with this username already exists" })
    })
})

// GET /user/:username/:password
// Returns a token if the user (identified with "username") exists and his "password" 
// matches the one in the database
app.get('/user/:username/:password', (req, res) => {
  var usr = req.params.username
  var passw = req.params.password
  const start = moment()
  log(`Getting user (${usr})`)
  return db.getUser(usr, passw)
    .then((out) => {
      const token = out.token
      const role = out.role
      logAction(usr, "login").then((out)=>{
        const handling_time = -start.diff(moment())
        logPerformance(usr, role, handling_time, "login")
        res.status(200).json({ status: 'success', payload:{ token:token, role:role }})
      })
    })
    .catch((err) => {
      res.status(404).json({ status: 'error', message: String(err) })
    })
})

// Logs one of the actions mentionned above
function logAction(usr, action) {
  return axios.post(`${log_url}/log/${action}`, { user: usr })
        .then((res) => {
          log("Sent log Successfully")
        })
        .catch((err) => log(err.message))
}

// Logs a performance log
function logPerformance(usr, role, handling_time, nature) {
  axios.post(`${log_url}/log/performance`, { service: "auth", user: usr, role: role, handling_time: handling_time, nature: nature })
        .then((res) => {
          log("Sent perf log Successfully")
        })
        .catch((err) => log(err.message))
}

module.exports = app
