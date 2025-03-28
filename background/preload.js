import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('authenticator', {
  check: (token, secret) => {
    return ipcRenderer.invoke('otpCheck', { token, secret })
  },
  generateSecret: () => {
    return ipcRenderer.invoke('otpGenerateSecret')
  },
  keyuri: (email, service, secret) => {
    return ipcRenderer.invoke('otpKeyURI', { email, service, secret })
  }
})

// implementing axios through bridge
contextBridge.exposeInMainWorld('axios', {
  // for Coin Market Cap calls and similar arguments
  get: (url, options) => {
    return ipcRenderer.invoke('axiosGet', url, options)
  },
  post: (url, data, options) => {
    return ipcRenderer.invoke('axiosPost', url, data, options)
  }
})

// ipcRenderer API bridge
contextBridge.exposeInMainWorld('ipcRenderer', {
  invoke: (channel, data) => {
    return ipcRenderer.invoke(channel, data)
  },
  send: (channel, data) => {
    ipcRenderer.send(channel, data)
  },
  once: (channel, func) => {
    ipcRenderer.once(channel, (_, ...args) => func(args))
  },
  on: (channel, func) => {
    ipcRenderer.on(channel, (_, ...args) => func(...args))
  }
})

// Application API bridge
contextBridge.exposeInMainWorld('app', {
  electronVersion: process.versions.electron,
  getFunctional: () => {
    return ipcRenderer.invoke('appGetFunctional')
  },
  getGPUInfo: () => {
    return ipcRenderer.invoke('appGetGPUInfo')
  },
  getPath: (type) => ipcRenderer.invoke('appGetPath', type),
  getPreloadData: () => {
    return ipcRenderer.invoke('preloadAppData')
  },
  getReleaseInfo: () => {
    return ipcRenderer.invoke('appGetReleaseInfo')
  },
  nodeVersion: process.version,
  openExternal: (url) => {
    ipcRenderer.send('appOpenExternal', url)
  },
  platform: process.platform
})

// Dialog API bridge
contextBridge.exposeInMainWorld('dialog', {
  showMessageBox: (options) => {
    return ipcRenderer.invoke('dialogShowMessageBox', options)
  },
  showOpenDialog: (options) => {
    return ipcRenderer.invoke('dialogShowOpenDialog', options)
  },
  showErrorBox: (title, message) => {
    ipcRenderer.send('dialogShowErrorBox', { title, message })
  },
  showSaveDialog: (options) => {
    return ipcRenderer.invoke('dialogShowSaveDialog', options)
  }
})

// fs API bridge
contextBridge.exposeInMainWorld('fs', {
  readFile: async (path, callback) => {
    // fsReadFile will return an object with { err, data } to be passed into callback
    const { err, data } = await ipcRenderer.invoke('fsReadFile', path)
    callback(err, data)
  },
  readFileSync: async (path, encoding) => {
    const data = await ipcRenderer.invoke('fsReadFileSync', path, encoding)
    return data
  },
  write: async (fd, buffer, callback) => {
    try {
      const data = await ipcRenderer.invoke('fsWrite', fd, buffer)
      callback(null, data)
    } catch (err) {
      callback(err)
    }
  },
  writeFile: async (file, data, options, callback) => {
    // options is an optional parameter
    // callback can be passed as the third or fourth parameter
    if (!callback) {
      callback = options
      options = null
    }

    // fsWriteFile will return an error, if any, to be passed into callback
    const err = await ipcRenderer.invoke('fsWriteFile', file, data, options)
    callback(err)
  },
  writeFileSync: (file, data, options) => {
    return ipcRenderer.invoke('fsWriteFileSync', file, data, options)
  },
  createWriteStream: (path) => {
    return ipcRenderer.invoke('fsCreateWriteStream', path)
  },
  checkFileExists: async (path) => {
    const exists = await ipcRenderer.invoke('fsCheckFileExists', path)
    return exists
  }
})

// BrowserWindow API bridge
contextBridge.exposeInMainWorld('browserWindow', {
  createWindowForPDF: async (html, fileName, options, callback) => {
    try {
      const result = await ipcRenderer.invoke(
        'createWindowForPDF',
        html,
        fileName,
        options
      )
      if (callback) callback(null, result)
    } catch (err) {
      callback(err)
    }
  }
})

contextBridge.exposeInMainWorld('notification', {
  newNotification: (options) => {
    ipcRenderer.send('createNotification', options)
  }
})

// Archiver API bridge
contextBridge.exposeInMainWorld('archiver', {
  create: (format, options) => {
    return ipcRenderer.invoke('createArchive', format, options)
  }
})

// Geoip API bridge
contextBridge.exposeInMainWorld('geoip', {
  lookup: (ip) => {
    return ipcRenderer.invoke('geoipLookup', ip)
  }
})

// Cryptos API
contextBridge.exposeInMainWorld('cryptos', {
  generateMnemonic: (phrase) => {
    return ipcRenderer.invoke('generateMnemonic', phrase)
  },
  generateWallet: ({ seed, coinTicker, network, derivationIndex }) => {
    // generate hd wallet for all cryptos
    return ipcRenderer.invoke('cryptosGenerateWallet', {
      seed,
      coinTicker,
      network,
      derivationIndex
    })
  },
  generateBasicWallet: async ({ coinTicker, network }) => {
    // generate throwaway wallets for all cyrptos
    const wallet = await ipcRenderer.invoke('cryptosGenerateBasicWallet', {
      coinTicker,
      network
    })
    return { balance: 0, ...wallet }
  },
  importWallet: async ({ coinTicker, wif, privateKey, network }) => {
    // import a wallet from privateKey/wif for all cryptos
    const wallet = await ipcRenderer.invoke('cryptosImportWallet', {
      coinTicker,
      wif,
      privateKey,
      network
    })
    return { balance: 0, ...wallet }
  },
  getBalance: ({ wallet, network }) => {
    // getBalance for all cryptos
    return ipcRenderer.invoke('cryptosGetBalance', { wallet, network })
  },
  getBalances: ({ addresses, crypto, network }) => {
    // bulk getBalances call for blockchair cryptos
    return ipcRenderer.invoke('cryptosGetBalances', {
      addresses,
      crypto,
      network
    })
  },
  sendToAddress: ({ wallet, toAddress, amount, gasPrice, fee, network }) => {
    // sendToAddress for all cryptos
    return ipcRenderer.invoke('cryptosSendToAddress', {
      wallet,
      toAddress,
      amount,
      gasPrice,
      fee,
      network
    })
  }
})

// Minizip API
contextBridge.exposeInMainWorld('minizip', {
  create: (contents, password) => {
    return ipcRenderer.invoke('minizipCreate', contents, password)
  }
})
