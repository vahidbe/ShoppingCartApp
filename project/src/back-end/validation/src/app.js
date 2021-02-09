//import axios from 'axios' // we use this library as HTTP client
const axios=require('axios');
const moment=require('moment');
const log_url = process.env.LOG_URL
const express = require('express')
const log = require('debug')(process.env.DEBUG)

const app = express.Router()
const ck = require('./utils/check')

// GET /validation/:username/:role/:token
// Checks that the user (identified by "username") has correctly been authentificated and the given "username" and "role"
// match what has been encoded in the "token" and that it hasn't expired yet
app.get('/validation/:username/:role/:token', (req, res) => {
  const start = moment()
  var usr = req.params.username
  var role = req.params.role
  var token = req.params.token
  log(`Validating token for user ${usr} with role ${role}`)
  return ck.checktoken(usr, role, token)
    .then((out) => {
      const handling_time = -start.diff(moment())
      log("HANDLING_TIME: "+handling_time)
      logPerformance(usr, role, handling_time, "token validation")
        .then((out) => 
          res.status(200).json({ status: 'success' })
        )
        .catch((err) => {
          log(String(err))
          res.status(200).json({ status: 'success' })
        })
    })
    .catch((err) => {
      log(String(err))
      res.status(401).json({ status: 'error', message: String(err) })
    })
})

// Logs the performance of the use of this microservice
function logPerformance(usr, role, handling_time, nature) {
  return axios.post(`${log_url}/log/performance`, { service: "validation", user: usr, role: role, handling_time: handling_time, nature: nature })
}

module.exports = app
