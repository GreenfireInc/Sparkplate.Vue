/*
 * Contributors: Aciel Ochoa
 *
 * Description: This file contains CRUD methods for user acocunts
 *
 */
import { idbCon } from './IdbService'
import bcrypt from 'bcryptjs'
export class UserService {
  constructor() {
    this.tableName = 'users'
  }

  getUsers() {
    return idbCon.select({
      from: this.tableName
    })
  }

  async addUser(user) {
    const results = await idbCon.count({
      from: this.tableName,
      where: {
        email: user.email
      }
    })
    if (results > 0) {
      window.dialog.showErrorBox(
        'User already exists with that email!',
        'Error'
      )
      return null
    } else {
      user.email = user.email.toLowerCase()
      user.password = bcrypt.hashSync(user.password, 10)
      user.annotationsToggle = true
      const [created] = await idbCon.insert({
        into: this.tableName,
        values: [user],
        return: true
      })
      return this.sanitize(created)
    }
  }

  getUserBy(identifier) {
    return idbCon.select({
      from: this.tableName,
      where: identifier
    })
  }

  removeUser(id) {
    return idbCon.remove({
      from: this.tableName,
      where: {
        id: id
      }
    })
  }

  async updateUserById(user) {
    return await idbCon.update({
      in: this.tableName,
      set: {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email.toLowerCase(),
        company: user.company,
        address: user.address,
        stateProvince: user.stateProvince,
        city: user.city,
        zip: user.zip,
        country: user.country,
        timezone: user.timezone,
        currency: user.currency,
        globalCurrency: user.globalCurrency,
        udomain: user.udomain,
        website: user.website,
        twitter: user.twitter,
        instagram: user.instagram,
        phone: user.phone,
        userProfileType: user.userProfileType,
        companyTypeIndex: user.companyTypeIndex,
        signatureStyle: user.signatureStyle,
        addressBookToggle: user.addressBookToggle,
        annotationsToggle: user.annotationsToggle,
        prefixedAddressesToggle: user.prefixedAddressesToggle,
        emailAccompanyToggle: user.emailAccompanyToggle,
        googleAuthenticatorCode: user.googleAuthenticatorCode
      },
      where: {
        id: user.id
      }
    })
  }

  async updateUserPassword(id, newPassword) {
    const hashPassword = bcrypt.hashSync(newPassword, 10)
    return await idbCon.update({
      in: this.tableName,
      set: {
        password: hashPassword
      },
      where: {
        id: id
      }
    })
  }

  async login(creds) {
    // get user data from database
    const [user] = await idbCon.select({
      from: this.tableName,
      where: {
        email: creds.email.toLowerCase()
      }
    })

    if (user) {
      // confirm supplied password is correct and return user data without password
      const success = bcrypt.compareSync(creds.password, user.password)
      if (success) {
        const sanitized = this.sanitize(user)
        localStorage.setItem('authenticated', null)
        return sanitized
      }
    }
    // return null if user is not found or password is incorrect
    return null
  }

  async getUserMnemonic(id) {
    const [data] = await idbCon.select({
      from: this.tableName,
      where: {
        id
      }
    })
    const { mnemonic, ..._ } = data // eslint-disable-line
    return mnemonic
  }

  sanitize(data) {
    // data -- OBJECT
    // sanitizeData() will remove the password from an object passed to it
    // eslint-disable-next-line
    const { password, ...rest } = data
    return rest
  }
}
