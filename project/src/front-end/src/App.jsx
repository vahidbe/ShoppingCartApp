import React, { Component } from 'react'
import { Route, Redirect, Switch } from 'react-router-dom'

import AdminForm from './web_page_sections/AdminForm'
import LoginForm from './web_page_sections/LoginForm'
import RegisterForm from './web_page_sections/RegisterForm'
import ShoppingCartApp from './shopping-cart/ShoppingCartApp'
import FlashMessages from './web_page_sections/FlashMessages'
import AuthenticationService from './interfaces/AuthenticationService'
import CatalogService from './interfaces/CatalogService'

import './shopping-cart/scss/style.css'
// const catalog = require('./shopping-cart/components/catalog')

class App extends Component {
  componentWillMount () {
    window.localStorage.clear()
    this.state = {
      showRegis: false,
      authenticated: false,
      showLogin: false,
      saved: [],
      flashMessages: [],
      isAuthenticated: false,
      authService: new AuthenticationService(),
      catalogService: new CatalogService()
    }
    this.state.authService.setHandlers(
      (msg, msgType) => { this.createFlashMessage(msg, msgType) },
      (newState) => { this.setState({ authenticated: newState }) },
      (route) => { this.props.history.push(route) }
    )

    this.state.catalogService.setHandlers(
      (list) => { this.setState({ products: list }) }
    )
    // var products = window.localStorage.getItem('products')
    this.setState({
      // products: products ? JSON.parse(products) : catalog
      products: null
    })

    this.state.catalogService.fetchProducts()
  }
  constructor (props) {
    super(props)
    this.logoutUser = this.logoutUser.bind(this)
    this.deleteFlashMessage = this.deleteFlashMessage.bind(this)
    this.createFlashMessage = this.createFlashMessage.bind(this)
    this.loginUser = this.loginUser.bind(this)
    this.registerUser = this.registerUser.bind(this)
    this.setAuthStatus = this.setAuthStatus.bind(this)
  }
  createFlashMessage (text, type = 'success') {
    const message = { text, type }
    this.setState({
      flashMessages: [...this.state.flashMessages, message]
    })
  }
  deleteFlashMessage (index) {
    if (index > 0) {
      this.setState({
        flashMessages: [
          ...this.state.flashMessages.slice(0, index),
          ...this.state.flashMessages.slice(index + 1)
        ]
      })
    } else {
      this.setState({
        flashMessages: [...this.state.flashMessages.slice(index + 1)]
      })
    }
  }
  registerUser (userData, callback) {
    this.state.authService.registerUser(userData, callback)
  }
  loginUser (userData, callback) {
    this.state.authService.loginUser(userData, callback)
  }
  logoutUser (e) {
    e.preventDefault()
    this.setAuthStatus(false, false, false)
    this.props.history.push('/')
    this.createFlashMessage('You are now logged out')
  }
  setAuthStatus (auth, showRegis, showLogin) {
    this.setState({
      showRegis: showRegis,
      authenticated: auth,
      showLogin: showLogin
    })
  }
  render () {
    const { flashMessages, showRegis, authenticated, showLogin, products } = this.state
    return (
      <div >
        <FlashMessages
          deleteFlashMessage={this.deleteFlashMessage}
          messages={flashMessages} />
        <br />
        <Switch>
          <Route exact path='/admin' render={() => {
            return <AdminForm
              products={products}
              createFlashMessage={this.createFlashMessage}
              setAuthStatus={this.setAuthStatus}
              logoutUser={this.logoutUser} />
          }} />
          <Route exact path='/register' render={() => {
            return <RegisterForm
              createFlashMessage={this.createFlashMessage}
              setAuthStatus={this.setAuthStatus}
              registerUser={this.registerUser} />
          }} />
          <Route exact path='/login' render={() => {
            return <LoginForm
              createFlashMessage={this.createFlashMessage}
              setAuthStatus={this.setAuthStatus}
              loginUser={this.loginUser} />
          }} />
          <Route exact path='/' render={() => {
            if (authenticated) {
              if (window.localStorage.getItem('role') === "admin") {
                return <Redirect to='/admin' />
              } else {
                return <ShoppingCartApp
                  setAuthStatus={this.setAuthStatus}
                  authenticated={authenticated}
                  logoutUser={this.logoutUser} />
              }
            } else if (showRegis) {
              return <Redirect to='/register' />
            } else if (showLogin) {
              return <Redirect to='/login' />
            } else {
              return <ShoppingCartApp
                setAuthStatus={this.setAuthStatus}
                authenticated={authenticated} />
            }
          }} />
          <Redirect to='/' />
        </Switch>
      </div>
    )
  }
}

export default App
