import React, {Component} from 'react'
import Counter from './Counter'

// The Product component used in the recommendations, the catalog, the checkout
// and the quickview to display a single product
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

  componentDidMount() { 
    this._ismounted = true;
  }
  
  componentWillUnmount() {
     this._ismounted = false;
  }

  addToCart () {
    this.props.addToCart(this.state.product)
    this.setState({
      buttonLabel: '✔ ADDED'
    }, function () {
      setTimeout(() => {
        if (this._ismounted) {
          this.setState({ buttonLabel: 'ADD TO CART' })
        }
      }, 1000)
    })
  }
  quickView () {
    this.setState({
      quickViewProduct: {
        id: this.props.id,
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

  // Renders a product individually
  // It shows the mains attributes of the products as well as its image
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
