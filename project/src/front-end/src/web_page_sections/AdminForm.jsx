import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import CatalogService from '../interfaces/CatalogService'

// The AdminForm component allows an administrator to add or remove categories
// and products
class AdminForm extends Component {
  componentWillMount () {
    this.state = {
      catalog: {},
      categories: [],
      products: [],
      newProd: {
        name: "",
        price: "",
        category: "",
        image: ""
      },
      newCat: "",
      selectedProd: undefined,
      selectedCate: undefined,
      selectedProdId: undefined,
      logOut: false,
      catalogService: new CatalogService(),
      action: undefined
    }
    this.state.catalogService.setHandlers(
      (list) => { this.setState({ catalog: list, categories: Object.keys(list) }) }
    )
    this.state.catalogService.fetchProducts()
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
    var products = this.state.catalog[category]
    var prodIds = Object.keys(products)
    this.setState({
      products: prodIds.map((id) => {
        var name = products[id].name
        return (<a key={id} id={id}
          onClick={(ev) => {this.renderProductInf(ev, category, id)}}>
          {name}
        </a>)
      })
    })
  }
  
  getRenderProducts (category) {
    var products = this.state.catalog[category]
    if (products === undefined)
      return
    var prodIds = Object.keys(products)
    return prodIds.map((id) => {
        var name = products[id].name
        return (<a key={id} id={id}
          onClick={(ev) => {this.renderProductInf(ev, category, id)}}>
          {name}
        </a>)
    })
  }

  renderProductInf (e, category, id) {
    var produId = id
    this.setState({
      selectedProdId: produId
    })
    var product = this.state.catalog[category][produId]
    var p = (<fieldset>
      <h1 className='welcome'>{`${product.name}`}</h1>Price:<br />
      <input style={{ width: '50%' }} type='text' name='product_price'
        value={this.state.catalog[category][produId].price} onChange={this.handleProductChange.bind(this, produId, category, 'price')} /><br />Category:<br />
      <input style={{ width: '50%' }} type='text' name='product_category'
        value={this.state.catalog[category][produId].category} onChange={this.handleProductChange.bind(this, produId, category, 'category')} /><br />Image URL:<br />
      <input style={{ width: '50%' }} type='text' name='product_image'
        value={this.state.catalog[category][produId].image} onChange={this.handleProductChange.bind(this, produId, category, 'image')} />
      <img style={{ width: '50%' }} src={product.image} alt={product.name} />
    </fieldset>)
    this.setState({
      selectedProd: p
    })
  }

  highestIdCatalog () {
    const catalog = this.state.catalog
    var highestKey = -1
    for (var key of Object.keys(catalog)) {
      var category = catalog[key]
      for (var productKey of Object.keys(category)) {
        if (productKey > highestKey) {
          highestKey = productKey
        }
      }
    }
    return parseInt(highestKey, 10)
  }

  highestIdCategories () {
    const categories = this.state.categories
    var highestKey = -1
    for (var key of Object.keys(categories)) {
      if (key > highestKey) {
        highestKey = key
      }
    }
    return parseInt(highestKey, 10)
  }

  getProductIndex (category, prodId) {
    const cat = this.state.catalog[category]
    var index = 0
    for (var key of Object.keys(cat)) {
      if (parseInt(key, 10) === parseInt(prodId, 10)) {
        return index
      }
      index++
    }
  }

  getCategoryIndex (category) {
    const cat = this.state.categories
    var index = 0
    for (var key of Object.keys(cat)) {
      if (cat[key] === category) {
        return index
      }
      index++
    }
  }

  renderAddProduct () {
    const newProd = this.state.newProd
    newProd["id"] = this.highestIdCatalog() + 1
    return (<fieldset>
      <h1 className='welcome'>{`New Product`}</h1>Name:<br />
      <input style={{ width: '100%' }} type='text' name='new_product_name'
        value={newProd.name} onChange={this.handleChangeAddProduct.bind(this, newProd, 'name')}/><br />Price:<br />
      <input style={{ width: '100%' }} type='text' name='new_product_price'
        value={newProd.price} onChange={this.handleChangeAddProduct.bind(this, newProd, 'price')}/><br />Category:<br />
      <input style={{ width: '100%' }} type='text' name='new_product_category'
        value={newProd.category} onChange={this.handleChangeAddProduct.bind(this, newProd, 'category')}/><br />Image URL:<br />
      <input style={{ width: '100%' }} type='text' name='new_product_image'
        value={newProd.image} onChange={this.handleChangeAddProduct.bind(this, newProd, 'image')}/>
      <br />
      <button className='btn btn-primary'
            onClick={
              () => {
                const { newProd, categories } = this.state
                const username = localStorage.getItem('username')
                const role = localStorage.getItem('role')
                const token = localStorage.getItem('authToken')
                var updateState = {}
                if (categories.includes(newProd.category) && !(newProd.name === undefined)) {
                  const id = this.highestIdCatalog() + 1
                  updateState.catalog = this.state.catalog
                  updateState.catalog[newProd.category][id] = newProd
                  updateState.products = this.state.products
                  this.state.catalogService.addProduct(username, role, token, newProd)
                  updateState.selectedCate = newProd.category
                }
                updateState.action = undefined
                updateState.newProd = {
                    name: "",
                    price: "",
                    category: "",
                    image: ""
                }
                this.setState(updateState)
              }
            }>Confirm</button>
      <br />
      <button className='btn btn-primary'
            onClick={
              () => this.setState({ 
                action: undefined,
                newProd: {
                  name: "",
                  price: "",
                  category: "",
                  image: ""
              }})
            }>Cancel</button>
    </fieldset>)
  }

  renderAddCategory () {
    const newCat = this.state.newCat
    return (<fieldset>
      <h1 className='welcome'>{`New Category`}</h1>Name:<br />
      <input style={{ width: '50%' }} type='text' name='new_category_name'
        value={newCat} onChange={this.handleChangeAddCategory.bind(this, newCat)}/>
      <br />
      <button className='btn btn-primary'
            onClick={
              () => {
                const { newCat, categories } = this.state
                var updateState = {}
                if (!categories.includes(newCat)) {
                  updateState.catalog = this.state.catalog
                  updateState.catalog[newCat] = {}
                  const id = this.highestIdCategories() + 1
                  categories[id] = newCat
                  updateState.categories = categories
                }
                updateState.action = undefined
                updateState.newCat = ""
                this.setState(updateState)
              }
            }>Confirm</button>
      <br />
      <button className='btn btn-primary'
            onClick={
              () => this.setState({ 
                action: undefined,
                newProd: {
                  name: "",
                  price: "",
                  category: "",
                  image: ""
              }})
            }>Cancel</button>
    </fieldset>)
  }

  handleChangeAddCategory (newCat, e) {
    newCat = e.target.value
    this.setState({ newCat: newCat });
  }

  handleChangeAddProduct (newProd, tag, e) {
    newProd[tag] = e.target.value
    this.setState({ newProd: newProd });
  }

  handleProductRemove (produId, category) {
    const username = localStorage.getItem('username')
    const role = localStorage.getItem('role')
    const token = localStorage.getItem('authToken')
    const index = this.getProductIndex(category, produId)
    const product = this.state.catalog[category][produId]
    var updateState = {} 
    updateState.catalog = Object.assign({}, this.state.catalog)
    delete updateState.catalog[category][produId]
    updateState.selectedProdId = undefined
    updateState.products = this.state.products.slice()
    updateState.products.splice(index, 1)
    this.state.catalogService.removeProduct(username, role, token, product)
    this.setState(updateState)
  }

  handleCategoryRemove (category) {
    const username = localStorage.getItem('username')
    const role = localStorage.getItem('role')
    const token = localStorage.getItem('authToken')
    const products = this.state.catalog[category]
    var updateState = {} 
    updateState.catalog = Object.assign({}, this.state.catalog) 
    delete updateState.catalog[category]
    updateState.selectedProdId = undefined
    updateState.products = []
    updateState.categories = this.state.categories.slice()
    updateState.categories.splice(this.getCategoryIndex(category), 1)
    for (var id in products) {
      this.state.catalogService.removeProduct(username, role, token, products[id])
    }
    this.setState(updateState)
  }

  handleProductChange (produId, category, tag, e) {
    const username = localStorage.getItem('username')
    const role = localStorage.getItem('role')
    const token = localStorage.getItem('authToken')
    var updateState = {}
    updateState.catalog = this.state.catalog
    updateState.catalog[category][produId][tag] = e.target.value
    this.state.catalogService.modifyProduct(username, role, token, updateState.catalog[category][produId])
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
    const { products, selectedProd, action, logOut } = this.state
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
            onClick={() => {
              this.setState({ action: "addCat" })
            }}>Add category</button>
          <h3 className='blank-space' />
          <button className='btn'
            onClick={() => {
              this.handleCategoryRemove(this.state.selectedCate)
            }}>Remove category</button>
          <h3 className='blank-space' />
          <div className='vertical-menu'>
            <a className='active'>Products</a>
            {
              (this.state.selectedCate !== undefined) ? this.getRenderProducts(this.state.selectedCate) : products
            }
          </div>
          <h3 className='blank-space' />
          <button className='btn btn-primary'
            onClick={() => {
              this.setState({ action: "addProd" })
            }}>Add product</button>
          <h3 className='blank-space' />
          <button className='btn'
            onClick={() => {
              this.handleProductRemove(this.state.selectedProdId, this.state.selectedCate)
            }}>Remove product</button>
            { /* eslint-disable**/}
					<form >{
            (action==="addProd") ? this.renderAddProduct()
            : (action==="addCat") ? this.renderAddCategory()
              : !selectedProd ?
                <fieldset><h1 style={{width: '100%'}} className='welcome'>Products details</h1></fieldset>
                : selectedProd
					}</form>
        </div>
      </div>
		</div>
  }
}

export default AdminForm
