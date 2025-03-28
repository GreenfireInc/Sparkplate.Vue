import { eth } from '@/utils/cryptos'

export {
  getCoinsMeta,
  getCoinsData,
  getTotalMarketCap,
  priceConversions
} from './coinMarketApp'

export { getGasPrices } from './gasStation'

export const getEthTxFee = eth.txFee
