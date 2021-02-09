import axios from 'axios' // we use this library as HTTP client
// you can overwrite the URI of the authentication microservice
// with this environment variable
const url_cart = process.env.REACT_APP_CART_SERVICE_URL

// The CartService interface regroups all calls to the Cart microservice in the back-end
// that could be done from the front-end
class CartService {

    // Set the handlers to update the state of the shopping cart application asynchronously
    setHandlers (setCartList, updateCart) {
      this.setCart = setCartList
      this.updateCart = updateCart
    }


    // Call to the Cart microservice to checkout
    // POST cart/checkout
    // username is a string containing the username of the user logged in
    // role is a string containing the role of the user logged in
    // token is a string containing the authentification token the the user received when
    // logging in
    checkout (username, role, token) {
        axios.post(`${url_cart}/cart/checkout`, { username:username, role:role, token:token })
        .then((res) => {
            this.fetchCart(username, role, token)
        })
        .catch((err) => {
            console.error(err.message)
        })
    }

    // Call to the Cart microservice to add a product to the cart
    // POST /cart/add
    // username is a string containing the username of the user logged in
    // role is a string containing the role of the user logged in
    // token is a string containing the authentification token the the user received when
    // logging in
    // products is an array of JSON objects representing products of the catalog
    addToCart (username, role, token, product) {
        axios.post(`${url_cart}/cart/add`, { username:username, role:role, token:token, products:[product] })
        .then((res) => {
            this.fetchCart(username, role, token)
        })
        .catch((err) => {
            console.error(err.message)
        })
    }

    // Call to the Cart microservice to remove a product from the cart
    // POST /cart/remove
    // username is a string containing the username of the user logged in
    // role is a string containing the role of the user logged in
    // token is a string containing the authentification token the the user received when
    // logging in
    // products is an array of JSON objects representing products of the catalog
    removeFromCart (username, role, token, product) {
        axios.post(`${url_cart}/cart/remove`, { username:username, role:role, token:token, products:[product] })
        .then((res) => {
            this.fetchCart(username, role, token)
        })
        .catch((err) => {
            console.error(err.message)
        })
    }

    // Call to the Cart microservice to fetch the cart
    // GET /cart/:username/:role/:token
    // username is a string containing the username of the user logged in
    // role is a string containing the role of the user logged in
    // token is a string containing the authentification token the the user received when
    // logging in
    fetchCart (username, role, token) {
        axios.get(`${url_cart}/cart/${username}/${role}/${token}`)
            .then((res) => {
                var cart = res.data.cart
                this.setCart(cart)
                this.updateCart()
            })
            .catch((error) => {
                // console.log(String(error))
                this.setCart([])
                this.updateCart()
            })
    }
  }
  
  export default CartService  