import axios from 'axios'
import BlockchainInterface from './BlockchainInterface'
import BigNumber from 'bignumber.js'
BigNumber.config({ DECIMAL_PLACES: 5 })
// https://mikemcl.github.io/bignumber.js/#rounding-mode
BigNumber.config({ ROUNDING_MODE: 0 })

/**
 * TzstatsInterface
 * example Explorer URL for ghostnet:
 * https://ghostnet.tzkt.io/oofD71LzfPSXnu6ip6sqLgKnxbpWrKQQJo8p1jehHCDbE2XZo4N/15073033
 * This site has a drop down for Mainnet, Limanet and Ghostnet
 *  Ghostnet example: https://ghost.tzstats.com/oofD71LzfPSXnu6ip6sqLgKnxbpWrKQQJo8p1jehHCDbE2XZo4N
 *  Mainnet Base URL (test on mainnet): https://tzstats.com/
 */
class TzstatsInterface extends BlockchainInterface {
  constructor() {
    super('Tzstats', {
      mainnet: 'https://api.tzstats.com/',
      ghostnet: 'https://api.ghost.tzstats.com/',
      kathmandunet: 'https://api.kathmandunet.tzstats.com/',
      explorers: {
        mainnet: 'https://tzstats.com/',
        ghostnet: 'https://ghost.tzstats.com/'
      }
    })
    this.explorers = {
      mainnet: 'https://tzstats.com/',
      ghostnet: 'https://ghost.tzstats.com/'
    }
  }

  getExplorerURL(network) {
    return this.explorers[network]
  }

  /**
   * getTransactionData - set base network url and get transaction data
   * @param {*} network
   * @param {*} wallet
   * @returns allTransactions
   */
  async getTransactionData(network, wallet) {
    this.setNetwork(network)
    const url =
      this.network +
      'explorer/account/' +
      wallet.address +
      '/operations?order=desc'
    const response = await axios.get(url)
    if (response.statusText !== 'OK') {
      throw new Error(response)
    }
    const transactionHistory = response.data
    const sortByDate = (transactionHistory) => {
      const sorter = (a, b) => {
        return new Date(a.time).getTime() - new Date(b.time).getTime()
      }
      transactionHistory.sort(sorter)
    }
    // sortDate is currently sorting from oldest transaction to newest transaction
    sortByDate(transactionHistory)
    // console.log('** tzstatsInterface.js getTransactionData transactionHistory >>', transactionHistory)
    if (transactionHistory.length > 0) {
      // NOTE: Need to map data points coming off API with column names in JSStore transactions table
      const allTransactions = this.mapDataPoints(
        transactionHistory,
        network,
        wallet
      )
      return allTransactions
    }
  }

  /**
   * mapDataPoints - async should not be needed, remove
   * @param {*} transactionHistory
   * @param {*} wallet
   * @returns allTransactions
   */
  mapDataPoints(transactionHistory, network, wallet) {
    const allTransactions = [] // parent array that stores all transactions
    // set and maintain runningBalance through map and see if sums can work backwards through saved API data
    // console.log('** tzstatsInterface mapDataPoints wallet.balance >>', wallet.balance)
    // NOTE: look into utilizing currentBalance for checking that RB is tallied correctly
    // BigNumber is rounding up aggresively and have tried to use config in alchemy interface to prevent it but it does not work
    // Also fees may not be deducting properly for all transactions
    // const currentBalance = new BigNumber(wallet.balance)
    // console.log('** tzstatsInterface currentBalance >>', currentBalance.toString())
    let runningBalance = new BigNumber(0)
    transactionHistory.map((txs) => {
      const tzStatsAPIType = txs.type
      // reveal may be passed as type so make sure type is set to transaction
      if (tzStatsAPIType === 'transaction') {
        // init transaction array that will hold batch transactions for insertion into db
        let transactionArr = []
        const activityCategory = this.setActivityCategory(
          wallet,
          txs.receiver,
          txs.sender
        )
        const sender = txs.sender
        const receiver = txs.receiver
        // convert to float
        const valueFloat = parseFloat(txs.volume)
        const valueFloatBN = new BigNumber(valueFloat)
        // const value = txs.volume
        // console.log('** tzstatsInterface valueFloat >>', valueFloat)
        // console.log('** tzstatsInterface activityCategory >>', activityCategory)
        // NOTE: setting txType to activityCategory for now, see if this can linked up to the Global Tab drop down menu
        const txType = activityCategory
        const transTime = new Date(txs.time)
        // setting uniqueId to the hash id for linking to explorer transactions
        // also prepending wallet address so id is unique by address, outbound and inbound transactions may have duplicate ids
        const uniqueId = wallet.address + txs.id.toString()
        const baseExplorerURL = this.getExplorerURL(network)
        const explorerURL = baseExplorerURL + txs.hash.toString()
        const transactionId = txs.hash.toString()
        // console.log('** tzstatsInterface addr >>' + wallet.address + ' : ' + transTime + ' : ' + valueFloat)
        if (
          sender.toLowerCase() === wallet.address.toLowerCase() &&
          activityCategory === 'outbound-transaction'
        ) {
          // console.log('** tzstatsInterface outbound >>', activityCategory)
          runningBalance = runningBalance.minus(valueFloatBN)
        } else if (
          receiver.toLowerCase() === wallet.address.toLowerCase() &&
          activityCategory === 'inbound-transaction'
        ) {
          // console.log('** tzstatsInterface inbound >>', activityCategory)
          runningBalance = runningBalance.plus(valueFloatBN)
        }
        // running balance value needs to be computed with the Global Currency selected by User
        // test calculating the running balance value on the front code first, may need to calculate it here later
        // setting runningBalanceValue to 0 for now, jsstore sets default 0 also
        const runningBalanceValue = 0
        transactionArr = {
          uniqueId: uniqueId,
          source: sender,
          destination: receiver,
          amount: valueFloat,
          txType: txType, // setting as sochain to provide label, user can set label
          date: transTime,
          transactionId: transactionId,
          explorerURL: explorerURL,
          runningBalance: runningBalance.toString(),
          runningBalanceValue: runningBalanceValue.toString(),
          activityCategory: activityCategory
        }
        allTransactions.push(transactionArr)
      }
    })
    return allTransactions
  }

  /**
   * setActivityCategory - set inbound or outbound transaction based on to and from in API
   * @param {*} wallet
   * @param {*} to
   * @param {*} from
   * @returns activityCategory
   */
  setActivityCategory(wallet, to, from) {
    let activityCategory
    // setting both to lower case otherwise no match
    if (wallet.address.toLowerCase() === from.toLowerCase()) {
      activityCategory = 'outbound-transaction'
    } else if (wallet.address.toLowerCase() === to.toLowerCase()) {
      activityCategory = 'inbound-transaction'
    } else {
      // trap and set default if need be for activityCategory
      activityCategory = 'NA'
    }
    return activityCategory
  }
}

export default TzstatsInterface
