import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'

class AdminForm extends Component {
  componentWillMount () {
    this.state = {
      catalog: this.props.products,
      categories: Object.keys(this.props.products),
      products: [],
      selectedProd: undefined,
      selectedCate: undefined,
      logOut: false
    }
  }
  constructor (props) {
    super(props)
    this.renderCategories = this.renderCategories.bind(this)
    this.renderProducts = this.renderProducts.bind(this)
    this.renderProductInf = this.renderProductInf.bind(this)
    this.logOut = this.logOut.bind(this)
    this.handleProductChange = this.handleProductChange.bind(this)
  }
  renderCategories () {
    return this.state.categories.map((c) => {
      return (<a id={c} key={c}
        onClick={(e) => { this.renderProducts(e) }}>{c}</a>)
    })
  }
  renderProducts (e) {
    var category = e.target.id
    this.setState({ selectedCate: category })
    var products = this.props.products[category]
    var prodIds = Object.keys(products)
    this.setState({
      products: prodIds.map((id) => {
        var name = products[id].name
        return (<a key={id} id={id}
          onClick={(ev) => { this.renderProductInf(ev, category, id) }}>
          {name}
        </a>)
      })
    })
  }
  renderProductInf (e, category, id) {
    var produId = id
    this.setState({ selectedProd: produId })
    var product = this.props.products[category][produId]
    var p = (<fieldset>
      <h1 className='welcome'>{`${product.name}`}</h1>Price:<br />
      <input style={{ width: '50%' }} type='text' name='price'
        value={this.state.catalog[category][produId].price} onChange={this.handleProductChange.bind(this, produId, category, 'price')} /><br />Category:<br />
      <input style={{ width: '50%' }} type='text' name='category'
        value={product.category} onChange={this.handleProductChange.bind(this, produId, category, 'category')} /><br />Image URL:<br />
      <input style={{ width: '50%' }} type='text' name='image'
        value={product.image} onChange={this.handleProductChange.bind(this, produId, category, 'image')} />
      <img style={{ width: '50%' }} src={product.image} alt={product.name} />
    </fieldset>)
    this.setState({
      selectedProd: p
    })
  }
  handleProductChange (produId, category, tag, e) {
    var updateState = {}
    updateState.catalog = this.state.catalog
    updateState.catalog[category][produId][tag] = e.target.value
    this.setState(updateState)
    this.renderProductInf(e, category, produId)
  }
  logOut (e) {
    var products = JSON.parse(window.localStorage.getItem('products'))
    if (!products) {
      window.localStorage.setItem('products', JSON.stringify(this.state.catalog))
    }
    this.props.logoutUser(e)
    this.props.setAuthStatus(false, false, false)
    this.setState({
      logOut: true
    })
    e.preventDefault()
  }
  render () {
    const { products, selectedProd, logOut } = this.state
    return logOut ? <Redirect to='/' /> : <div >
      <header>
        <div className='container'>
          <h1 className='welcome' >Administrator's page</h1>
          <h3 className='blank-space' />
          <button className='btn btn-primary'
            onClick={this.logOut}>Log out</button>
        </div>
      </header>
      <br />
      <div className='smaller-container'>
        <div className='checkout-container-l'>
          <div className='vertical-menu'>
            <a className='active'>Categories</a>
            {this.renderCategories()}
          </div>
          <h3 className='blank-space' />
          <button className='btn btn-primary'
            onClick={this.confirmCheckout}>Add category</button>
          <h3 className='blank-space' />
          <button className='btn'
            onClick={this.cancelCheckout}>Remove category</button>
          <h3 className='blank-space' />
          <div className='vertical-menu'>
            <a className='active'>Products</a>
            {products}
          </div>
          <h3 className='blank-space' />
          <button className='btn btn-primary'
            onClick={this.confirmCheckout}>Add product</button>
          <h3 className='blank-space' />
          <button className='btn'
            onClick={this.cancelCheckout}>Remove product</button>
          { /* eslint-disable*/}
					<form >{
						!selectedProd
              ? <fieldset><h1 style={{width: '50%'}} className='welcome'>Products details</h1></fieldset>
							: selectedProd
					}</form>
        </div>
      </div>
		</div>
  }
}

export default AdminForm
