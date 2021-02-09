const log = require('debug')(process.env.DEBUG)

var db = require('nano')(process.env.DB_URL)

// Adds an order to the orders database
function addOrder (username, products) {
  const timestamp = new Date().toUTCString()
  const payload = {
    time: timestamp,
    products: products
  }
  return new Promise((resolve, reject) => {
    readOrders(username).then((ordersForUser) => {
      ordersForUser['orders'].push(payload)
      
      db.insert(ordersForUser, username,
        (error, success) => {
          if (success) {
            resolve({})
          } else {
            reject(
              new Error(`In the order of user (${username}). Reason: ${error.reason}.`)
            )            
          }
      }) 
    }).catch((err) => {
      const orderBase = {
        user: username,
        orders: [payload]
      }
      db.insert(orderBase, username,
        (error, success) => {
          if (success) {
            resolve({})
          } else {
            reject(
              new Error(`In the order of user (${username}). Reason: ${error.reason}.`)
            )
          }
      })
    }) 
  })
}

// Retrieves the orders for a user in the orders database
function readOrders (username) {
  return new Promise((resolve, reject) => {
    db.get(username, (error, success) => {
      if (success) {
        resolve(success)
      } else {
        reject(new Error(`To fetch orders of user (${username}). Reason: ${error.reason}.`))
      }
    })
  })
}

module.exports = {
  addOrder,
  readOrders
}
