import React, {Component} from 'react'
import Product from './Product'
import LoadingProducts from '../loaders/Products'
import NoResults from '../empty-states/NoResults'
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup'

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
      var itemIds = Object.keys(this.props.productsList[ categories[c] ])
      for (var i = 0; i < itemIds.length; i++) {
        var item = this.props.productsList[ categories[c] ][ itemIds[i] ]
        item['id'] = itemIds[i]
        productsData.push(
          <Product key={item.id} price={item.price} name={item.name}
            image={item.image} id={item.id} category={item.category}
            addToCart={this.props.addToCart} openModal={this.props.openModal}
            authenticated={this.props.authenticated}
          />
        )
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
