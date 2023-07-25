import qrcode from 'qrcode'
export class MultiFAService {
  constructor(user) {
    this.userEmail = user.email
    this.secret = user.googleAuthenticatorCode
    this.service = 'Sparkplate.vue by Greenfire'
  }

  async generateSecret() {
    this.secret = await window.authenticator.generateSecret()
    return this.secret
  }

  async verifyToken(token) {
    const isValid = await window.authenticator.check(token, this.secret)
    return isValid
  }

  async generateQr() {
    const otpauth = await window.authenticator.keyuri(
      this.userEmail,
      this.service,
      this.secret
    )
    try {
      const img = await qrcode.toDataURL(otpauth)
      return img
    } catch (err) {
      return err
    }
  }
}
