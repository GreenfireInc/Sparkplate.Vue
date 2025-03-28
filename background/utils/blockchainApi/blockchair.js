import axiosBase from 'axios'
import moment from 'moment'
import fs from 'fs'
import path from 'path'
import BlockchainInterface from './BlockchainInterface'
// import BigNumber from 'bignumber.js'
// https://docs.ethers.org/v5/api/utils/bignumber/
import { BigNumber } from 'ethers'
const blockchairApiKey = import.meta.env.VITE_BLOCKCHAIR_API_KEY

const axios = axiosBase.create({
  baseURL: 'https://api.blockchair.com/',
  params: { key: blockchairApiKey }
})

const useStoredData = import.meta.env.VITE_USE_STORED_BLOCKCHAIR_DATA
const storedDataPath = path.join(
  process.env.DIST,
  '..',
  'tempBlockchairData.json'
)
let storedData
if (useStoredData) {
  // console.log('** blockchair.js if useStoredData - try save with fs.readFileSync useStoredData>>', useStoredData)
  try {
    storedData = fs.readFileSync(storedDataPath)
  } catch (err) {
    storedData = null
  }
}

class BlockchairInterface extends BlockchainInterface {
  constructor() {
    super('Blockchair', {
      bitcoin: 'bitcoin',
      bitcoincash: 'bitcoin-cash',
      bitcointest: 'bitcoin/testnet',
      bitcoinsv: 'bitcoin-sv',
      dash: 'dash',
      dogecoin: 'dogecoin',
      groestlcoin: 'groestlcoin',
      litecoin: 'litecoin',
      zcash: 'zcash'
    })
    this.explorers = {
      bitcoin: 'https://blockchair.com/bitcoin/transaction/',
      bitcointest: 'https://blockchair.com/bitcoin/testnet/transaction/',
      dogecoin: 'https://blockchair.com/dogecoin/transaction/',
      litecoin: 'https://blockchair.com/litecoin/transaction/'
    }
    this.cache = new DashboardSessionCache() // store dashboard address data with a timestamp
  }

  async fetchDashboardAddresses(addresses, options = {}) {
    // console.log('** blockchair fetchDashboardAddresses >>', addresses)
    // Support a single address or array of addresses
    if (typeof addresses === 'string') {
      addresses = [addresses]
    }

    // Perform request if data is stale or force option
    // is set to true or existing data isStale
    const isStale = this.cache.isDataStale(addresses, this.network)
    // console.log('** blockchair fetchDashboardAddresses isStale>>', isStale)
    if (options.force || isStale) {
      // Build initial data to add in cache for all requested addresses
      const data = {}
      addresses.forEach((address) => {
        const addressData = {
          balance: 0,
          transactions: [],
          utxos: []
        }
        data[address] = addressData
      })

      try {
        const addressesString = addresses.join(',')
        const response = storedData
          ? JSON.parse(storedData)
          : await axios.get(
              `${this.network}/dashboards/addresses/${addressesString}`,
              {
                params: { transaction_details: true }
              }
            )
        // Store data for dev environments if enabled
        if (useStoredData && !storedData)
          fs.writeFileSync(
            storedDataPath,
            JSON.stringify({ data: response.data })
          )

        // Add balance to dataset
        addresses.forEach((address) => {
          if (response.data.data.addresses[address])
            data[address].balance =
              response.data.data.addresses[address].balance
        })
        // console.log('** blockchair currentBalance >>', currentBalance.toString())
        // testing SORT by oldest to newest
        // see if this sort code needs to be refactoring appears to be working on a basic level
        const currentTransactions = response.data.data.transactions
        const sortByDate = (currentTransactions) => {
          const sorter = (a, b) => {
            return new Date(a.time).getTime() - new Date(b.time).getTime()
          }
          currentTransactions.sort(sorter)
        }
        // sortDate is currently sorting from oldest transaction to newest transaction
        sortByDate(currentTransactions)
        // end SORT test
        // moving all transactons by address into separate arrays and then processing the values so the RB tallies correctly
        const allTransactionsByAddr = this.getCurrentTransactionsByAddress(
          currentTransactions,
          addresses
        )
        // console.log('*** allTransactionsByAddr>>', allTransactionsByAddr)
        for (const transactionsByAddr of allTransactionsByAddr) {
          // console.log('******* transactions by array >>', transactionsByAddr)
          // init RB here and see if it tallies correctly
          // initialize runningBalance and calculate values, records must be from oldest to newest
          // let runningBalance = new BigNumber(0)
          let runningBalance = BigNumber.from(0)
          transactionsByAddr.forEach((tx) => {
            // console.log('** blockchair.js time from api >>' +  tx.time + ' - ' + tx.address)
            // NOTE: dateOfTransaction is not being used in code but is needed to make sure transaction records are oldest to newest
            // const dateOfTransaction = new Date(tx.time)
            // console.log('** blockchair dateOfTransaction >>', dateOfTransaction)
            const isInboundTx = tx.balance_change > 0
            const addressRole = isInboundTx ? 'destination' : 'source'
            const explorerURL = this.explorers[this.network] + tx.hash
            // adding temporary value when needed so that source and destination are always set
            // look into obtaining relevant information through additional blockchair api calls
            let addressNotSet
            if (addressRole === 'destination') {
              addressNotSet = 'source'
            } else if (addressRole === 'source') {
              addressNotSet = 'destination'
            }
            // debits come through as negative numbers need to use abs to make everything positive
            // tally for RB is done with Satoshis
            // NOTE: on rare occasions seeing scientific notation that is saved to transaction db
            // could be a conversion issue
            const amountSatConversion = Math.abs(tx.balance_change)
            const amountBN = BigNumber.from(amountSatConversion)
            // amountBN = amountBN.div(100000000)
            const runningBalanceValue = 0
            // console.log('** blockchair.js time from api >>' + ' RB : ' + runningBalance + ' : ' + dateOfTransaction + ' - ' + tx.address + ' : ' + amountBN + ' : isInboundTx ' + isInboundTx)
            if (isInboundTx) {
              // console.log('** blockchair.js INBOUND Credit >>')
              runningBalance = runningBalance.add(amountBN)
            } else {
              // console.log('** blockchair.js OUTBOUND Debit >>')
              runningBalance = runningBalance.sub(amountBN)
            }
            data[tx.address].transactions.push({
              uniqueId: tx.address + tx.hash,
              [addressRole]: tx.address,
              [addressNotSet]: '---------address-not-set---------',
              date: new Date(tx.time),
              amount: amountBN.toNumber(),
              txType: isInboundTx ? 'inbound' : 'outbound',
              activityCategory: isInboundTx
                ? 'inbound-transaction'
                : 'outbound-transaction',
              explorerURL: explorerURL,
              runningBalance: runningBalance.toNumber(),
              runningBalanceValue: runningBalanceValue.toString(),
              transactionId: tx.hash
            })
          })
        }
        // add utxos to data
        response.data.data.utxo.forEach((utxo) => {
          data[utxo.address].utxos.push(utxo)
        })
      } catch (err) {
        console.error(err.message)
      } finally {
        // add built data to cache
        this.cache.add(data, this.network)
      }
    }
  }

  getCurrentTransactionsByAddress(currentTransactions, addresses) {
    const allTransactionsByAddress = []
    addresses.forEach((addr) => {
      const txByAddr = this.getAllTransactionByAddress(
        currentTransactions,
        addr
      )
      allTransactionsByAddress.push(txByAddr)
    })
    // console.log('*** getCurrentTransactionsByAddress>>', allTransactionsByAddress)
    return allTransactionsByAddress
  }

  getAllTransactionByAddress(currentTransactions, address) {
    const transactionsByAddress = []
    currentTransactions.forEach((tx) => {
      if (address === tx.address) {
        transactionsByAddress.push(tx)
      }
    })
    return transactionsByAddress
  }

  async fetchTransactionDetails(txHashes) {
    // Support a single hash or array of hashes
    if (typeof txHashes === 'string') {
      txHashes = [txHashes]
    }

    const response = await axios.get(
      `${this.network}/dashboards/transactions/${txHashes.join(',')}`
    )
    const transactions = response.data.data
    return transactions
  }

  async getBalances({ addresses, network }) {
    this.setNetwork(network)
    await this.fetchDashboardAddresses(addresses)

    // Create balances object with addresses as keys
    const balances = {}
    addresses.forEach((address) => {
      // Add balance to balances
      const data = this.cache.get(address, this.network)
      const balance = data.balance

      balances[address] = balance
    })

    return balances
  }

  async getBulkTransactions({ addresses, network }) {
    this.setNetwork(network)
    await this.fetchDashboardAddresses(addresses)
    // Get saved address data from cache
    const txs = []
    addresses.forEach((address) => {
      const data = this.cache.get(address, this.network)
      txs.push(...data.transactions)
    })

    return txs
  }

  async getUnspentOutputs({ address, network }) {
    this.setNetwork(network)
    await this.fetchDashboardAddresses(address)
    // Get UTXO list from cache dashboard data
    const addressData = this.cache.get(address, this.network)
    const utxos = addressData.utxos
    if (!utxos.length)
      throw new Error('No unspent transactions. Cannot complete request.')

    // Request transaction details to recieve all UTXO outputs
    const utxoHashes = utxos.map((utxo) => utxo.transaction_hash)
    const utxosDetailed = await this.fetchTransactionDetails(utxoHashes)

    // Outputs will store all outputs for use in transaction
    const outputs = []
    utxos.forEach((tx) => {
      const txOutputs = utxosDetailed[tx.transaction_hash].outputs
      // Output data model is set for use with bitcore-lib
      // https://github.com/bitpay/bitcore/blob/master/packages/bitcore-lib/docs/unspentoutput.md
      txOutputs.forEach((output) => {
        if (output.recipient === tx.address && !output.is_spent) {
          outputs.push({
            address: output.recipient,
            txid: output.transaction_hash,
            vout: output.index,
            satoshis: output.value,
            script: output.script_hex
          })
        }
      })
    })

    return outputs
  }

  async sendTransaction({ network, txHash }) {
    this.setNetwork(network)
    const response = await axios.post(`${this.network}/push/transaction`, {
      data: txHash
    })

    const txid = response.data.data.transaction_hash
    return txid
  }
}

class DashboardSessionCache {
  constructor() {
    this.data = {}
  }

  add(data, network) {
    if (!this.data[network]) this.data[network] = {}
    const timestamp = moment().format()

    for (const address in data) {
      const addressData = data[address]
      this.data[network][address] = {
        balance: addressData.balance,
        transactions: addressData.transactions,
        utxos: addressData.utxos,
        timestamp
      }
    }
  }

  get(address, network) {
    if (!this.data[network]) return
    const addressData = this.data[network][address]
    return addressData
  }

  isDataStale(addresses, network) {
    // Set threshold for stale data to 120 seconds
    const staleTimestamp = moment().subtract(120, 'seconds')

    // If any addresses timestamp is before the stale data threshold return true
    let dataIsStale = false
    for (const address of addresses) {
      if (dataIsStale) break

      // If cachedData does not exist, data is stale
      const cachedData = this.get(address, network)
      if (!cachedData) {
        dataIsStale = true
        break
      }

      dataIsStale = moment(cachedData.timestamp).isBefore(staleTimestamp)
    }

    return dataIsStale
  }
}

export default BlockchairInterface
