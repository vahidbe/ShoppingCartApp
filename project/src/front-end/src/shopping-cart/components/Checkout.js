import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'

// The Checkout component displays the summarization of the past orders and the new order
// of the user when checking out
class Checkout extends Component {
  componentWillMount () {
    var items = this.props.purchase
    var purTotal = 0
    for (var i = 0; i < items.length; i++) {
      purTotal += items[i].quantity * items[i].price
    }
    this.state = {
      backToPur: false,
      purchase: {
        time: new Date().toUTCString(),
        products: this.props.purchase,
        total: purTotal
      }
    }
  }

  constructor (props) {
    super(props)
    this.cancelCheckout = this.cancelCheckout.bind(this)
    this.confirmCheckout = this.confirmCheckout.bind(this)
  }

  renderPurchases () {
    let latestP = [this.state.purchase].concat(this.props.oldPurchases)
    latestP.sort((a, b) => {
      return new Date(b.time).getTime() - new Date(a.time).getTime()
    })
    let purId = 0
    let toRender = latestP.map(
      (purchase) => {
        purId++
        return this.formatPurchase(purchase, purId)
      }
    )
    return (
      <table className='checkout-table'><tbody>
        {toRender}
      </tbody></table>
    )
  }
  /* eslint-disable */
  formatPurchase (purchase, purId) {
    let total = 0
    let items = purchase.products.map(
      (product) => {
        total += product.quantity * product.price
        return (
          <li className='cart-item' key={product.id}>
            <img className='product-image' src={product.image} />
            <div className='product-info'>
              <p className='product-name'>{product.name}</p>
              <p className='product-price'>{product.price}</p>
            </div>
            <div className='product-total'>
              <p className='quantity'>
                {product.quantity} {product.quantity > 1 ? 'Nos.' : 'No.' }
              </p>
              <p className='amount'>{product.quantity * product.price}</p>
            </div>
          </li>
        )
      }
    )
    return (
      <tr key={purId} className='checkout-tr'>
        {/* <td>{purchase.id}</td> */}
        <td className='checkout-td'>{purchase.time}</td>
        <td className='checkout-td'>{items}</td>
        <td className='checkout-td'>{Number((total).toFixed(2))}</td>
      </tr>
    )
  }
  /* eslint-enable */

  cancelCheckout () {
    this.props.endCheckout()
    this.setState({ backToPur: true })
  }

  confirmCheckout () {
    this.props.cartService.checkout(
      localStorage.getItem('username'),
      localStorage.getItem('role'),
      localStorage.getItem('authToken')
    )
    this.props.endCheckout()
    this.setState({ backToPur: true })
  }

  // Renders the current purchase as well as all the past ones (if there are some)
  // by displaying the date of the purchases, their items and the total price for each of them 
  render () {
    const { backToPur } = this.state.backToPur
    return (backToPur ? <Redirect to='/' /> : <div className='container'>
      <div className='checkout-container-l'>
        <h1>{window.localStorage.getItem('username')}'s purchases</h1>
        <h3 className='blank-space' />
        <button className='search-button'
          onClick={this.confirmCheckout}>Confirm purchase</button>
        <h3 className='blank-space' />
        <button className='search-button ko-button'
          onClick={this.cancelCheckout}>Cancel purchase</button>
        <br />
      </div>
      <hr />
      <table className='checkout-table'><tbody>
        <tr className='checkout-tr'>
          <th className='checkout-th'><strong>Date of purchase</strong></th>
          <th className='checkout-th'><strong>Items</strong></th>
          <th className='checkout-th'><strong>Total</strong></th>
        </tr>
      </tbody>
      </table>
      <div>{this.renderPurchases()} </div>
    </div>)
  }
}

export default Checkout
