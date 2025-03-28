import axios from 'axios'
import BlockchainInterface from './BlockchainInterface'
import BigNumber from 'bignumber.js'
const alchemyApiKey = import.meta.env.VITE_ALCHEMY_API_KEY
// testing BigNumber use config or set?
// BigNumber.config({ DECIMAL_PLACES: 5 })
// BigNumber.set({ DECIMAL_PLACES: 5 })
// https://mikemcl.github.io/bignumber.js/#rounding-mode
// BigNumber.config({ ROUNDING_MODE: 0 })
// BigNumber.set({ ROUNDING_MODE: BigNumber.ROUND_UP })    // equivalent

/**
 * AlchemyInterface
 * Need To And From Wallet Address Calls (Sent and Received)
 * Also make sure metadata is set so that timestamp comes back in the response
 * Use Alchemy Composer : https://dashboard.alchemy.com/composer
 * Explorer URLS:
 * https://goerli.etherscan.io/tx/0x98ff0e97935bcaa69ef0b9653abf80147ea8bc02535676fe51d6a198f674c6b6
 * NOTE: Explorer URLS have a tx call appended to the base url for transactions
 *
 */
class AlchemyInterface extends BlockchainInterface {
  constructor() {
    super('AlchemyAPI', {
      homestead: 'https://eth-mainnet.g.alchemy.com/',
      goerli: 'https://eth-goerli.g.alchemy.com/'
    })
    this.explorers = {
      homestead: 'https://etherscan.io/tx/',
      goerli: 'https://goerli.etherscan.io/tx/'
    }
  }

  getExplorerURL(network) {
    return this.explorers[network]
  }

  /**
   * set Alchemy API base URL and get both sender and receiver transaction history
   * in separate API calls
   * @param {*} network
   * @param {*} wallet
   * @returns allTransactions
   */
  async getTransactionData(network, wallet) {
    // console.log('** alchemyInterface getTransaction wallet.address>>', wallet.address)
    // console.log('** alchemyInterface getTransaction wallet.balance>>', wallet.balance)
    this.setNetwork(network)
    // NOTE: this function should be executing on a per wallet address and when from and to transactons get merged then all transactions
    // must be sorted properly by datetime, so look into sorting function here before calling setRunningBalance
    const senderTransactions = await this.getTransactionsByType(
      'from',
      network,
      wallet
    )
    const receiverTransactions = await this.getTransactionsByType(
      'to',
      network,
      wallet
    )
    const allTransactions = senderTransactions.concat(receiverTransactions)
    const sortByDate = (allTransactions) => {
      const sorter = (a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      }
      allTransactions.sort(sorter)
    }
    // sortDate is currently sorting from oldest transaction to newest transaction
    sortByDate(allTransactions)
    // Calculating Running Balance from 0, so building balance up from what should be the full transaction history for that address
    // leaving reverse call here for testing purposes but all transaction records by address should be ordered from oldest to newest
    // allTransactions.reverse()
    const allTransactionsRB = await this.setRunningBalance(
      allTransactions,
      network,
      wallet
    )
    // return allTransactions
    return allTransactionsRB
  }

  /**
   * setRunningBalance - after outbound and inbound transactions have been merged this function goes through the array data and sets the runningBalance value
   * @param {*} allTransactions
   * @param {*} network
   * @param {*} wallet
   * @returns allTransactionsWithRB
   */
  async setRunningBalance(allTransactions, network, wallet) {
    const allTransactionsWithRB = []
    if (allTransactions.length) {
      const allRB = await this.processAllRunningBalancesByAddress(
        allTransactions,
        network,
        wallet
      )
      for (let tx of allTransactions) {
        let rb
        // issues with calling await async function getRunningBalanceById here so looping through data inside this function
        // find a better more effecient way to loop through data and set RB by uniqueId
        for (const arrKey in allRB) {
          Object.entries(allRB[arrKey]).forEach(([key]) => {
            // console.log('** alchemyInterface getTransaction setRunningBalance KEY>>' + allRB[arrKey][key] + ' : passed uniqueID:' + tx.uniqueId)
            if (allRB[arrKey][key] === tx.uniqueId) {
              // console.log('** alchemyInterface getTransaction setRunningBalance KEY FOUND!>>', allRB[arrKey][key])
              rb = allRB[arrKey].runningBalance.toString()
              // console.log('** alchemyInterface getTransaction setRunningBalance rb!>>', rb)
            }
          })
        }
        tx = {
          ...tx,
          runningBalance: rb
        }
        // console.log('** alchemyInterface.js getTransaction tx>>', tx)
        allTransactionsWithRB.push(tx)
      }
      return allTransactionsWithRB
    }
    // console.log('** alchemyInterface getTransaction allTransactionWithRB>>', allTransactionsWithRB)
  }

  /**
   * getTransactionsByType - Alchemy API has to do separate sender and receiver transaction history API calls
   * @param {*} type
   * @param {*} wallet
   * @returns transactionHistory
   */
  async getTransactionsByType(type, network, wallet) {
    const payload = this.getPayloadByType(type, wallet)
    var requestOptions = {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      payload: payload
    }
    // NOTE: apiKey comes in with env config
    const apiKey = alchemyApiKey
    const apiURL = this.network + 'v2/' + apiKey
    const response = await axios.post(apiURL, payload, requestOptions.headers)
    // Keep in mind issues with forEach loops and the async await calls that are occuring between the Vue and IPC Bridge
    // object can not be cloned :: https://stackoverflow.com/questions/65933253/how-can-i-fix-ipc-error-error-invoking-remote-method-an-object-could-not-be-cl
    const { status, data } = response
    if (status === 200) {
      const transactionHistory = this.mapDataPoints(data, network, wallet)
      return transactionHistory
    }
  }

  /**
   * mapDataPoints - data points from Alchemy are mapped to the relevant column names in the JSStore
   * transaction table
   * @param {*} data
   * @param {*} wallet
   * @returns
   */
  mapDataPoints(data, network, wallet) {
    const allTransactions = [] // parent array that stores all transactions
    if (data.result.transfers.length > 0) {
      data.result.transfers.map((txs) => {
        let transactionArr = []
        const activityCategory = this.setActivityCategory(wallet, txs)
        let ethTxType
        // is ethTxType needed? already have activityCategory
        if (activityCategory === 'outbound-transaction') {
          ethTxType = 'outbound'
        } else if (activityCategory === 'inbound-transaction') {
          ethTxType = 'inbound'
        }
        const blockTimestamp = txs.metadata.blockTimestamp
        // basic conversion for UTC String to DateTime, JSStore will not save UTC String
        // NOTE: As a temporary solution that will prevent duplicate transactions into the database, see if
        // transaction time can be checked for in the database and then do not add transaction
        const transactionTime = new Date(blockTimestamp)
        // console.log('** alchemyInterface mapDataPoints rb transactionTime>>', transactionTime)
        const amountFloat = parseFloat(txs.value)
        // There are duplicate uniqueIds for outbound and inbound transactions
        // so prepending wallet address to uniqueId for now may update this
        const uniqueId = wallet.address + txs.uniqueId.toString()
        const baseExplorerURL = this.getExplorerURL(network)
        const explorerURL = baseExplorerURL + txs.hash.toString()
        const transactionId = txs.hash.toString()
        // running balance value needs to be computed with the Global Currency selected by User
        // setting runningBalanceValue to 0 for now, jsstore sets default 0 also - calculate value on front end
        const runningBalanceValue = 0
        // NOTE: note has been removed and should no longer be required, was setting it here as a test
        // a user can add notes after the transaction history has been pulled down
        transactionArr = {
          uniqueId: uniqueId,
          source: txs.from,
          destination: txs.to,
          amount: amountFloat,
          txType: ethTxType,
          date: transactionTime,
          transactionId: transactionId,
          explorerURL: explorerURL,
          // runningBalance: runningBalance.toString(),
          runningBalanceValue: runningBalanceValue.toString(),
          activityCategory: activityCategory
        }
        // push ETH on to transaction array, watch loop
        allTransactions.push(transactionArr)
      })
    }
    return allTransactions
  }

  /**
   * Merged data from outbound and inbound ETH transactions is passed into this function so Running Balance can be calculated in isolation
   * within the mapping function below.  RB values are then set into the returned data based on the uniqueId for the transaction
   * NOTE: See if this function can be setup as a class method that all platforms use to tally running balance values
   * @param {*} data
   * @param {*} network
   * @param {*} wallet
   * @returns
   */
  async processAllRunningBalancesByAddress(data, network, wallet) {
    // NOTE: Need to do the following checks and only process transactions that meet this criteria
    // If Wallet Address is set to Source then activityCategory has to be set to outbound-transaction
    // If Wallet address equals destination then activityCategory must equal inbound-transaction
    // That should be the only transactions to process but may need more conditionals
    // These conditionals are being set in /src/store/index.js for fetchTransactionsByAddress (Dash > Wallet > Transaction History)
    // so this function needs to match them, also the query for JournalEntries Transaction History will need to be modified to reflect these changes
    // see TransactionService.js getTransactions method and query, may be able to do a WHERE CLAUSE on source and activityCategory OR destiantion and activityCategory
    // NOTE: need to keep in mind that ethereum alchemy addresses are not in sync in regards to case sensitivity (some letters are lowercase and others are uppercase)
    // the ETH wallet addresses should be the correct case sensitive characters so Alchemy addresses are not in sync
    // console.log('** alchemyInterface.js processAllRunningBalancesByAddress runningBalance TOP data>>', data)
    // Alchemy API does separate outbound and inbound transaction calls so trying allTransactions
    // NOTE: look into utilizing currentBalance for checking that RB is tallied correctly
    // BigNumber is rounding up aggresively and have tried to use config in alchemy interface to prevent it but it does not work
    // Also fees may not be deducting properly for all transactions
    // const currentBalance = new BigNumber(wallet.balance)
    // try calculating balance from zero and see if it matches currentBalance
    let runningBalance = new BigNumber(0)
    const allRB = []
    // console.log('** alchemyInterface.js processAllRunningBalancesByAddress runningBalance BEFORE map loop >>', runningBalance.toString())
    if (data.length > 0) {
      // console.log('** alchemyInterface.js processAllRunningBalancesByAddress data set **>>')
      data.map((txs) => {
        // console.log('** alchemyInterface.js processAllRunningBalancesByAddress txs>>', txs)
        // console.log('** alchemyInterface.js processAllRunningBalancesByAddress runningBalance INSIDE map loop AT TOP >>', runningBalance.toString())
        const uniqueId = txs.uniqueId.toString()
        const amountFloat = parseFloat(txs.amount)
        const amountFloatBN = new BigNumber(amountFloat)
        // console.log('** alchemyInterface.js processAllRunningBalancesByAddress amountFloatBN>>', amountFloatBN.toString())
        // try doing source and destination checks with activityCategory here
        if (
          txs.source.toLowerCase() === wallet.address.toLowerCase() &&
          txs.activityCategory === 'outbound-transaction'
        ) {
          // console.log('** alchemyInterface.js processAllRunningBalancesByAddress OUTBOUND **>> rb>>' + runningBalance.toString() + ' : addr > ' + wallet.address + ' : ' + txs.date + ' : ' + amountFloatBN.toString())
          runningBalance = runningBalance.minus(amountFloatBN)
        } else if (
          txs.destination.toLowerCase() === wallet.address.toLowerCase() &&
          txs.activityCategory === 'inbound-transaction'
        ) {
          // console.log('** alchemyInterface.js processAllRunningBalancesByAddress INBOUND **>> rb>>' + runningBalance.toString() + ' : addr > ' + wallet.address + ' : ' + txs.date + ' : ' + amountFloatBN.toString())
          runningBalance = runningBalance.plus(amountFloatBN)
        }
        // NOTE: Running Balance must be stored as a string - converts from BigNumber to string when getting saved to DB
        const rbByKey = {
          uniqueId: uniqueId,
          runningBalance: runningBalance.toString()
        }
        allRB.push(rbByKey)
        // console.log('** alchemyInterface.js processAllRunningBalancesByAddress runningBalance INSIDE map loop AT BOTTOM >>', runningBalance.toString())
      })
    }
    return allRB
  }

  /**
   * getPayloadByType - If type is from or sender then create that payload,
   * if type is to or receiver then create a receiver payload
   * @param {*} type
   * @param {*} wallet
   * @returns payload
   */
  getPayloadByType(type, wallet) {
    let payload
    if (!type || !wallet.address)
      throw new Error('Argument error for getPayloadByType')
    if (type === 'from') {
      payload = JSON.stringify({
        jsonrpc: '2.0',
        id: 0,
        method: 'alchemy_getAssetTransfers',
        params: [
          {
            fromBlock: '0x0',
            fromAddress: wallet.address,
            excludeZeroValue: true,
            withMetadata: true,
            category: ['external', 'internal', 'erc20', 'erc1155', 'specialnft']
          }
        ]
      })
    } else if (type === 'to') {
      payload = JSON.stringify({
        jsonrpc: '2.0',
        id: 0,
        method: 'alchemy_getAssetTransfers',
        params: [
          {
            fromBlock: '0x0',
            toAddress: wallet.address,
            excludeZeroValue: true,
            withMetadata: true,
            category: ['external', 'internal', 'erc20', 'erc1155', 'specialnft']
          }
        ]
      })
    }
    return payload
  }

  /**
   * setActivityCategory - set activityCategory by wallet address and transaction to determine
   * if the transaction is outbound (sender) or inbound (receiver)
   * @param {*} wallet
   * @param {*} txs
   * @returns
   */
  setActivityCategory(wallet, txs) {
    let activityCategory
    if (!wallet || !txs)
      throw new Error('Argument error for setActivityCategory')
    // setting both to lower case otherwise no match
    if (wallet.address.toLowerCase() === txs.from.toLowerCase()) {
      activityCategory = 'outbound-transaction'
    } else if (wallet.address.toLowerCase() === txs.to.toLowerCase()) {
      activityCategory = 'inbound-transaction'
    } else {
      // may want to return null, throwing error for now
      throw new Error('Could not determine activity category.')
    }
    return activityCategory
  }
}

export default AlchemyInterface
