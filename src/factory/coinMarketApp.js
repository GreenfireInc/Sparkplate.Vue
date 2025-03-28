import config from '../config/currencyConfig'
const coinMarketApiKey = import.meta.env.VITE_COINMARKET_API_KEY

const options = {
  headers: {
    'X-CMC_PRO_API_KEY': coinMarketApiKey
  },
  json: true,
  gzip: true
}

const url = (path) => `https://pro-api.coinmarketcap.com/v1/${path}`

export const getCoinsMeta = () =>
  new Promise((resolve, reject) => {
    window.axios
      .get(
        url(`cryptocurrency/info?symbol=${config.coinsList.join(',')}`),
        options
      )
      .then(({ data }) => {
        if (data) resolve(data)
      })
      .catch((err) => reject(err))
  })

export const getCoinsData = (currency = 'USD') =>
  new Promise((resolve, reject) => {
    window.axios
      .get(
        url(
          `cryptocurrency/quotes/latest?symbol=${config.coinsList.join(
            ','
          )}&convert=${currency}`
        ),
        options
      )
      .then(({ data }) => {
        if (data) resolve(data)
      })
      .catch((err) => reject(err))
  })

export const getTotalMarketCap = (currency) =>
  new Promise((resolve, reject) => {
    window.axios
      .get(url(`global-metrics/quotes/latest?convert=${currency}`), options)
      .then(({ data }) => {
        if (data) resolve(data)
      })
      .catch((err) => reject(err))
  })

export const priceConversions = async (payload) => {
  const params = {
    amount: payload.amount,
    symbol: payload.symbol,
    convert: payload.convert ? payload.convert : 'USD'
  }
  try {
    const res = await window.axios.get(
      url(
        `tools/price-conversion?amount=${params.amount}&symbol=${params.symbol}&convert=${params.convert}`
      ),
      options
    )
    return res.data.quote
  } catch (error) {
    console.error(error)
  }
}
