import bugReporter from '@/logging/BugReporter'
import CryptoJS from 'crypto-js'
import {
  clearDatabase,
  exportToJson,
  importFromJson
} from '@/service/BackupService'

export default {
  methods: {
    async clearDatabaseWarning() {
      // Warn user about clearing all data
      // Returns true if user hits continue, false otherwise
      const { response } = await window.dialog.showMessageBox({
        message:
          'Proceeding with restore will erase all existing data. Are you sure you want to continue?',
        type: 'warning',
        buttons: ['Cancel', 'Continue']
      })
      return response
    },
    async createBackup(password) {
      // Prompt User to select save location
      const filePath = await this.getFilePath()

      // Retrieve backup data and encrypt
      const backupJson = await exportToJson()
      const encryptedBackup = this.encryptJSON(backupJson, password)

      // Save as .ggbk file
      window.fs.writeFile(filePath, encryptedBackup, 'base64', (err) => {
        if (!err) this.$toast.success('Backup saved at ' + filePath, 'Success')
        else {
          bugReporter.catchError(err)
          console.error(err)
          throw new Error('An error occurred while saving your backup.')
        }
      })
    },
    encryptJSON(json, password) {
      const encrypted = CryptoJS.AES.encrypt(json, password).toString()
      const buffer = Buffer.from(encrypted, 'base64')
      return buffer
    },
    async getFilePath() {
      // Create filename
      const { firstname, lastname } = this.$store.state.accounts.active
      const date = this.$moment().format('YYMMDD')
      const time = this.$moment().format('HHmm')
      const filename = `${firstname + lastname}.backup.${date}.${time}`

      // Prompt user for save location
      const { canceled, filePath } = await window.dialog.showSaveDialog({
        defaultPath: `*/${filename}.ggbk`,
        filters: [{ name: 'Sparkplate Backup', extensions: ['ggbk'] }],
        showsTagField: false
      })
      if (canceled) throw new Error('Canceled by user.')

      return filePath
    },
    async initClearAndRestore(json) {
      // Once user confirms, clear database and insert data from backup
      const proceed = await this.clearDatabaseWarning()
      if (proceed) {
        this.$toast.info('Restoring data from backup file...')
        await clearDatabase()
        await importFromJson(json)
        this.$toast.success('Restore completed', 'Success')
      }
    },
    async restoreBackup(filePath, password) {
      // Load and attempt to decrypt backup file
      let backup = await window.fs.readFileSync(filePath, 'base64')
      try {
        backup = CryptoJS.AES.decrypt(backup, password).toString(
          CryptoJS.enc.Utf8
        )
      } catch (err) {
        return this.$toast.error('Invalid password entered.')
      }

      this.initClearAndRestore(backup)
    },
    async selectBackupFile() {
      const { canceled, filePaths } = await window.dialog.showOpenDialog({
        title: 'Select a backup',
        properties: ['openFile'],
        filters: [{ name: 'Sparkplate Backup', extensions: ['ggbk'] }],
        showsTagField: false
      })

      if (canceled) throw new Error('Canceled by user.')
      return filePaths[0]
    }
  }
}
