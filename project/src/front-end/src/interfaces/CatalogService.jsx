import axios from 'axios' 
const url_cat = process.env.REACT_APP_CATALOG_SERVICE_URL
var products = {}

// The CatalogService interface regroups all calls to the Catalog microservice in the back-end
// that could be done from the front-end
class CatalogService {

    // Set the handlers to update the state of the shopping cart application asynchronously
    setHandlers (setProductsList) {
      this.setProducts = setProductsList
    }

    // Call to the Catalog microservice to modify a product of the catalog
    // POST /catalog
    // username is a string containing the username of the user logged in
    // role is a string containing the role of the user logged in
    // token is a string containing the authentification token the the user received when
    // logging in
    // newproduct is a JSON object representing a new product of the catalog
    modifyProduct (username, role, token, newproduct) {
        axios.post(`${url_cat}/catalog`, { username:username, role:role, token:token, action:"modify", products:newproduct })
            .catch((err) => {
                console.error(err.message)
            })
    }

    // Call to the Catalog microservice to add a product to the catalog
    // POST /catalog
    // username is a string containing the username of the user logged in
    // role is a string containing the role of the user logged in
    // token is a string containing the authentification token the the user received when
    // logging in
    // product is a JSON object representing a product of the catalog
    addProduct (username, role, token, newproduct) {
        axios.post(`${url_cat}/catalog`, { username:username, role:role, token:token, action:"add", products:newproduct })
            .catch((err) => {
                console.error(err.message)
            })
    }

    // Call to the Catalog microservice to remove a product from the catalog
    // POST /catalog
    // username is a string containing the username of the user logged in
    // role is a string containing the role of the user logged in
    // token is a string containing the authentification token the the user received when
    // logging in
    // product is the JSON object representing a product of the catalog
    removeProduct (username, role, token, product) {
        const id = product.id
        axios.post(`${url_cat}/catalog`, { username:username, role:role, token:token, action:"delete", products:id })
            .catch((err) => {
                console.error(err.message)
            })
    }

    // Method to reformat the catalog by parsing the ids to integers
    formatProducts(products) {
        var newproducts = {}
        for (var key of Object.keys(products)) {
            var category = products[key]
            newproducts[key] = {}
            for (var id of Object.keys(category)) {
                var product = category[id]
                product.id = parseInt(product.id, 10)
                newproducts[key][parseInt(id, 10)] = product
            }
        }
        return newproducts
    }

    // Call to the Catalog microservice to fetch the catalog
    // GET /catalog
    fetchProducts () {
        axios.get(`${url_cat}/catalog`)
            .then((res) => {
                products = this.formatProducts(res.data.output)
                this.setProducts(products)
            })
            .catch((error) => {
                console.error(error.message)
            })
    }
  }
  
  export default CatalogService  