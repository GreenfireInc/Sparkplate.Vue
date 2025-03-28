/*
 * Contributors: Aciel Ochoa
 *
 * Description: This mixin file contains methods for handling
 *   various actions relating to wallets
 */

export default {
  methods: {
    tickerWithAddress(wallet) {
      // returns string with coinTicker prepended to the wallet address
      return `${wallet.coinTicker.toLowerCase()}://${wallet.address}`
    },
    traverseWallets(wallets, callback) {
      // accepts wallets OBJECT ex: { btc: [...wallets], eth: [...wallets] }
      // callback is executed on each wallet found
      for (const coinTicker in wallets) {
        wallets[coinTicker].forEach((wallet) => {
          callback(wallet)
        })
      }
    },
    formatDropdownWallet(wallet) {
      const coinTicker = wallet.coinTicker
      const walletName = wallet.nickname || this.tickerWithAddress(wallet)
      const balanceFormatted = this.formatNum(wallet.balance, 6)
      const value = this.currencyToGlobalValue(wallet.balance, coinTicker)
      const valueFormatted = this.formatCurrencyWithSettings(value, 3)

      return `${walletName} (${balanceFormatted} ${coinTicker.toUpperCase()} | ${valueFormatted})`
    }
  }
}
