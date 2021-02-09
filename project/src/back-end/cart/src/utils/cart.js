const moment = require('moment')

var db = require('nano')(process.env.DB_URL)

// Returns the index of product of id "id" in "product_list"
function getIndex(product_list, id) {
  for (var i = 0; i < product_list.length; i++) {
    var product = product_list[i]
    if (product.id === id) {
      return i
    }
  }
  return -1
}

// Adds the products "products" to the cart of user identified by "username"
function addToCart (username, products) {
  return new Promise((resolve, reject) => {
    getCart(username).then((ordersForUser) => {

      var oldproducts = ordersForUser['cart']
      var newproducts = []
      for (var i = 0; i < oldproducts.length; i++) {
        var product = oldproducts[i]
        const id = product.id
        const quantity = Number(product.quantity)
        const index = getIndex(products, id)
        if (index < 0) {
          newproducts.push(product)
        } else {
          const toAdd = products[index]
          const quantityToAdd = Number(toAdd.quantity)
          const newquantity = quantity + quantityToAdd
          var newproduct = Object.assign({}, product)
          newproduct.quantity = newquantity
          newproducts.push(newproduct)
          products.splice(index, 1)
        }
      }

      for (var i = 0; i < products.length; i++) {
        newproducts.push(products[i])
      }

      ordersForUser['cart'] = newproducts

      db.insert(ordersForUser, username,
        (error, success) => {
          if (success) {
            resolve({})
          } else {
            reject(
              new Error(`In the cart of user (${username}). Reason: ${error.reason}.`)
            )            
          }
      }) 
    }).catch((err) => {
      const cartBase = {
        cart: products
      }
      db.insert(cartBase, username,
        (error, success) => {
          if (success) {
            resolve({})
          } else {
            reject(
              new Error(`In the cart of user (${username}). Reason: ${error.reason}.`)
            )
          }
      })
    }) 
  })
}

// Removes the products "products" from the cart of user identified by "username"
function removeFromCart (username, products) {
  return new Promise((resolve, reject) => {
    getCart(username).then((ordersForUser) => {

      var oldproducts = ordersForUser['cart']
      var newproducts = []
      for (var i = 0; i < oldproducts.length; i++) {
        const product = oldproducts[i]
        const id = product.id
        const quantity = Number(product.quantity)
        const index = getIndex(products, id)
        if (index < 0) {
          newproducts.push(product)
        } else {
          const toDelete = products[index]
          const quantityToDelete = Number(toDelete.quantity)
          const newquantity = quantity - quantityToDelete
          if (newquantity > 0) {
            var newproduct = Object.assign({}, product)
            product.quantity = newquantity
            newproducts.push(newproduct)
          }
        }
      }

      ordersForUser['cart'] = newproducts
      
      db.insert(ordersForUser, username,
        (error, success) => {
          if (success) {
            resolve({})
          } else {
            reject(
              new Error(`In the cart of user (${username}). Reason: ${error.reason}.`)
            )            
          }
      }) 
    }).catch((err) => {
      const cartBase = {
        cart: []
      }
      db.insert(cartBase, username,
        (error, success) => {
          if (success) {
            resolve({})
          } else {
            reject(
              new Error(`In the cart of user (${username}). Reason: ${error.reason}.`)
            )
          }
      })
    }) 
  })
}

// Empties the cart of user identified by "username"
function emptyCart (username) {
  return new Promise((resolve, reject) => {
    getCart(username)
      .then((ordersForUser) => {
        ordersForUser['cart'] = []
        
        db.insert(ordersForUser, username,
          (error, success) => {
            if (success) {
              resolve({})
            } else {
              reject(new Error(`In the cart of user (${username}). Reason: ${error.reason}.`)
              )
            }
        })
      })
      .catch((err) => {
        reject(new Error(`In the cart of user (${username}). Reason: ${error.reason}.`))        
      })
  })
}

// Retrieves the cart of user identified by "username"
function getCart (username) {
  return new Promise((resolve, reject) => {
    db.get(username, (error, success) => {
      if (success) {
        resolve(success)
      } else {
        reject(new Error(`To fetch the cart of user (${username}). Reason: ${error.reason}.`))
      }
    })
  })
}

module.exports = {
  addToCart,
  removeFromCart,
  emptyCart,
  getCart
}
