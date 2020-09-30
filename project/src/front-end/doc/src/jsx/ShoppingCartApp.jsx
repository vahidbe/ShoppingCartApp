import React from 'react'
import PropTypes from 'prop-types'
import PurchaseService from './interfaces/PurchaseService'

export const ShoppingCartApp = () => (<div />)

ShoppingCartApp.propTypes = {
  /**
    State of component, this is a brief description of each value in this dictionary.
    @param catalog : Items in catalog  ;
    @param cart : Items (objects) in user's cart ;
    @param totalItems : Total number of items in user's cart ;
    @param totalAmount : Total cost of all items in user's cart ;
    @param currentItemInView : Item to appear in preview when users click on its picture ;
    @param doCheckout : Starts the checkout procedure when this boolean variable is
      set to {true} ;
    @param previousPurchases : User previous purchases ;
    @param purchaseService : This object fetch the catalog as well as user's previous
      purchases. Find more details in class PurchasesService (source
      file: src/interfaces/LocalPurchases.js). */
  state: PropTypes.shape({
    catalog: PropTypes.oneOf([[]]),
    cart: PropTypes.oneOf([[]]),
    totalItems: PropTypes.number,
    totalAmount: PropTypes.number,
    currentItemInView: PropTypes.object,
    doCheckout: PropTypes.bool,
    previousPurchases: PropTypes.oneOf([[]]),
    purchaseService: PropTypes.instanceOf(PurchaseService)
  }),
  /**
    @arg chosenProduct : Item to add in the user's cart ;
    @postcondition : User's cart contains one more item. */
  handleAddToCart: PropTypes.func,
  /**
    @arg chosenProduct : Item to take rid from the user's cart ;
    @postcondition : User's cart contains one less item. */
  handleRemoveProduct: PropTypes.func,
  /**
    @arg - ;
    @postcondition : Bootstraps the checkout procedure, find more details about how
      this procedure work in <Checkout /> (source file:
      src/shopping-cart/components/Checkout.js). */
  handleCheckout: PropTypes.func,
  /**
    @arg - ;
    @postcondition : The user have confirmed a purchase and is back to the main page. */
  endCheckout: PropTypes.func,
  /**
    @arg productID : Item unique identifier ;
    @postcondition : Returns {true} if the item is already in the user's cart and
      {false} otherwise. */
  checkProduct: PropTypes.func,
  /**
    @arg - ;
    @postcondition : Counts the total number of items in the user's cart. */
  sumTotalItems: PropTypes.func,
  /**
    @arg - ;
    @postcondition : Gets the total cost of a user's cart. */
  sumTotalAmount: PropTypes.func,
  /**
    @arg - ;
    @postcondition: Pops up a item detailed view. */
  showItemView: PropTypes.func,
  /**
    @arg - ;
    @postcondition: Close item detailed view. */
  closeItemView: PropTypes.func
}

ShoppingCartApp.defaultProps = {
  state: {
    catalog: [],
    cart: [],
    totalItems: 0,
    totalAmount: 0,
    currentItemInView: {},
    doCheckout: false,
    previousPurchases: [],
    purchaseService: new PurchaseService()
  }
}
