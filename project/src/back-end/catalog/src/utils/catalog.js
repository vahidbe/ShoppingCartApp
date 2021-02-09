const moment = require('moment')
const log = require('debug')('catalog-d')

var db = require('nano')(process.env.DB_URL)

// adds a product in the catalog with the id as the key
function addProduct(products){ 
    const id = String(products.id)
    const timestamp = moment().format()
    const payload = {
        time : timestamp,
        products : products
    }

    return new Promise((resolve, reject) => {
        db.insert(payload, id, (error, success) => {
            if (success) {
                resolve(success)
            } else {
                reject(new Error(`Failed to insert ${id} in the db. Reason: ${error.reason}.`))
            }
        })
    })
}

// updates the product in the catalog : replaces the value of the specified fields
function modifyProduct(product){ 

    const id = String(product.id)
    const timestamp = moment().format()

    return new Promise((resolve, reject) => {
        getItem(id)
        .then((doc) => {
            var payload = doc.docs[0]
            payload.time = timestamp

            for (var key in product){
                payload.products[key] = product[key]
            }

            db.insert(payload, id, (error, success) => {
                if (success) {
                    resolve({})
                } else {
                    reject(
                        new Error(`Failed to update the product ${id}. Reason: ${error.reason}.`)
                    )
                }
            })
        })
        .catch((err) => log(String(err)))
    })
}

// deletes the product from the catalog
function deleteProduct(product){ 
    const id = String(product)
    
    return new Promise((resolve, reject) => {  
        return getItem(id).then((doc) => {
            const rev = doc.docs[0]._rev                
            db.destroy(id, rev, 
                (error, success) => {
                    if (success) {
                        resolve({})
                    } else {
                        reject(
                        new Error(`Failed to delete ${id}. Reason: ${error.reason}.`)
                        )            
                    }
                })
        }).catch((err) => log(String(err)))        
    })
}

// create the view necessary to retrieve all the catalog
function addView(){
    return new Promise((resolve, reject) => {
        db.insert({
            "_id": "_design/all-catalog",
            "views": {
                "by-category": {
                    "map": "function (doc) {\n  if (doc.products['category'] && doc.products.name){\n    emit(doc.products['category'], doc.products);\n  }\n}"
                }
            },
            "language": "javascript"
        }, (error, success) => {
            if (success){
                resolve({})
            }
            else{
                log(`Failed to add view. Reason : ${error.reason}`)
                reject(new Error(`Failed to add view. Reason : ${error.reason}`))
            }
        })
    })
}

// formatting the json object to have it in the following format :
// {category1 : [item1, item2], category2 : [item3]}
function formatTheOutput(row){
    var output = {}
    for (i = 0; i < row.length; ++i){
        var docs = row[i]
        var key = docs.key
        var val = docs.value
        if (typeof output[key] !== "undefined") {
            output[key][val.id] = val                                                        
        }
        else{
            output[key] = {}
            output[key][val.id] = val
        }
                                                
    }
    return output
}

// retrieves all the items of the catalog and format the output to have them
// sorted by category
function getDB() {
    // creating a view and inserting it in the db
    return new Promise((resolve, reject) => {
        addView().then(() => {
            db.view('all-catalog', 'by-category', function(err, body){
                if (!err){               
                    var row = body.rows                    
                    //formatting the output 
                    var output = formatTheOutput(row)
                    resolve(output)
                }
                else {
                    log(`Failed to get. Reason : ${err.reason}`)
                    reject(new Error(`Failed to get. Reason : ${err.reason}`))
                }
            })
        }).catch((err) => {
            db.view('all-catalog', 'by-category', function(err, body){
                if (!err){                 
                    var row = body.rows
                    //formatting the output 
                    var output = formatTheOutput(row)
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

// retrieves the item with key id from the catalog
function getItem(id){

    const sel = {
        selector: {
            _id: { "$eq": id}
        }
    };
    return new Promise((resolve, reject) => {
        db.find(sel, (error, success) => {
            if (success) {
                resolve(success)
            } else {
                reject(new Error(`Failed to get product ${id}. Reason: ${error.reason}.`))
            }
        })
    })
}

module.exports = {
    addProduct,
    modifyProduct,
    deleteProduct,
    getDB,
    getItem
  }