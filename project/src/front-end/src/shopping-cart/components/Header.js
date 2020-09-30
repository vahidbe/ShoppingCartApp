/* eslint-disable*/
import React, {Component} from 'react';
import CartScrollBar from './CartScrollBar';
import Counter from './Counter';
import EmptyCart from '../empty-states/EmptyCart';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import {findDOMNode} from 'react-dom';
import {Redirect} from 'react-router-dom';

class Header extends Component{
    constructor(props){
        super(props);
        this.state = {
            showCart: false,
            cart: this.props.cartItems,
            mobileSearch: false,
            welcomeMsg: 'Welcome'
        };
				this.setAuthStatus = this.setAuthStatus.bind(this)
    }
    handleCart(e){
        e.preventDefault();
        this.setState({
            showCart: !this.state.showCart
        })
    }
    handleSubmit(e){
        e.preventDefault();
    }
    handleMobileSearch(e){
        e.preventDefault();
        this.setState({
            mobileSearch: true
        })
    }
    handleSearchNav(e){
        e.preventDefault();
        this.setState({
            mobileSearch: false
        }, function(){
            this.refs.searchBox.value = "";
            this.props.handleMobileSearch();
        })
    }
    handleClickOutside(event) {
        const cartNode = findDOMNode(this.refs.cartPreview);
        const buttonNode = findDOMNode(this.refs.cartButton);
        if(cartNode && cartNode.classList.contains('active')){
            if (!cartNode || !cartNode.contains(event.target)){
                this.setState({
                    showCart: false
                })
                event.stopPropagation();
            }
        }
    }
    componentDidMount() {
      document.addEventListener('click', this.handleClickOutside.bind(this), true);
    }
    componentWillUnmount() {
      document.removeEventListener('click', this.handleClickOutside.bind(this), true);
    }
    setAuthStatus(e, auth, showRegis, showLogin) {
        e.preventDefault()
        this.props.setAuthStatus(auth, showRegis, showLogin)
    }
    logoutUser(e){
        e.preventDefault();
        this.props.logoutUser(e)
    }
    render(){
      let cartItems;
      cartItems = this.state.cart.map(product =>{
			return(
				<li className="cart-item" key={product.name}>
          <img className="product-image" src={product.image} />
          <div className="product-info">
            <p className="product-name">{product.name}</p>
            <p className="product-price">{product.price}</p>
          </div>
          <div className="product-total">
            <p className="quantity">{product.quantity} {product.quantity > 1 ?"Nos." : "No." } </p>
            <p className="amount">{product.quantity * product.price}</p>
          </div>
          <a className="product-remove" href="#" onClick={this.props.removeProduct.bind(this, product.id)}>×</a>
        </li>
			)
		});
    let view;
    if(cartItems.length <= 0){
			view = <EmptyCart />
		} else{
			view = (
				<CSSTransitionGroup
					transitionName="fadeIn" transitionEnterTimeout={500}
					transitionLeaveTimeout={300} component="ul" className="cart-items" >
					{cartItems}
				</CSSTransitionGroup>
			)
		}

        return(
            <header>
              <div className="container">
                <h1 className="welcome">
									{
                    this.props.authenticated ?
										`${this.state.welcomeMsg}: ${JSON.parse(window.localStorage.getItem('username'))} !` : `${this.state.welcomeMsg} !`
									}
								</h1>
								<button
									className={this.props.authenticated ? "disable-button" : "search-button"}
									onClick={(e) => {this.setAuthStatus(e, false, false, true)}}
        >Sign in</button>
								<h3 className='blank-space'/>
								<button
									className={this.props.authenticated ? "disable-button" : "ko-button"}
									onClick={(e) => {this.setAuthStatus(e, false, true, false)}}
        >Sign up</button>
								<h3 className='blank-space'/>
								<button onClick={(e) => {
                  this.setAuthStatus(e, false, false, false);
                  this.logoutUser(e);
								}}
									className={this.props.authenticated ? 'btn btn-primary' : 'disable-button'}
        >Log out</button>
                <div className="cart">
                  <div className="cart-info">
                    <table className='checkout'>
                      <tbody>
                        <tr>
                          <td>No. of items</td>
                          <td>:</td>
                          <td><strong>{this.props.totalItems}</strong></td>
                        </tr>
                        <tr>
                          <td>Sub Total</td>
                          <td>:</td>
                          <td><strong>{this.props.total}</strong></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <a className={this.props.authenticated ? "cart-icon" : "disable-button"} ref="cartButton" href="#"
                    onClick={this.handleCart.bind(this)}>
                    <img className={this.props.cartBounce ? "tada" : " "}
                      src="https://res.cloudinary.com/sivadass/image/upload/v1493548928/icons/bag.png"
                      alt="Cart"
                    />
                    {this.props.totalItems
                      ? <span className="cart-count">{this.props.totalItems}</span>
                      : ""
                    }
                  </a>
                  <div ref="cartPreview" className={this.state.showCart ? "cart-preview active" : "cart-preview"} >
                    <CartScrollBar>
                      {view}
                    </CartScrollBar>
                    <div className="action-block">
                      <button type="button" className={this.state.cart.length > 0 ? " " : "disabled"}
                        onClick={this.props.handleCheckout}  >PROCEED TO CHECKOUT</button>
                    </div>
                  </div>
                </div>
              </div>
            </header>
        )
    }
}

export default Header;
