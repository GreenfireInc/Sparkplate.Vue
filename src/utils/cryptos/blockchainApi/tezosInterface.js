import BlockchainInterface from './BlockchainInterface'
import { TezosToolkit } from '@taquito/taquito'
import { RpcClient } from '@taquito/rpc'
import { InMemorySigner } from '@taquito/signer'
import { utils } from 'ethers'
class TezosInterface extends BlockchainInterface {
  constructor() {
    super('ECAD Labs', {
      mainnet: 'https://mainnet.api.tez.ie',
      ghostnet: 'https://ghostnet.ecadinfra.com',
      jakartanet: 'https://jakartanet.ecadinfra.com',
      mumbainet: 'https://mumbainet.ecadinfra.com',
      ithacanet: 'https://ithacanet.ecadinfra.com'
    })
  }

  getInstance(network = 'mainnet') {
    this.setNetwork(network)
    return new TezosToolkit(this.network)
  }

  async getBalance({ address, network }) {
    const client = this.getInstance(network)
    const balance = await client.tz.getBalance(address)
    return utils.formatUnits(balance.toFixed(), 6)
  }

  async getSigner(privateKey) {
    const signer = await InMemorySigner.fromSecretKey(privateKey)
    return signer
  }

  getRpcClient(network) {
    this.setNetwork(network)
    const client = new RpcClient(this.network)
    return client
  }
}

export default new TezosInterface()
