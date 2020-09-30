const products = require('../shopping-cart/components/catalog')

class LocalPurchases {
  constructor () {
    window.localStorage.setItem('purchases', JSON.stringify([]))
  }
  setHandlers (setProductsList, setPurHistory) {
    this.setProducts = setProductsList
    this.setPurHistory = setPurHistory
  }
  fetchProducts () {
    this.setProducts(products)
  }
  fetchHistory () {
    var purchases = JSON.parse(window.localStorage.getItem('purchases'))
    purchases = purchases.map((pur) => {
      pur.items = pur.items.map((i) => {
        i.name = products[i.category][i.id]['name']
        i.image = products[i.category][i.id]['image']
        return i
      })
      return pur
    })
    this.setPurHistory(purchases)
  }
  postPurchase (p, items) {
    p['items'] = items
    var purchases = JSON.parse(window.localStorage.getItem('purchases'))
    purchases.push(p)
    window.localStorage.setItem('purchases', JSON.stringify(purchases))
  }
}

export default LocalPurchases
