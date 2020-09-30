import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'

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
        date: new Date().toLocaleTimeString(),
        items: this.props.purchase,
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
      return a.date < b.date
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
    let items = purchase.items.map(
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
        <td className='checkout-td'>{purchase.date}</td>
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
    let items = this.props.purchase.map((i) => {
      return {
        id: i.id,
        price: i.price,
        quantity: i.quantity,
        subtotal: i.price * i.quantity,
        category: i.category
      }
    })
    this.props.postPurchase(this.state.purchase, items)
    this.props.endCheckout()
    this.setState({ backToPur: true })
  }

  render () {
    const { backToPur } = this.state.backToPur
    return (backToPur ? <Redirect to='/' /> : <div className='container'>
      <div className='checkout-container-l'>
        <h1>{JSON.parse(window.localStorage.getItem('username'))}'s purchases</h1>
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
