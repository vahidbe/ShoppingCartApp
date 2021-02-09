import React, { Component } from 'react'
import Header from './components/Header'
import Products from './components/Products'
import QuickView from './components/QuickView'
import Checkout from './components/Checkout'
import CatalogService from '../interfaces/CatalogService'
import CartService from '../interfaces/CartService'
import OrderService from '../interfaces/OrderService'
import RecommendationService from '../interfaces/RecommendationService'

class ShoppingCartApp extends Component {

  componentWillMount () {
    this.initialiseState(true)
  }
  constructor (props) {
    super(props)
    this.handleCategory = this.handleCategory.bind(this)
    this.handleAddToCart = this.handleAddToCart.bind(this)
    this.sumTotalItems = this.sumTotalItems.bind(this)
    this.sumTotalAmount = this.sumTotalAmount.bind(this)
    this.checkProduct = this.checkProduct.bind(this)
    this.handleRemoveProduct = this.handleRemoveProduct.bind(this)
    this.openModal = this.openModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.endCheckout = this.endCheckout.bind(this)
    this.handleCheckout = this.handleCheckout.bind(this)
  }
  initialiseState (firstCall) {
    if (firstCall) {
      this.state = {
        products: [],
        cart: [],
        totalItems: 0,
        totalAmount: 0,
        term: '',
        category: '',
        cartBounce: false,
        quickViewProduct: {},
        modalActive: false,
        doCheckout: false,
        purchaseId: null,
        oldPurchases: [],
        userRecommendations: [],
        itemRecommendations: [],
        bestSellers: [],
        catalogService: new CatalogService(),
        cartService: new CartService(),
        orderService: new OrderService(),
        recommendationService: new RecommendationService()
      }
      this.state.catalogService.setHandlers(
        (list) => { 
          if (this._ismounted) {
            this.setState({ products: list }) 
            if (this.state.authenticated) {
              this.state.cartService.fetchCart(
                localStorage.getItem("username"), 
                localStorage.getItem("role"), 
                localStorage.getItem("authToken")
              )
            } else {
              this.state.recommendationService.fetchBestSellers()
            }
          }
        }
      )
      this.state.orderService.setHandlers(
        (list) => { 
          if (this._ismounted) {
            this.setState({ oldPurchases: list }) 
          }
        }
      )
      this.state.recommendationService.setHandlers(
        (list) => { 
          if (this._ismounted) {
            var newlist = []
            for (var i = 0; i < list.length; i++) {
              var item = this.getItemFromCatalog(list[i])
              newlist.push(item)
            }
            this.setState({ userRecommendations: newlist }) 
          } 
        },
        (list) => { 
          if (this._ismounted) {
            var newlist = []
            for (var i = 0; i < list.length; i++) {
              var item = this.getItemFromCatalog(list[i])
              newlist.push(item)
            }
            this.setState({ itemRecommendations: newlist }) 
          }
        },
        (list) => { 
          if (this._ismounted) {
            var newlist = []
            for (var i = 0; i < list.length; i++) {
              var item = this.getItemFromCatalog(list[i])
              newlist.push(item)
            }
            this.setState({ bestSellers: newlist }) 
          }
        }
      )
      this.state.cartService.setHandlers(
        (list) => { this.setState({ cart: list })},
        () => {
          if (this._ismounted) {
            this.sumTotalItems(this.state.cart)
            this.sumTotalAmount(this.state.cart)
            this.state.orderService.fetchOrders(
              localStorage.getItem("username"), 
              localStorage.getItem("role"), 
              localStorage.getItem("authToken")
            )
            this.state.recommendationService.fetchBestSellers()
            this.state.recommendationService.fetchRecommendationsForUser(
              localStorage.getItem("username"), 
              localStorage.getItem("role"), 
              localStorage.getItem("authToken")
            )
          }
        }
      )
    } else {
      this.setState({
        products: [],
        cart: [],
        totalItems: 0,
        totalAmount: 0,
        term: '',
        category: '',
        cartBounce: false,
        quickViewProduct: {},
        modalActive: false,
        doCheckout: false,
        purchaseId: null,
        userRecommendations: [],
        itemRecommendations: [],
        bestSellers: [],
        oldPurchases: []
      })
    }
    this.state.catalogService.fetchProducts()
    if (this.props.authenticated) {
      this.state.cartService.fetchCart(
        localStorage.getItem("username"), 
        localStorage.getItem("role"), 
        localStorage.getItem("authToken")
      )
      this.state.orderService.fetchOrders(
        localStorage.getItem("username"), 
        localStorage.getItem("role"), 
        localStorage.getItem("authToken")
      )
    }
  }
  
  componentDidMount() { 
    this._ismounted = true;
  }
  
  componentWillUnmount() {
     this._ismounted = false;
  }

  getItemFromCatalog(id) {
    const products = this.state.products
    for (var key of Object.keys(products)) {
      var category = products[key]
      if (category.hasOwnProperty(id)) {
        return category[id]
      }
    }
  }

  handleCategory (event) { // Filter by Category
    this.setState({ category: event.target.value })
    console.log(this.state.category)
  }

  handleAddToCart (chosenProduct) { // Add to Cart
    chosenProduct.quantity = parseInt(chosenProduct.quantity, 10)
    this.state.cartService.addToCart(
      localStorage.getItem("username"), 
      localStorage.getItem("role"), 
      localStorage.getItem("authToken"), 
      chosenProduct
    )
    this.setState({
      cartBounce: true
    })
    setTimeout(function () {
      if (this._ismounted) {
        this.setState({ cartBounce: false })
      }
    }.bind(this), 1000)
  }

  handleRemoveProduct (product, e) {
    this.state.cartService.removeFromCart(
      localStorage.getItem("username"), 
      localStorage.getItem("role"), 
      localStorage.getItem("authToken"), 
      product
    )
    e.preventDefault()
  }

  checkProduct (productID) {
    let cart = this.state.cart
    return cart.some(function (item) {
      return item.id === productID
    })
  }

  sumTotalItems () {
    let total = 0
    let cart = this.state.cart
    total = cart.length
    this.setState({
      totalItems: total
    })
  }

  sumTotalAmount () {
    let total = 0
    let cart = this.state.cart
    for (var i = 0; i < cart.length; i++) {
      // eslint-disable-next-line
      total += cart[i].price * parseInt(cart[i].quantity, 10)
    }
    this.setState({
      totalAmount: Number((total).toFixed(2))
    })
  }

  openModal (product) { // Open Modal
    this.state.recommendationService.fetchRecommendationsForItem(product.id)
    this.setState({
      quickViewProduct: product,
      modalActive: true
    })
  }

  closeModal () { // Close Modal
    this.setState({
      modalActive: false
    })
  }

  handleCheckout (e) {
    e.preventDefault()
    this.setState({ doCheckout: true })
  }

  endCheckout () {
    console.log('END of CHECKOUT')
    this.initialiseState(false)
    this.state.cartService.fetchCart(
      localStorage.getItem("username"), 
      localStorage.getItem("role"), 
      localStorage.getItem("authToken")
    )
    this.state.recommendationService.fetchRecommendationsForUser(
      localStorage.getItem("username"), 
      localStorage.getItem("role"), 
      localStorage.getItem("authToken")      
    )
    this.state.recommendationService.fetchBestSellers()
    this.setState({ doCheckout: false })
  }

  /* eslint-disable */
  render () {  
    const ColoredLine = ({ color }) => (
      <hr
          style={{
              color: color,
              backgroundColor: color,
              height: 5
          }}
      />
    )

    var mainSection = []
    if (this.state.userRecommendations.length > 0) {
      mainSection.push(
      <Products
        key="UserRecommendations"
        isAnArray={true}
        productsList={{"Products you might like:": this.state.userRecommendations}}
        searchTerm={this.state.term}
        addToCart={this.handleAddToCart}
        openModal={this.openModal}
        authenticated={this.props.authenticated} />)
      mainSection.push(<ColoredLine key = "line_UserRecommendations" color = "white" />)
    }

    mainSection.push(
    <Products
    key="Catalog"
    isAnArray={false}
    productsList={this.state.products}
    searchTerm={this.state.term}
    addToCart={this.handleAddToCart}
    openModal={this.openModal}
    authenticated={this.props.authenticated} />) 
    if (this.state.bestSellers.length > 0) {
      mainSection.push(<ColoredLine key = "line_BestSellers" color = "white" />)
      mainSection.push(
      <Products
        key="BestSellers"
        isAnArray={true}
        productsList={{"Best-Sellers": this.state.bestSellers}}
        searchTerm={this.state.term}
        addToCart={this.handleAddToCart}
        openModal={this.openModal}
        authenticated={this.props.authenticated} />)
    }
    const {doCheckout} = this.state
    return (
      <div>
        { doCheckout ?
          <Checkout
            purchase={this.state.cart}
            oldPurchases={this.state.oldPurchases}
            cartService={this.state.cartService}
            endCheckout={this.endCheckout}
					/>
				: <div>
					<Header
						cartBounce={this.state.cartBounce}
						total={this.state.totalAmount}
						totalItems={this.state.totalItems}
						cartItems={this.state.cart}
						removeProduct={this.handleRemoveProduct}
						handleCategory={this.handleCategory}
						categoryTerm={this.state.category}
						handleCheckout={this.handleCheckout}
						setAuthStatus={this.props.setAuthStatus}
						authenticated={this.props.authenticated}
            logoutUser={(e) => {
              this.setState({ 
                cart: [] ,
                totalItems: 0,
                totalAmount: 0,
                userRecommendations: [],
                itemRecommendations: [],
                bestSellers: []
              })
              this.props.logoutUser
            }} />
          {mainSection}
					<QuickView
            recommendedProducts={this.state.itemRecommendations}
            product={this.state.quickViewProduct}
            authenticated={this.props.authenticated}
						addToCart={this.handleAddToCart}
            searchTerm={this.state.term}
            openModal={
              this.state.modalActive}
            closeModal={this.closeModal} />
				</div>
				}
      </div>
    )
  }
}

export default ShoppingCartApp
