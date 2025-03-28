export class HDWalletService {
  constructor(mnemonic, email, password, name) {
    this.password = password
    this.email = email
    this.name = name
    this.mnemonic = mnemonic.phrase
    this.seed = mnemonic.seed
  }

  async generateWallet({ coinTicker, network, displacer = 0 }) {
    const seed = this.seed
    const derivationIndex =
      displacer || this.getDerivationIndex({ coinTicker, network })
    const wallet = await window.cryptos.generateWallet({
      seed,
      coinTicker,
      network,
      derivationIndex
    })
    if (!displacer) this.incrementWalletCounter({ coinTicker, network })

    return {
      balance: 0, // set balance before spreading wallet
      ...wallet, // if wallet is returned with balance, wallet.balance value will be used
      currency: coinTicker.toUpperCase()
    }
  }

  getDerivationIndex({ coinTicker, network }) {
    this.requireParams({ coinTicker, network }, 'getDerivationIndex')
    return parseInt(
      localStorage.getItem(
        `${
          this.email
        }-${coinTicker.toLowerCase()}-${network.toLowerCase()}-counter`
      ) || 0
    )
  }

  incrementWalletCounter({ coinTicker, network }) {
    this.requireParams({ coinTicker, network }, 'incrementWalletCounter')
    const storageName = `${
      this.email
    }-${coinTicker.toLowerCase()}-${network.toLowerCase()}-counter`
    const count = parseInt(localStorage.getItem(storageName) || 0)
    localStorage.setItem(storageName, count + 1)
  }

  /**
   * @param {object} params Object containing required parameters for a method
   * @param {string} method name of method invoked
   */
  requireParams(params, method) {
    Object.keys(params).forEach((param) => {
      const val = params[param]
      if (!val && isNaN(val)) {
        throw new Error(`Must provide ${param} to ${method}`)
      }
    })
  }
}
