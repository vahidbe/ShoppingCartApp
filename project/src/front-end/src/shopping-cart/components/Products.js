import React, {Component} from 'react'
import Product from './Product'
import LoadingProducts from '../loaders/Products'
import NoResults from '../empty-states/NoResults'
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup'

// The Products component of the application that is used to display products
// (using the Product component) in the catalog or in the user-based recommendations
// and best-sellers recommendations
class Products extends Component {
  render () {
    let term = this.props.searchTerm
    let productsData = []
    let categories = Object.keys(this.props.productsList).sort()
    for (var c = 0; c < categories.length; c++) {
      productsData.push(
        <div key={categories[c]} className='container'>
          <h1>{ categories[c] }</h1>
          <hr />
        </div>
      )

      if (this.props.isAnArray) {
        var items = this.props.productsList[ categories[c] ]
        for (var i = 0; i < items.length; i++) {
          var item = items[ i ]
          productsData.push(
            <Product key={item.id} price={item.price} name={item.name}
              image={item.image} id={item.id} category={item.category}
              addToCart={this.props.addToCart} openModal={this.props.openModal}
              authenticated={this.props.authenticated}
            />
          )
        }
      } else {
        var itemIds = Object.keys(this.props.productsList[ categories[c] ])
        for (var key of itemIds) {
          var item = this.props.productsList[ categories[c] ][ parseInt(key, 10) ]
          productsData.push(
            <Product key={parseInt(key, 10)} price={item.price} name={item.name}
              image={item.image} id={parseInt(key, 10)} category={item.category}
              addToCart={this.props.addToCart} openModal={this.props.openModal}
              authenticated={this.props.authenticated}
            />
          )
        }
      }
    }
    // Empty and Loading States
    let view
    if (categories.length <= 0 && !term) {
      view = <LoadingProducts />
    } else if (categories.length <= 0 && term) {
      view = <NoResults />
    } else {
      view = <CSSTransitionGroup
        className='products'
        transitionName='fadeIn'
        transitionEnterTimeout={500}
        transitionLeaveTimeout={300} component='div'>
        {productsData}
      </CSSTransitionGroup>
    }
    return (
      <div className='products-wrapper'>
        {view}
      </div>
    )
  }
}

export default Products
