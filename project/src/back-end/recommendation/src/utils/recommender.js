const moment = require('moment')
const algo = require('./algorithm') // where the recommendations algoritm functions are.
const log = require('debug')('recommendation-d')
var db = require('nano')(process.env.DB_URL)

// ##############################################
// # Recommendations for a user and for an item #
// ##############################################

// creates the view necessary to retrieve the needed information to create a recommendation for a user or an item.
// it creates a map reduce that returns a json containing the users as keys and the total quantity for each products
// they have added at least once to their cart as values. It also returns the maximal product id we encountered.
function viewMatrix() {
    return new Promise((resolve, reject) => {
        db.insert({
            "_id": "_design/all-purchases",
            "views": {
                "user-items": {
                    "map": "function (doc) {\n  if (doc.type == 'cart' && doc.action == 'add'){\n    products = doc.products\n    items = []\n    max = 0\n    for (var i = 0; i < products.length; i++){\n      p = products[i]\n      if (p.id > max) {\n        max = p.id\n      }\n      items.push({id: p.id, quantity: p.quantity})\n    }\n    if(items.length > 0) {\n      emit(doc.user, {max: max, user: doc.user, items: items})\n    }\n  }\n}",
                    "reduce": "function (key, values, rereduce) {\n  if (rereduce) {\n    var result = {}\n    max = 0\n    values.forEach((value) => {\n      if (value.max > max) {\n        max = value.max\n      }\n      var matrix = value.matrix\n      for (var user in matrix) {\n        var items = matrix[user]\n        if (!result.hasOwnProperty(user)) {\n          result[user] = {}\n        }\n        var temp = result[user]\n        for (var id in matrix[user]) {\n          var item_quantity = matrix[user][id]\n          if (temp.hasOwnProperty(id)) {\n            var quantity = temp[id]\n            temp[id] = item_quantity + quantity\n          } else {\n            temp[id] = item_quantity\n          }\n        }\n        result[user] = temp\n      }\n    })\n    return { max: max, matrix: result }\n  } else {\n    var result = {}\n    var max = 0\n    values.forEach((value) => {\n      if (value.max > max) {\n        max = value.max\n      }\n      const user = value.user\n      if (!result.hasOwnProperty(user)) {\n        result[user] = {}\n      }\n      var temp = result[user]\n      value.items.forEach((item) => {\n        if (temp.hasOwnProperty(item.id)) {\n          var quantity = temp[item.id]\n          temp[item.id] = item.quantity + quantity\n        } else {\n          temp[item.id] = item.quantity\n        }\n      })\n      result[user] = temp\n    })\n    return { max: max, matrix: result }\n  }\n}"
                }
            },
            "language": "javascript"
        }, (error, success) => {
            if (success) {
                resolve({})
            }
            else {
                log(`Failed to add view. Reason : ${error.reason}`)
                reject(new Error(`Failed to add view. Reason : ${error.reason}`))
            }
        })
    })
}

// Retrieves the necessary information by using the view and creates the list of N recommendations
// for the user "user".
function recommendByUser(user) {
    return new Promise((resolve, reject) => {
        viewMatrix() // creating a view and inserting it in the db
            .then(() => {
                db.view('all-purchases', 'user-items', function (err, body) {
                    if (!err) {
                        if (body.rows.length > 0) {
                            var output = body.rows[0].value
                            var max = output.max
                            var sumItems = output.matrix
                            var payload = buildMatrixAndGetID(user, max, sumItems)
                            const matrix = payload.matrix
                            const user_id = payload.id
                            if (payload.id !== -1) { // if the user has already added something to his cart
                                if (algo.hasCommonItems(user_id, matrix)) {
                                    const best_items = algo.knn(user_id, matrix)
                                    if (best_items.length > 0) {
                                        resolve(best_items)
                                    } else {
                                        resolve([])
                                    }
                                } else {
                                    resolve([])
                                }
                            }
                            else {
                                resolve([])
                            }

                        } else {
                            reject(err)
                        }
                    }
                    else {
                        log(`Failed to get. Reason : ${err.reason}`)
                        reject(new Error(`Failed to get. Reason : ${err.reason}`))
                    }
                })
            })
            .catch((err) => { // if the view already is in the DB
                db.view('all-purchases', 'user-items', function (err, body) {
                    if (!err) {
                        if (body.rows.length > 0) {
                            var output = body.rows[0].value
                            var max = output.max
                            var sumItems = output.matrix
                            var payload = buildMatrixAndGetID(user, max, sumItems)
                            const matrix = payload.matrix
                            const user_id = payload.id
                            if (payload.id !== -1) { // if the user has already added something to his cart
                                if (algo.hasCommonItems(user_id, matrix)) {
                                    const best_items = algo.knn(user_id, matrix)
                                    if (best_items.length > 0) {
                                        resolve(best_items)
                                    } else {
                                        resolve([])
                                    }
                                } else {
                                    resolve([])
                                }
                            }
                            else {
                                resolve([])
                            }

                        } else {
                            reject(err)
                        }
                    }
                    else {
                        log(`Failed to get. Reason : ${err.reason}`)
                        reject(new Error(`Failed to get. Reason : ${err.reason}`))
                    }
                })
            })
    })

}

// Retrieves the necessary information by using the view and creates the list of N recommendations
// for the item "id".
function recommendByItem(id) {
    return new Promise((resolve, reject) => {
        viewMatrix() // creating a view and inserting it in the db
            .then(() => {
                db.view('all-purchases', 'user-items', function (err, body) {
                    if (!err) {
                        if (body.rows.length > 0) {
                            var output = body.rows[0].value
                            var max = output.max
                            if (parseInt(id, 10) > parseInt(max, 10)) {
                                resolve([])
                            } else {
                                var sumItems = output.matrix
                                var matrix = buildMatrix(max, sumItems)
                                if (algo.hasCommonUsers(id, matrix)) {
                                    const best_items = algo.closestItems(id, matrix)
                                    if (best_items.length > 0) {
                                        resolve(best_items)
                                    } else {
                                        resolve([])
                                    }
                                } else {
                                    resolve([])
                                }
                            }
                        } else {
                            reject(err)
                        }
                    }
                    else {
                        log(`Failed to get. Reason : ${err.reason}`)
                        reject(new Error(`Failed to get. Reason : ${err.reason}`))
                    }
                })
            })
            .catch((err) => { // if the view already is in the DB
                db.view('all-purchases', 'user-items', function (err, body) {
                    if (!err) {
                        if (body.rows.length > 0) {
                            var output = body.rows[0].value
                            var max = output.max
                            var sumItems = output.matrix
                            var matrix = buildMatrix(max, sumItems)
                            if (parseInt(id, 10) > parseInt(max, 10)) {
                                resolve([])
                            } else {
                                if (algo.hasCommonUsers(id, matrix)) {
                                    const best_items = algo.closestItems(id, matrix)
                                    if (best_items.length > 0) {
                                        resolve(best_items)
                                    } else {
                                        resolve([])
                                    }
                                } else {
                                    resolve([])
                                }
                            }
                        } else {
                            reject(err)
                        }
                    }
                    else {
                        log(`Failed to get. Reason : ${err.reason}`)
                        reject(new Error(`Failed to get. Reason : ${err.reason}`))
                    }
                })
            })
    })
}

// creates the matrix necessary to perform the user recommendations.
// args : user (String) : the user for whom we want the recommendation
//        max (int) : the maximal product id we encountered (returned in the output of the map-reduce)
//        sumItems : the json object returned by map-reduce (quantity for each products added by each users)
// returns : 
//        matrix: a matrix whose rows are the users and columns are the products.
//                It contains the quantity of each products for each users.
//        user_id (int): te index of the user in the matrux (its row number)
function buildMatrixAndGetID(user, max, sumItems) {
    var nbItems = parseInt(max) + 1
    var users = Object.keys(sumItems)
    var matrix = [];
    var user_id = -1
    for (var i = 0; i < users.length; i++) {
        matrix[i] = new Array(nbItems)
    }

    for (var i = 0; i < users.length; i++) {
        var u = users[i]
        if (u === user) {
            user_id = i
        }

        for (var j = 0; j < nbItems; j++) {
            if (sumItems[u].hasOwnProperty(j)) {
                matrix[i][j] = sumItems[u][j]
            }
            else {
                matrix[i][j] = 0
            }
        }
    }
    return { id: user_id, matrix: matrix }
}

// creates the matrix necessary to perform the item recommendations.
// args : max (int) : the maximal product id we encountered (returned in the output of the map-reduce)
//        sumItems : the json object returned by map-reduce (quantity for each products added by each users)
// returns : 
//        matrix: a matrix whose rows are the users and columns are the products.
//                It contains the quantity of each products for each users.
function buildMatrix(max, sumItems) {
    var nbItems = parseInt(max) + 1
    var users = Object.keys(sumItems)
    var matrix = [];
    for (var i = 0; i < users.length; i++) {
        matrix[i] = new Array(nbItems)
    }

    for (var i = 0; i < users.length; i++) {
        var u = users[i]
        for (var j = 0; j < nbItems; j++) {
            if (sumItems[u].hasOwnProperty(j)) {
                matrix[i][j] = sumItems[u][j]
            }
            else {
                matrix[i][j] = 0
            }
        }
    }
    return matrix
}


//##############################
//# Best-seller recommendation #
//##############################

// creates the view necessary to rertieve the needed information for the best-sellers recommendation
// it creates a map-reduce that returns the total quantity bougth for each sold items
function viewBestSeller() {
    return new Promise((resolve, reject) => {
        db.insert({
            "_id": "_design/best-products",
            "views": {
                "best-seller": {
                    "map": "function (doc) {\n  if (doc.type == 'cart' && doc.action == 'checkout'){\n    var products = doc.products\n    var items = []\n    for (var i = 0; i < products.length; i++){\n      p = products[i]\n      emit(p.id, {quantity: p.quantity})\n    }\n  }\n}",
                    "reduce": "function (keys, values, rereduce) {\n    var count = 0\n    values.forEach((value) => {\n      //console.log(value)\n      count = count + value.quantity\n    })\n    if (rereduce) \n      return count\n    else\n      return {quantity: count}\n }"
                }
            },
            "language": "javascript"
        }, (error, success) => {
            if (success) {
                resolve({})
            }
            else {
                log(`Failed to add view. Reason : ${error.reason}`)
                reject(new Error(`Failed to add view. Reason : ${error.reason}`))
            }
        })
    })
}

// retrieves the total quantity bougth for each sold items by using the view
function getBestSeller() {
    return new Promise((resolve, reject) => {
        viewBestSeller().then(() => { // creating a view and inserting it in the db
            db.view('best-products', 'best-seller', { group: true }, function (err, body) {
                if (!err) {
                    var output = body.rows
                    resolve(output)
                }
                else {
                    log(`Failed to get. Reason : ${err.reason}`)
                    reject(new Error(`Failed to get. Reason : ${err.reason}`))
                }
            })
        }).catch((err) => { // if the view already is in the DB
            db.view('best-products', 'best-seller', { group: true }, function (err, body) {
                if (!err) {
                    var output = body.rows
                    resolve(output)
                }
                else {
                    log(`Failed to get. Reason : ${err.reason}`)
                    reject(new Error(`Failed to get. Reason : ${err.reason}`))
                }
            })
        })
    })
}

// creates the top-N best-sellers list
function treatBestSeller() {
    return new Promise((resolve, reject) => {
        getBestSeller().then((out) => {
            out.sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
            var top = out
            var topId = []
            for (var i = 0; i < top.length; i++) {
                topId[i] = parseInt(top[i].key)
            }
            resolve(topId)

        })
            .catch((error) => {
                log(`Something wrong with best seller recommendation. Reason : ${error.reason}`)
                reject(new Error(`Failed to add view. Reason : ${error.reason}`))
            })
    })
}

module.exports = {
    recommendByUser,
    recommendByItem,
    treatBestSeller
}
