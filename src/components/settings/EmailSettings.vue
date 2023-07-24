<template>
  <div>
    <div class="row">
      <div class="col-md-9 mb-3">
        <p class="text-xl">Email Configuration</p>
        <small class="text-muted">
          Fill-out This Form to Setup Your Email Configuration on Your Sparkplate
          Account.
        </small>
      </div>
    </div>

    <div class="mt-2 mb-2">
      <div class="input-group">
        <div class="input-field col-md-4 pl-0">
          <label>Email Address</label>
          <input v-model="username" type="text" />
        </div>

        <div class="input-field col-md-3 pl-0">
          <label>Password</label>
          <input v-model="password" type="password" />
        </div>
      </div>

      <div class="mt-1 mb-3">
        <button
          v-ripple="'rgba(255, 255, 255, .2)'"
          type="button"
          class="btn btn-sm bg-gray-200 text-dark"
          style="height: 30px; padding: 8px"
          @click="showMoreConfiguration = !showMoreConfiguration"
        >
          {{ showMoreConfiguration ? 'Hide Settings' : 'Show More Settings' }}
        </button>
      </div>

      <div class="input-group">
        <div v-if="showMoreConfiguration" class="input-field col-md-3 pl-0">
          <label>Host SMTP</label>
          <input v-model="host" type="text" />
        </div>

        <div v-if="showMoreConfiguration" class="input-field col-md-2 pl-0">
          <label>Port</label>
          <input v-model="port" type="text" />
        </div>

        <div v-if="showMoreConfiguration" class="input-field col-md-2 pl-0">
          <label>USE TLS</label>
          <select v-model="tls">
            <option :value="constant.TRUE">Enable</option>
            <option :value="constant.FALSE">Disabled</option>
          </select>
        </div>
      </div>

      <div class="d-flex align-content-right mt-3">
        <button
          v-ripple="'rgba(255, 255, 255, .2)'"
          type="button"
          class="btn btn-sm bg-gray-700 text-white"
          style="height: 40px; padding: 8px"
          @click="testEmailConfig"
        >
          Test
        </button>

        <button
          v-ripple="'rgba(255, 255, 255, .2)'"
          type="button"
          class="btn btn-sm bg-blue-700 text-white"
          style="height: 40px; margin-left: 10px; padding: 8px"
          @click="saveEmailConfig"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import EmailClientService from '@/service/emailClientService'

export default {
  name: 'EmailSettings',
  data() {
    return {
      username: '',
      password: '',
      host: '',
      port: 456,
      tls: false,
      showMoreConfiguration: false,
      constant: {
        TRUE: true,
        FALSE: false
      }
    }
  },
  computed: {
    ...mapState({ userSettings: (state) => state.userSettings }),
    user() {
      const activeUser = this.$store.state.accounts.active
      return JSON.parse(JSON.stringify(activeUser))
    }
  },
  watch: {
    username(newVal) {
      // Prevent host, port, tls from being overwritten when component loads
      if (newVal && newVal !== this.userSettings.emailConfigUsername) {
        const _generatedConfig = this.generateConfig()
        if (_generatedConfig) {
          this.port = _generatedConfig.port
          this.host = _generatedConfig.stmp
          this.tls = _generatedConfig.tls || false
        } else this.showMoreConfiguration = true
      }
    }
  },
  mounted() {
    if (this.userSettings.emailConfig) {
      this.username = this.userSettings.emailConfig.emailConfigUsername
      this.password = this.userSettings.emailConfig.emailConfigPassword
      this.host = this.userSettings.emailConfig.emailConfigHost
      this.port = this.userSettings.emailConfig.emailConfigPort
      this.tls = this.userSettings.emailConfig.emailConfigTls
    }
  },
  methods: {
    saveEmailConfig() {
      const payload = {
        emailConfigUsername: this.username,
        emailConfigPassword: this.password,
        emailConfigHost: this.host,
        emailConfigPort: parseInt(this.port),
        emailConfigTls: this.tls
      }
      this.$store.dispatch('userSettings/updateEmailConfig', payload)
    },
    async testEmailConfig() {
      const emailClient = new EmailClientService(
        this.$store.state.userSettings.emailConfig
      )
      await emailClient.runTest().connect({
        username: this.username,
        password: this.password,
        host: this.host,
        port: this.port,
        tls: this.tls
      })
      await emailClient.sendMail({
        to: this.user.email,
        subject: 'Testing Sparkplate Email Delivery',
        text: 'Testing Sparkplate Email Delivery'
      })
    },
    saveAndTest() {
      this.saveEmailConfig()
      this.testEmailConfig()
    },
    generateConfig() {
      // smtp.mail.yahoo.com
      const supportedMails = [
        {
          prefix: '@gmail.com',
          stmp: 'smtp.gmail.com',
          port: 465
        },
        {
          prefix: '@yahoo.com',
          stmp: 'smtp.mail.yahoo.com',
          port: 465
        },
        {
          prefix: '@outlook.com',
          stmp: 'smtp.office365.com',
          port: 587,
          tls: true
        }
      ]

      const configuration = supportedMails.find((m) =>
        this.username.endsWith(m.prefix)
      )
      return configuration || null
    }
  }
}
</script>

<style></style>
