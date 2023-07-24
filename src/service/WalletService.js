import { idbCon } from './IdbService'

export class WalletService {
  constructor() {
    this.tableName = 'wallets'
  }

  getWallets(id) {
    return idbCon.select({
      from: this.tableName,
      where: {
        userId: id
      }
    })
  }

  getWalletBy(identifier) {
    return idbCon.select({
      from: this.tableName,
      where: identifier
    })
  }

  removeWallets(id) {
    return idbCon.remove({
      from: this.tableName,
      where: {
        id: id
      }
    })
  }

  addWallet(wallet) {
    return idbCon.insert({
      into: this.tableName,
      values: [wallet],
      return: true
    })
  }

  updateWallet(wallet) {
    return idbCon.update({
      in: this.tableName,
      set: {
        ...wallet
      },
      where: {
        id: wallet.id
      }
    })
  }

  updateNickname(id, nickname) {
    return idbCon.update({
      in: this.tableName,
      set: {
        nickname
      },
      where: {
        id
      }
    })
  }
}
