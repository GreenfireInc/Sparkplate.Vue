# Sparkplate.Vue

Sparkplate features base components and methods for interfacing with various APIs. Built in is a test page for resolving human readable domains to crypto addresses.

### Get Started

```
npm install
npm run dev
```

Most APIs will need keys, secrets, and/or ids to perform as expected. Use the table below as a reference to get and setup your api keys with a `.env` file.

| Service                                                                                                                | Description | Env Variable Name                |
| ---------------------------------------------------------------------------------------------------------------------- | ----------- | -------------------------------- |
| [Alchemy](https://www.alchemy.com/transfers-api) (Used for ETH transaction history)                                    | API Key     | `VITE_ALCHEMY_API_KEY`           |
| [Blockchair](https://blockchair.com/api) (Used for BTC, DOGE, LTC integration)                                         | API Key     | `VITE_BLOCKCHAIR_API_KEY`        |
| [Coin Market Cap](https://coinmarketcap.com/api/) (Used for realtime market info)                                      | API Key     | `VITE_COINMARKET_API_KEY`        |
| [Changelly](https://changelly.com/api-for-partners/exchange-api) (Used for exchanging cryptocurrencies)                | API Key     | `VITE_CHANGELLY_API_KEY`         |
| [Changelly](https://changelly.com/api-for-partners/exchange-api) (Used for exchanging cryptocurrencies)                | API Secret  | `VITE_CHANGELLY_API_SECRET`      |
| [Infura](https://www.infura.io/) (Used for ETH integration)                                                            | Project ID  | `VITE_INFURA_PROJECT_ID`         |
| [Wallet Connect](https://docs.walletconnect.com/2.0/web/web3wallet/installation) (Connect with dApps as a web3 wallet) | Project ID  | `VITE_WALLET_CONNECT_PROJECT_ID` |
| [Wert](https://docs.wert.io/docs) (Purchase crypto using the Wert widget)                                              | Partner ID  | `VITE_WERT_PARTNER_ID`           |
| [Wert](https://docs.wert.io/docs) (Purchase crypto using the Wert widget)                                              | Origin URL  | `VITE_WERT_ORIGIN`               |
