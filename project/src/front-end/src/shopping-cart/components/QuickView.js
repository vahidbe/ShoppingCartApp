import React, {Component} from 'react'
import Recommendations from './Recommendations'

// The component QuickView that displays more informations for an item
// when it is selected in the catalog
class QuickView extends Component {

  componentWillUnmount () {
    this.props.closeModal()
  }

  handleClose () {
    this.props.closeModal()
  }

  // Renders a list of recommended items for the current item in the quickview 
  // if the view is in modal mode and if there is recommended items to show
  render () {
    let product = this.props.product
    let name = product.name
    let image = product.image
    let price = product.price
    var recommendationData = []
    if (this.props.recommendedProducts.length > 0) {
      recommendationData.push(<Recommendations
        key="ItemRecommendations:"
        isAnArray={true}
        productsList={{"Customers who bought this item also bought": this.props.recommendedProducts}}
        searchTerm={this.props.searchTerm}
        addToCart={this.props.addToCart}
        openModal={()=>{}}
        authenticated={this.props.authenticated} />)
    } else {
      recommendationData.push(<Recommendations
        key="ItemRecommendationsEmpty:"
        isAnArray={true}
        productsList={{"": []}}
        searchTerm={this.props.searchTerm}
        addToCart={this.props.addToCart}
        openModal={()=>{}}
        authenticated={this.props.authenticated} />)
    }
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
            {recommendationData}
          </center>
        </div>
      </div>
    )
  }
}

export default QuickView
