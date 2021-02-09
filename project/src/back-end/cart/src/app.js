const axios=require('axios');
const log_url = process.env.LOG_URL
const val_url = process.env.VAL_URL
const ord_url = process.env.ORD_URL
const express = require('express')
const moment = require('moment')
const log = require('debug')(process.env.DEBUG)

const app = express.Router()
const db = require('./utils/cart')

// POST /cart/add ${data}
// Adds a list of products with a certain quantity to the user's (identified with username) cart
// ${data} is a JSON object with the following fields:
// username, role and token (string) necessary for user authentification check
// products, a list of JSON objects containing a "name" field identifying a product
// and a "quantity" field specifying the number of times this product must be added
app.post('/cart/add', (req, res) => {
  const usr = req.body.username
  const role = req.body.role
  const token = req.body.token
  const products = req.body.products
  const start = moment()
  axios.get(`${val_url}/validation/${usr}/${role}/${token}`)
    .then((out) => {
      db.addToCart(usr, [...products])
      .then(() => {        
        logCart(usr, "add", [...products]).then((out)=>{
          const handling_time = -start.diff(moment())
          logPerformance(usr, role, handling_time, "adding products to cart")
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

// POST /cart/remove ${data}
// Removes a list of products with a certain quantity from the user's (identified with username) cart
// ${data} is a JSON object with the following fields:
// username, role and token (string) necessary for user authentification check
// products, a list of JSON objects containing a "name" field identifying a product
// and a "quantity" field specifying the number of times this product must be removed
app.post('/cart/remove', (req, res) => {
  const usr = req.body.username
  const role = req.body.role
  const token = req.body.token
  const products = req.body.products
  const start = moment()
  axios.get(`${val_url}/validation/${usr}/${role}/${token}`)
    .then((out) => {
      db.removeFromCart(usr, products)
      .then(() => {        
        logCart(usr, "remove", products).then((out)=>{       
          const handling_time = -start.diff(moment())
          logPerformance(usr, role, handling_time, "removing products from cart")
          res.status(200).json({ status: 'success' })
        })
      })
      .catch((err) => {
        log(String(err))
        res.status(404).json({ status: 'error', message: String(err) })
      })
    })
    .catch((err) => {
      log(String(err))
      res.status(401).json({ status: 'error', message: String(err) })
    })
})

// POST /cart/checkout ${data}
// Adds the content of the cart to the orders of the user (identified with username) and then removes its content.
// ${data} is a JSON object with the following fields:
// username, role and token (string) necessary for user authentification check
app.post('/cart/checkout', (req, res) => {
  const usr = req.body.username
  const role = req.body.role
  const token = req.body.token
  const start = moment()
  db.getCart(usr)
  .then((cart) => {
    var cart = cart.cart
    axios.post(`${ord_url}/order`, { username: usr, role: role, token: token, products: cart })
      .then((out) => {
        db.emptyCart(usr)
          .then(() => {        
            logCart(usr, "checkout", cart).then((out)=>{   
              const handling_time = -start.diff(moment())
              logPerformance(usr, role, handling_time, "checking out cart")
              res.status(200).json({ status: 'success' })
            })
          })
          .catch((err) => {
            log(String(err))
            res.status(401).json({ status: 'error', message: String(err) })
          })
      })
      .catch((err) => {
        log(String(err))
        res.status(401).json({ status: 'error', message: String(err) })
      })
  })
  .catch((err) => {
    log(String(err))
    res.status(404).json({ status: 'error', message: String(err) })
  })
})

// GET /cart/:username/:role/:token
// Retrieves the cart of a user (identified with username)
// username, role and token (string) are necessary for user authentification check
app.get('/cart/:username/:role/:token', (req, res) => {
  const start = moment()
  var usr = req.params.username
  var role = req.params.role
  var token = req.params.token
  axios.get(`${val_url}/validation/${usr}/${role}/${token}`)
  .then((out) => {
    db.getCart(usr)
    .then((cart) => {        
      logCart(usr, "get", cart.cart).then((out)=>{
        const handling_time = -start.diff(moment())
        logPerformance(usr, role, handling_time, "getting cart")
        res.status(200).json({ status: 'success', cart: cart.cart })
      })
    })
    .catch((err) => {
      log(String(err))
      res.status(200).json({ status: 'success', cart: [] })
    })
  })
  .catch((err) => {
    log(String(err))
    res.status(401).json({ status: 'error', message: String(err) })
  })
})

// Adds a log to the cart logs
function logCart(usr, action, products) {
  return axios.post(`${log_url}/log/cart`, { user: usr, action: action, products: products })
        .catch((err) => log(err.message))
}

// Logs the performance of the use of this microservice
function logPerformance(usr, role, handling_time, nature) {
  return axios.post(`${log_url}/log/performance`, { service: "cart", user: usr, role: role, handling_time: handling_time, nature: nature })
        .catch((err) => log(err.message))
}

module.exports = app
