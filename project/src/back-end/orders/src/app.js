const axios=require('axios');
const log_url = process.env.LOG_URL
const val_url = process.env.VAL_URL
const express = require('express')
const moment = require('moment')
const log = require('debug')(process.env.DEBUG)

const app = express.Router()
const db = require('./utils/order')

// POST /order $(data)
// Adds a new order for user (identified by "username") with products "products" to the orders database
// $(data) is a JSON object containing the following fields:
//  username: the username of the user adding a new order
//  role: the role of the user
//  token: a token used for authentification check
//  products: a list of products that are to be added to this order
//    the elements of this list must be JSON objects with a field "name" identifying the product
app.post('/order', (req, res) => {
  const usr = req.body.username
  const role = req.body.role
  const token = req.body.token
  const products = req.body.products
  const start = moment()
  axios.get(`${val_url}/validation/${usr}/${role}/${token}`)
    .then((out) => {
      db.addOrder(usr, products)
      .then(() => {        
        logOrder(usr, products).then((out)=>{
          const handling_time = -start.diff(moment())
          logPerformance(usr, role, handling_time, "ordering products")
          res.status(200).json({ status: 'success' })
        })
      })
      .catch((err) => {
        log(String(err))
      })
    })
    .catch((err) => {
      log(String(err))
      res.status(401).json({ status: 'error', message: String(err) })
    })
})

// GET /order/:username/:role/:token
// Retrieves the orders made by the user identified by "username"
// role and token are used to check the authentification status of the user
app.get('/order/:username/:role/:token', (req, res) => {
  const start = moment()
  var usr = req.params.username
  var role = req.params.role
  var token = req.params.token
  axios.get(`${val_url}/validation/${usr}/${role}/${token}`)
  .then((out) => {
    db.readOrders(usr)
    .then((ordersForUser) => {     
      const handling_time = -start.diff(moment())
      logPerformance(usr, role, handling_time, "getting orders")
      res.status(200).json({ status: 'success', orders: ordersForUser.orders })
    })
    .catch((err) => {
      log(String(err))
      res.status(200).json({ status: 'success', orders: [] })
    })
  })
  .catch((err) => {
    log(String(err))
    res.status(401).json({ status: 'error', message: String(err) })
  })
})

// Logs an order event
function logOrder(usr, products) {
  return axios.post(`${log_url}/log/order`, { user: usr, products: products })
        .then((res) => {
          log("Sent log Successfully")
        })
        .catch((err) => log(err.message))
}

// Logs a performance log
function logPerformance(usr, role, handling_time, nature) {
  axios.post(`${log_url}/log/performance`, { service: "orders", user: usr, role: role, handling_time: handling_time, nature: nature })
        .then((res) => {
          log("Sent perf log Successfully")
        })
        .catch((err) => log(err.message))
}

module.exports = app
