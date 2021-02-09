//import axios from 'axios' // we use this library as HTTP client
const axios = require('axios');
const log_url = process.env.LOG_URL
const val_url = process.env.VALIDATION_URL
const express = require('express')
const log = require('debug')('users-d')
const moment = require('moment')

const app = express.Router()
const db = require('./utils/catalog')

var azure = require('azure-storage')
var blobService = azure.createBlobService()

blobService.createContainerIfNotExists('productimages', {
    publicAccessLevel: 'blob'
}, function (error, result, response) {
    if (!error) {
        log("The blob container was successfully created")
    }
    else {
        log("could not create the blob container")
    }
})

// POST /catalog ${data}
// Add, modify or delete a product (identified by it's name) from the catalog
// ${data} is a JSON object with the following fields:
// username, role and token (string) necessary for user authentification check
// action, specifying if we "add", "modify" or "delete" the product
// products, a JSON object containing the details of the product (should at least contain the product name)
// in the case of delete, the poducts field is just the name of the product (a string)
app.post('/catalog', (req, res) => {

    const user = req.body.username
    const role = req.body.role
    const token = req.body.token
    const action = req.body.action
    const products = req.body.products
    const image = req.body.products.image
    const start = moment()

    axios.get(`${val_url}/validation/${user}/${role}/${token}`)
        .then((out) => {
            switch (action) {
                case "add":
                    db.addProduct(products)
                        .then(() => {
                            logCatalog(user, 'add', products, "post").then((out) => {
                                const handling_time = -start.diff(moment())
                                logPerformance(user, role, handling_time, "adding product")
                                res.status(200).json({ status: 'success' })
                            })
                        })
                        .catch((err) => {
                            log(String(err))
                        })
                    break

                case "modify":
                    db.modifyProduct(products)
                        .then(() => {
                            logCatalog(user, 'modify', products, "post").then((out) => {
                                const handling_time = -start.diff(moment())
                                logPerformance(user, role, handling_time, "modifying product")
                                res.status(200).json({ status: 'success' })
                            })
                        })
                        .catch((err) => log(String(err)))
                    break

                case "delete":
                    db.deleteProduct(products)
                        .then(() => { //send to logger
                            logCatalog(user, 'delete', products, "post").then((out) => {
                                const handling_time = -start.diff(moment())
                                logPerformance(user, role, handling_time, "deleting products")
                                res.status(200).json({ status: 'success' })
                            })
                        })
                        .catch((err) => log(String(err)))
                    break
            }
        })
        .catch((err) => { // user is not allowed to add
            log(String(err))
            res.status(401).json({ status: 'error', message: String(err) })
        })
})

// GET catalog
// Allows to retrieve the entire catalog of products
app.get('/catalog', (req, res) => {
    const start = moment()
    db.getDB()
        .then((doc) => {
            logCatalog("none", "get all catalog", "all the catalog", "get").then((out) => {
                const handling_time = -start.diff(moment())
                logPerformance("none", "none", handling_time, "getting/viewing all the catalog")
                res.status(200).json({ status: 'success', output: doc })
            })
        })
        .catch((err) => {
            log(String(err))
            res.status(401).json({ status: 'error', message: String(err) })
        })
})

// GET /catalog/:id
// retrieve the item whose id is "id"
app.get('/catalog/:id', (req, res) => {
    const start = moment()
    const id = req.params.id
    db.getItem(String(id))
        .then((doc) => {
            const item = doc.docs[0]
            const output = item.products
            logCatalog("none", "get item", String(id), "item").then((out) => {
                const handling_time = -start.diff(moment())
                logPerformance("none", "none", handling_time, "getting/viewing an item")
                res.status(200).json({ status: 'success', item: output })
            })
        })
        .catch((err) => {
            log(String(err))
            res.status(401).json({ status: 'error', message: String(err) })
        })
})

// Logs a catalog event
function logCatalog(usr, action, products, queryType) {
    return axios.post(`${log_url}/log/catalog`, { user: usr, action: action, products: products, queryType: queryType })
        .then((res) => {
            log("Sent log sucessfully")
        })
        .catch((err) => log(err.message))
}

// Logs the performance of the event
function logPerformance(usr, role, handling_time, nature) {
    axios.post(`${log_url}/log/performance`, { service: "catalog", user: usr, role: role, handling_time: handling_time, nature: nature })
        .then((res) => {
            log("Sent perf log Successfully")
        })
        .catch((err) => log(err.message))
}

module.exports = app