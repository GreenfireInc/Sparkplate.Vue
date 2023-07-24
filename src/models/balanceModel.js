class BalanceModel {
  constructor(currency, price, address = null) {
    this.currency = currency
    this.price = price
    this.address = address
    this.converted = 0
  }
}

export default BalanceModel
