const moment = require('moment')
const log = require('debug')(process.env.DEBUG)

var logs = require('nano')(process.env.DB_URL)

// Returns the product_list's products names
function getProductNames (product_list) {
  var name_list = []
  for (var i = 0; i < product_list.length; i++) {
    name_list.push(product_list[i].name)
  }
  return name_list
}

// Adds a log with content "payload" to the log database
function addLog (payload) {
  return new Promise((resolve, reject) => {
    logs.insert(payload,
      (error, success) => {
        if (success) {
          resolve({})
        } else {
          reject(
            new Error(`In the logging of the payload (${payload}). Reason: ${error.reason}.`)
          )
        }
    })
  })
}

// Adds a "login" log
function addLogin (usrName) {
  return new Promise((resolve, reject) => {
    const timestamp = moment().format()
    const payload = {
      time: timestamp,
      user: usrName,
      type: "login",
      msg: "User " + usrName + " logged in at " + timestamp
    }
    addLog(payload).then(resolve({})).catch((err) => reject(err))
  })
}

// Adds a "register" log
function addRegister (usrName) {
    return new Promise((resolve, reject) => {
    const timestamp = moment().format()
    const payload = {
      time: timestamp,
      user: usrName,
      type: "register",
      msg: "User " + usrName + " registered at " + timestamp
    }
    addLog(payload).then(resolve({})).catch((err) => reject(err))
  })
}

// Adds an "order" log
function addOrder (usrName, products) {
  return new Promise((resolve, reject) => {
    const timestamp = moment().format()
    const payload = {
      time: timestamp,
      user: usrName,
      type: "order",
      products: products,
      msg: "User " + usrName + " ordered products " + getProductNames(products) + " at " + timestamp
    }
    addLog(payload).then(resolve({})).catch((err) => reject(err))
  })
}

// Adds a "cart" log
function addCart (usrName, action, products) {
  return new Promise((resolve, reject) => {
    const timestamp = moment().format()
    var msg = `User ${usrName}`
    switch (action) {
      case "get":
        msg = msg + " retrieved his cart at " + timestamp
        break
      case "add":
        msg = msg + " added products " + getProductNames(products) + " at " + timestamp
        break
      case "remove":
        msg = msg + " removed products " + getProductNames(products) + " at " + timestamp
        break
      case "checkout":
        msg = msg + " emptied his cart at " + timestamp
        break
    }
    const payload = {
      time: timestamp,
      user: usrName,
      type: "cart",
      action: action,
      products: products,
      msg: msg
    }
    addLog(payload).then(resolve({})).catch((err) => reject(err))
  })
}

// Adds a log of an add/modification/delete event of the catalog
function addCatalogModif(usrName, action, products){
  return new Promise((resolve, reject) => {
    const timestamp = moment().format()
    var msg = `User ${usrName}`
    switch (action) {
      case "add":
        msg = msg + " added the product " + products.name + " at " + timestamp
        break
      case "modify":
        msg = msg + " modified the product " + products.name + " at " + timestamp
        break
      case "delete":
        msg = msg + " deleted the product " + products + " at " + timestamp
        break
    }
    const payload = {
      time: timestamp,
      user: usrName,
      type: "catalog",
      action: action,
      products: products,
      msg: msg
    }
    addLog(payload).then(resolve({})).catch((err) => reject(err))
  })
}

// Adds a log of a get event of the catalog
function addCatalogGet(typeOfGet, products){
  return new Promise((resolve, reject) => {
    const timestamp = moment().format()
    var msg = ""
    switch (typeOfGet) {
      case "item":
        msg = msg + " The product " + products + " was viewed at " + timestamp
        break
      case "get":
        msg = msg + " All the catalog was viewed/loaded at " + timestamp
        break
    }
    const payload = {
      time: timestamp,
      type: "catalog",
      action: typeOfGet,
      products: products,
      msg: msg
    }
    addLog(payload).then(resolve({})).catch((err) => reject(err))
  })
}

// Adds a "performance" log
function addPerformance (usrName, role, service, handling_time, nature) {
  return new Promise((resolve, reject) => {
    log("Service: "+service)
    const timestamp = moment().format()
    var msg = ""
    if (service === "catalog" && (nature === "getting/viewing an item" || nature === "getting/viewing all the catalog")) {
      msg = "The service " + service + " was used at " + timestamp + ". Nature of the call: "
      + nature + ". Time elapsed: " + handling_time + " ms"
    }
    else {
      msg = "User " + usrName + " with role \'" + role + "\' used service " + service + " at " + timestamp + ". Nature of the call: " 
      + nature + ". Time elapsed: " + handling_time + " ms"
    }

    const payload = {
      time: timestamp,
      service: service,
      user: usrName,
      nature: nature,
      handling_time: handling_time,
      type: "performance",
      msg: msg
    }
    addLog(payload).then(resolve({})).catch((err) => reject(err))
  })
}

// Creates the view necessary to retrieve all the logs
function addView(){
  return new Promise((resolve, reject) => {
      logs.insert({
          "_id": "_design/all-logs",
          "views": {
              "by-doc": {
                  "map": "function (doc) {\n  if (doc._id){\n    emit(doc);\n  }\n}"
              }
          },
          "language": "javascript"
      }, (error, success) => {
          if (success){
              resolve({})
          }
          else{
              reject(new Error(`Failed to add view. Reason : ${error.reason}`))
          }
      })
  })
}

// Returns all the logs
function readLogs () {
  return new Promise((resolve, reject) => { // creating a view and inserting it in the db
    addView().then(() => {
        logs.view('all-logs', 'by-doc', function(err, body){
            if (!err){               
                var all_logs = body.rows                     
                resolve(all_logs)
            }
            else {
                reject(new Error(`Failed to get. Reason : ${error.reason}`))
            }
        })
    }).catch((err) => { // if the view is already in the db
        logs.view('all-logs', 'by-doc', function(err, body){
            if (!err){                 
                var all_logs = body.rows
                resolve(all_logs)
            }
            else {
                reject(new Error(`Failed to get. Reason : ${error.reason}`))
            }
        })
    })                
  })
}

module.exports = {
  addLogin,
  addRegister,
  addOrder,
  addCart,
  addCatalogModif,
  addCatalogGet,
  addPerformance,
  readLogs
}
