import { Changelly } from 'changelly-js'
const changellyApiKey = import.meta.env.VITE_CHANGELLY_API_KEY
const changellyApiSecret = import.meta.env.VITE_CHANGELLY_API_SECRET
const changelly = new Changelly(changellyApiKey, changellyApiSecret)

/**
 * gets min amount allowed for exchance between two currencies
 * @param {string} from source Currency
 * @param {string} to destination currency
 */
export const getQuote = async (from, to) => {
  const quote = await changelly.getMinAmount(from.currency, to.currency)
  console.log('changelly.js:: getQuote() => ', { quote })
  return quote
}

/**
 * create Transaction address and send crypto to that address
 * @param {string} from source Currency
 * @param {string} to destination currency
 */
export const createTransaction = async (from, to, amount) => {
  const tx = await changelly.createTransaction(
    from.currency,
    to.currency,
    to.address,
    amount
  )
  console.log('changelly.js:: createTransaction() => ', { tx })
  return tx
}

/**
 * get exchange rates between cryptos
 * @param {string} from source Currency
 * @param {string} to destination currency
 * @param {float} amount amount to exchange
 */
export const getExchangeRates = async (from, to, amount) => {
  const pairs = [{ from: from.currency, to: to.currency, amount: amount }]
  const rates = await changelly.getExchangeAmount(pairs)
  console.log('changelly.js:: getExchangeRates() => ', { rates })
  return rates
}
