const getWalletList = () => {
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
        mainnet: 'bitcoin',
        testnets: ['bitcointest']
      },
      dai: {
        coinType: 'token',
        platform: {
          blockchain: 'eth',
          network: 'homestead'
        }
      },
      doge: {
        default: import.meta.env.PROD,
        coinType: 'altcoin',
        mainnet: 'dogecoin',
        testnets: []
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
          network: import.meta.env.VITE_EUROC_TESTNET || 'homestead'
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
        default: import.meta.env.PROD,
        coinType: 'altcoin',
        mainnet: 'litecoin',
        testnets: []
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
          network: import.meta.VITE_USDC_TESTNET || 'homestead' // testnet contract deployed on Goerli
        }
      },
      xtz: {
        coinType: 'altcoin',
        mainnet: 'mainnet',
        testnets: ['ghostnet', 'kathmandunet', 'mumbainet', 'jakartanet']
      }
    }
  }

  return config
}

export const walletList = getWalletList().walletList
export default getWalletList()
