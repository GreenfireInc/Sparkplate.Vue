import nodemailer from 'nodemailer'

export default class EmailService {
  constructor(userData, config) {
    this.user = userData
    this.loadConfiguration(config)

    this.emailConfig = nodemailer.createTransport({
      auth: {
        user: this.username, // your email address
        pass: this.password // your password
      },
      host: this.host,
      port: this.port,
      tls: this.tls,
      secure: parseInt(this.port) === 465
      // name: this.user.signature // your name when send
    })
  }

  loadConfiguration(config) {
    this.username = config.username
    this.password = config.password
    this.host = config.host
    this.port = config.port
    this.tls = config.tls || false
  }

  sendMail({ from, to, bcc, subject, text, html, attachments }, callback) {
    ;(async () => {
      try {
        const info = await this.emailConfig.sendMail({
          // from: from || `"${this.user.signature}" <${this.user.email}>`,
          from: from || this.username || this.user.email,
          to, // list of receivers
          bcc, // users email to bcc copy of email
          subject, // Subject line
          text, // plain text body
          html, // html body
          attachments
        })

        callback(info, null)
      } catch (e) {
        callback(null, e)
      }
    })()
  }
}
