import React, {Component} from 'react'
import Counter from './Counter'

class Product extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedProduct: {},
      quickViewProduct: {},
      product: {
        image: this.props.image,
        name: this.props.name,
        price: this.props.price,
        id: this.props.id,
        category: this.props.category,
        quantity: 1
      },
      buttonLabel: 'ADD TO CART'
    }
    this.updateQuantity = this.updateQuantity.bind(this)
  }

  addToCart () {
    this.props.addToCart(this.state.product)
    this.setState({
      buttonLabel: '✔ ADDED'
    }, function () {
      setTimeout(() => {
        this.setState({ buttonLabel: 'ADD TO CART' })
      }, 1000)
    })
  }
  quickView () {
    this.setState({
      quickViewProduct: {
        image: this.props.image,
        name: this.props.name,
        price: this.props.price
      }
    }, function () {
      this.props.openModal(this.state.quickViewProduct)
    })
  }
  updateQuantity (quantity) {
    this.setState({
      product: {
        image: this.props.image,
        name: this.props.name,
        price: this.props.price,
        id: this.props.id,
        category: this.props.category,
        quantity: quantity
      }
    })
  }

  render () {
    let {image, name, price} = this.state.product
    return (
      <div className='product'>
        <h4 className='product-name'>{name}<br />{price} €/kg</h4>
        <div className='product-image'>
          <img src={image} alt={name}
            onClick={this.quickView.bind(this)} />
        </div>
        <Counter updateQuantity={this.updateQuantity} />
        <div className='product-action'>
          <button type='button' className={this.props.authenticated ? 'search-button' : 'disable-button'}
            onClick={this.addToCart.bind(this)}>
            {this.state.buttonLabel}
          </button>
        </div>
      </div>
    )
  }
}

export default Product
