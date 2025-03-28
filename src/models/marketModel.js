class MarketModel {
  constructor(name = '', symbol = '', price = '', icon = '') {
    this.symbol = symbol
    this.name = name
    this.icon = icon
    this.price = price // in USD
    this.category = 0
  }
}

export default MarketModel
