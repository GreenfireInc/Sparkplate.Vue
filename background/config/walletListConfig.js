const walletList = () => {
  const config = {
    walletList: {
      bat: {
        coinType: 'token',
        platform: {
          blockchain: 'eth',
          network: 'homestead'
        }
      },
      btc: {
        default: true, // Will be visible to new users as default
        coinType: 'altcoin',
        mainnet: 'BTC',
        testnets: ['BTCTEST']
      },
      dai: {
        coinType: 'token',
        platform: {
          blockchain: 'eth',
          network: 'homestead'
        }
      },
      doge: {
        default: import.meta.env.MODE !== 'developement',
        coinType: 'altcoin',
        mainnet: 'DOGE',
        testnets: ['DOGETEST']
      },
      eth: {
        default: true,
        coinType: 'altcoin',
        mainnet: 'homestead',
        testnets: ['goerli', 'sepolia']
      },
      euroc: {
        coinType: 'token',
        platform: {
          blockchain: 'eth',
          network: process.env.VITE_EUROC_TESTNET || 'homestead'
        }
      },
      gusd: {
        coinType: 'token',
        platform: {
          blockchain: 'eth',
          network: 'homestead'
        }
      },
      ltc: {
        default: import.meta.env.MODE !== 'developement',
        coinType: 'altcoin',
        mainnet: 'LTC',
        testnets: ['LTCTEST']
      },
      link: {
        coinType: 'token',
        platform: {
          blockchain: 'eth',
          network: 'homestead'
        }
      },
      matic: {
        coinType: 'token',
        platform: {
          blockchain: 'eth',
          network: 'homestead'
        }
      },
      tusd: {
        coinType: 'token',
        platform: {
          blockchain: 'eth',
          network: 'homestead'
        }
      },
      usdt: {
        coinType: 'token',
        platform: {
          blockchain: 'eth',
          network: 'homestead'
        }
      },
      usdc: {
        coinType: 'token',
        platform: {
          blockchain: 'eth',
          network: process.env.VITE_USDC_TESTNET || 'homestead' // testnet contract deployed on Goerli
        }
      },
      xtz: {
        coinType: 'altcoin',
        mainnet: 'mainnet',
        testnets: ['kathmandunet', 'jakartanet']
      }
    }
  }

  return config
}

export default walletList()
