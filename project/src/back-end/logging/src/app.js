const express = require('express')
const log = require('debug')(process.env.DEBUG)

const app = express.Router()
const db = require('./utils/logger')

// POST /log/login $(data)
// Logs a login event
// $(data) is a JSON object that contains the user's username in a field "user"
app.post('/log/login', (req, res) => {
  var usr = req.body.user
  db.addLogin(usr).then((out) => {
    res.status(200).json({ status: 'success'})
  }).catch((err) => {
    log(String(err))
    res.status(500).json({ status: 'error', message: String(err) })
  })
})

// POST /log/register $(data)
// Logs a register event
// $(data) is a JSON object that contains the user's username in a field "user"
app.post('/log/register', (req, res) => {
  var usr = req.body.user
  log("logging register")
  db.addRegister(usr).then((out) => {
    res.status(200).json({ status: 'success'})
  }).catch((err) => {
    log(String(err))
    res.status(500).json({ status: 'error', message: String(err) })
  })
})

// POST /log/order $(data)
// Logs a new order
// $(data) is a JSON object that contains the user's username in a field "user"
// it also contains a field "products" containing the list of products of this order
// the products in this list must have a field "name" that identifies them
app.post('/log/order', (req, res) => {
  var usr = req.body.user
  var products = req.body.products
  db.addOrder(usr, products).then((out) => {
    res.status(200).json({ status: 'success'})
  }).catch((err) => {
    log(String(err))
    res.status(500).json({ status: 'error', message: String(err) })
  })
})

// POST /log/cart $(data)
// Logs a new cart manipulation
// $(data) is a JSON object that contains the user's username in a field "user"
// it also contains a field "action" that is either "add", "remove" or "get"
// and another field "products" containing the list of products involved in this action
app.post('/log/cart', (req, res) => {
  var usr = req.body.user
  var action = req.body.action
  var products = req.body.products
  db.addCart(usr, action, products)
  .then((out) => {
    res.status(200).json({ status: 'success'})
  }).catch((err) => {
    log(String(err))
    res.status(500).json({ status: 'error', message: String(err) })
  })
})

// POST /log/catalog $(data)
// Logs a new catalog manipulation
// $(data) is a JSON object that contains the user's username in a field "user"
// it also contains a field "action" that is either "add", "modify", "delete", "get item" or "get all catalog",
// another field "products" containing the products involved in this action
// and a field queryType (= "post", "item" or "get") to distinguish between doing something in the catalog and getting something.
app.post('/log/catalog', (req, res) => {
  var usr = req.body.user
  var action = req.body.action
  var products = req.body.products
  var queryType = req.body.queryType

  if (queryType == "post"){
    db.addCatalogModif(usr, action, products)
    .then((out) => {
      res.status(200).json({ status: 'success'})
    }).catch((err) => {
      log(String(err))
      res.status(500).json({ status: 'error', message: String(err) })
    })
  }
  else{
    db.addCatalogGet(queryType, products)
    .then((out) => {
      res.status(200).json({ status: 'success'})
    }).catch((err) => {
      log(String(err))
      res.status(500).json({ status: 'error', message: String(err) })
    })
  }  
})

// POST /log/performance $(data)
// Adds a new performance log
// $(data) is a JSON object that contains the following field:
//  service: the microservice sending this performance log
//  user: the user that called the microservice
//  handling_time: the time that the microservice took to process the user's request
//  role: the role of the user
//  nature: the nature of the call
app.post('/log/performance', (req, res) => {
  var srv = req.body.service
  var usr = req.body.user
  var prf = req.body.handling_time
  var rol = req.body.role
  var ntr = req.body.nature
  db.addPerformance(usr, rol, srv, prf, ntr)
  .then((out) => {
    res.status(200).json({ status: 'success'})
  }).catch((err) => {
    log(String(err))
    res.status(500).json({ status: 'error', message: String(err) })
  })
})

// GET /log
// Gets all the logs
app.get('/log', (req, res) => {
  log(`Getting logs`)
  return db.readLogs()
    .then((logs) => {
      res.status(200).json({ status: 'success', logs })
    })
    .catch((err) => {
      log(String(err))
      res.status(404).json({ status: 'error', message: String(err) })
    })
})

module.exports = app
