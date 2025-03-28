export default class EmailClientService {
  constructor(emailConfig) {
    for (const key in emailConfig) {
      this[key] = emailConfig[key]
    }
    this.testMode = false
    return this
  }

  runTest() {
    this.testMode = true
    return this
  }

  async connect(settings) {
    const isConfigured = this.emailConfigUsername && this.emailConfigPassword
    if (settings || isConfigured) {
      window.ipcRenderer.send('emailConfig', {
        user: { ...this.user },
        config: {
          username: this.testMode
            ? settings.username
            : this.emailConfigUsername,
          password: this.testMode
            ? settings.password
            : this.emailConfigPassword,
          host: this.testMode ? settings.host : this.emailConfigHost,
          port: this.testMode ? settings.port : this.emailConfigPort,
          tls: this.testMode ? settings.tls : this.emailConfigTls
        }
      })
      return this
    } else {
      const message = 'Email settings have not been configured.'
      window.dialog.showErrorBox('Error', message)
      throw new Error(message)
    }
  }

  async sendMail({ to, bcc, subject, text, html, attachments }) {
    try {
      const emailData = await window.ipcRenderer.invoke('sendEmail', {
        to,
        bcc,
        subject,
        text,
        html,
        attachments
      })
      return emailData
    } catch (e) {
      return null
    }
  }

  blobToBase64(blob) {
    const reader = new FileReader()
    reader.readAsDataURL(blob)
    return new Promise((resolve) => {
      reader.onload = (e) => {
        resolve(e.target.result)
      }
    })
  }
}
