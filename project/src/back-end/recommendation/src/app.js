//import axios from 'axios' // we use this library as HTTP client
const axios = require('axios');
const log_url = process.env.LOG_URL
const val_url = process.env.VALIDATION_URL
const catalog_url = process.env.CATALOG_URL
const express = require('express')
const log = require('debug')(process.env.DEBUG)
const moment = require('moment')

const Nuser = 4
const Nitem = 3
const Nbest = 4

const app = express.Router()
const ck = require('./utils/recommender')

// GET /user/:username/:role/:token
// Indicates in a list which products are recommended for a particular user (whose name is username)
// username, role and token (string) are necessary for user authentification check
app.get('/user/:username/:role/:token', (req, res) => {
  const start = moment()
  var usr = req.params.username
  var role = req.params.role
  var token = req.params.token
  log(`Recommendation for user ${usr} with role ${role}`)
  axios.get(`${val_url}/validation/${usr}/${role}/${token}`)
    .then((out) => {
      ck.recommendByUser(usr)
        .then((output) => {
          axios.get(`${catalog_url}/catalog`)
            .then((doc) => { // check if some products were removed meanwhile
              var catalog = doc.data.output
              var recommendations = existingIds(catalog, output)
              var top = recommendations.slice(0, Nuser)
              const handling_time = -start.diff(moment())
              logPerformance(usr, role, handling_time, "recommendation")
              res.status(200).json({ status: 'success', output: top })
            })
            .catch((err) => {
              log(String(err))
              res.status(401).json({ status: 'error', message: String(err) })
            })
        })
        .catch((err) => {
          log(String(err))
          res.status(200).json({ status: 'success', output: [] })
        })
    })
    .catch((err) => {
      log(String(err))
      res.status(401).json({ status: 'error', message: String(err) })
    })
})

// GET /item/:id
// Indicates in a list which products are recommended for a given product.
// id is the id of the product for which we want to know the recommended products
app.get('/item/:id', (req, res) => {
  const start = moment()
  var id = req.params.id
  log(`Recommendation for product ${id}`)
  ck.recommendByItem(id)
    .then((output) => {
      axios.get(`${catalog_url}/catalog`)
        .then((doc) => { // check if some products were removed meanwhile
          var catalog = doc.data.output
          var recommendations = existingIds(catalog, output)
          var top = recommendations.slice(0, Nitem)
          const handling_time = -start.diff(moment())
          logPerformance("none", "none", handling_time, "recommendation")
          res.status(200).json({ status: 'success', output: top })
        })
        .catch((err) => {
          log(String(err))
          res.status(401).json({ status: 'error', message: String(err) })
        })
    })
    .catch((err) => {
      log(String(err))
      res.status(200).json({ status: 'success', output: [] })
    })
})

// GET /best
// Indicates in a list what are the most sold products among all the users
// In other words, what are the best-sellers
app.get('/best', (req, res) => {
  const start = moment()
  log(`Recommendation: best-sellers`)
  ck.treatBestSeller()
    .then((output) => {
      axios.get(`${catalog_url}/catalog`)
        .then((doc) => { // check if some products were removed meanwhile
          var catalog = doc.data.output
          var recommendations = existingIds(catalog, output)
          var top = recommendations.slice(0, Nbest)
          const handling_time = -start.diff(moment())
          logPerformance("none", "none", handling_time, "recommendation")
          res.status(200).json({ status: 'success', output: top })
        })
        .catch((err) => {
          log(String(err))
          res.status(401).json({ status: 'error', message: String(err) })
        })
    })
    .catch((err) => {
      log(String(err))
      res.status(200).json({ status: 'success', output: [] })
    })
})

// checks if the ids present in the list ids still exist in the catalog
// args: ids: list of ids (int)
// catalog (json): output of retrieving all the catalog
// return: existing : list of ids present in the catalog
function existingIds(catalog, ids) {
  var existing = []
  ids.forEach(id => {
    if (checkIfExists(catalog, id)) {
      existing.push(id)
    }
  })
  return existing
}
// check if the product with id "id" still exists in the catalog 
function checkIfExists(catalog, id) {
  for (var category in catalog) {
    if (catalog[category].hasOwnProperty(String(id))) {
      return true
    }
  }
  return false
}

// Logs the performance of the use of this microservice
function logPerformance(usr, role, handling_time, nature) {
  return axios.post(`${log_url}/log/performance`, { service: "recommendation", user: usr, role: role, handling_time: handling_time, nature: nature })
}

module.exports = app
