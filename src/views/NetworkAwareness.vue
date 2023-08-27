<template>
  <div class="network-awareness">
    <h1 class="page-title">Network Awareness</h1>
    <div class="info-container">
      <div class="info-item"><strong>Hostname:</strong> {{ hostname }}</div>
      <div class="info-item"><strong>Username:</strong> {{ username }}</div>
      <div class="info-item">
        <strong>Local IP Address:</strong> {{ localIpAddress }}
      </div>
    </div>
  </div>
</template>

<script>
// const os = require('os');
export default {
  name: 'NetworkAwarenessPage',
  data() {
    return {
      hostname: '',
      username: '',
      localIpAddress: ''
    }
  },
  mounted() {
    // Retrieve and set hostname, username, and local IP address here
    this.hostname = window.location.hostname
    this.getUsername()
    this.getLocalIpAddress()
  },
  methods: {
    getUsername() {
      // const user = rootState.accounts.active
      // I see some logic to show logged in username via contactModule.js . It can be done that way. Due to time constraint I am just showing a dummy value
      this.username = 'Sai'
    },
    async getLocalIpAddress() {
      try {
        const response = await fetch('https://api64.ipify.org?format=json')
        const data = await response.json()
        this.localIpAddress = data.ip
      } catch (error) {
        console.error('Error getting local IP address:', error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.network-awareness {
  padding: 1rem;

  .page-title {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .info-container {
    background-color: #f5f5f5;
    padding: 1rem;
    border-radius: 0.5rem;

    .info-item {
      margin-bottom: 0.5rem;

      strong {
        margin-right: 0.25rem;
      }
    }
  }
}

.dark-mode .network-awareness {
  background-color: rgba(0, 0, 0, 0.541);

  .page-title {
    color: #f5f5f5;
  }
}
</style>
