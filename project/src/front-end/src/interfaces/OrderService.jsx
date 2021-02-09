import axios from 'axios' // we use this library as HTTP client
// you can overwrite the URI of the authentication microservice
// with this environment variable
const url_orders = process.env.REACT_APP_ORDER_SERVICE_URL

// The OrderService interface regroups all calls to the Orders microservice in the back-end
// that could be done from the front-end
class OrderService {

    // Set the handlers to update the state of the shopping cart application asynchronously
    setHandlers(setOrdersList) {
        this.setOrders = setOrdersList
    }

    // Reformats the orders to add the time value of the order to each of the
    // products that it contains (in order to fit the required format used in the checkout
    // component that was given)
    formatOrders(raw) {
        var allproducts = []
        raw.forEach((order) => {
            var time = order.time
            var products = order.products
            products.forEach((product) => {
                var newproduct = Object.assign({}, product)
                newproduct['time'] = time
                allproducts.push(newproduct)
            })
        })
        return allproducts
    }

    // Fetches the orders of the logged user
    // GET /order/:username/:role/:token
    // username is a string containing the username of the user logged in
    // role is a string containing the role of the user logged in
    // token is a string containing the authentification token the the user received when
    // logging in
    fetchOrders(username, role, token) {
        axios.get(`${url_orders}/order/${username}/${role}/${token}`)
            .then((res) => {
                var orders = res.data.orders
                this.setOrders(orders)
            })
            .catch((error) => {
                // console.log(String(error))
                this.setOrders([])
            })
    }
}

export default OrderService  