import path from 'path'
class Store {
  constructor(opts) {
    // opts object is sent to this.prepareStore method in order to async/await calls to contextBridge app api
    // opts should be an object with { configName: STRING (required), defaults: ANY (optional), filePath: STRING (optional) }
    this.prepareStore(opts)
  }

  async prepareStore(opts) {
    // If opts.defaults is provided, it will be used as the initial data value. Otherwise an empty object will be used
    const defaults = opts.defaults || {}
    // If opts.filePath is set then save file in location set by opts.filePath
    const storagePath = opts.filePath || window.appData.userDataPath
    this.path = path.join(storagePath, opts.configName + '.json')
    this.data = await parseDataFile(this.path, defaults)
  }

  getAll() {
    return this.data || []
  }

  // This will just return the property on the `data` object
  get(key) {
    return this.data[key] || ''
  }

  // ...and this will set it
  async set(key, val) {
    this.data[key] = val
    // Wait, I thought using the node.js' synchronous APIs was bad form?
    // We're not writing a server so there's not nearly the same IO demand on the process
    // Also if we used an async API and our app was quit before the asynchronous write had a chance to complete,
    // we might lose that data. Note that in a real app, we would try/catch this.
    await window.fs.writeFileSync(this.path, JSON.stringify(this.data))
  }

  remove(key) {
    // hope this is an OK way to do this
    delete this.data[key]
    window.fs.writeFileSync(this.path, JSON.stringify(this.data))
  }
}

async function parseDataFile(filePath, defaults) {
  // We'll checkFileExists in case the file doesn't exist yet, which will be the case on the first application run.
  // `fs.readFileSync` will return a JSON string which we then parse into a Javascript object
  // return defaults if file does not exist yet
  const exists = await window.fs.checkFileExists(filePath)
  const data = exists
    ? JSON.parse(await window.fs.readFileSync(filePath, 'utf-8'))
    : defaults

  return data
}

export default Store
