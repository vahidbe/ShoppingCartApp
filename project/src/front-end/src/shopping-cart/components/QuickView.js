import React, {Component} from 'react'

class QuickView extends Component {
  componentWillUnmount () {
    this.props.closeModal()
  }

  handleClose () {
    this.props.closeModal()
  }

  render () {
    let product = this.props.product
    let name = product.name
    let image = product.image
    let price = product.price
    return (
      <div className={this.props.openModal ? 'modal-wrapper active' : 'modal-wrapper'}>
        <div className='modal' ref='modal'>
          <button type='button' className='close' onClick={this.handleClose.bind(this)}>&times;</button>
          <center>
            <div className='product'>
              <span className='product-name'>{name}</span>
              <br />
              <span className='product-price'>{price}</span>
              <div className='product-image'>
                <img src={image} alt={name} />
              </div>
            </div>
            <h2>About the product</h2>
            <p>TODO: write down small description...</p>
            <br />
            <h3>Customers who bought this item also bought</h3>
            <p>TODO: fetch recommendations</p>
          </center>
        </div>
      </div>
    )
  }
}

export default QuickView
