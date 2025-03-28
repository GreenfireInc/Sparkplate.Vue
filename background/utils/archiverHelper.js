import archiver from 'archiver'
import archiverZipEncryptable from 'archiver-zip-encryptable'

class Archiver {
  constructor() {
    this.archiver = archiver
  }

  async create(format, options) {
    if (
      options.password &&
      !this.archiver.isRegisteredFormat('zip-encryptable')
    ) {
      await this.registerZipEncryptableFormat()
    }

    return this.archiver.create(format, options)
  }

  async registerZipEncryptableFormat() {
    await this.archiver.registerFormat(
      'zip-encryptable',
      archiverZipEncryptable
    )
  }
}

export default new Archiver()
