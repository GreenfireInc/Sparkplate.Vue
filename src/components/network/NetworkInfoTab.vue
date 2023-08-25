<template>
  <div class="info-container">
    <div class="info-item">
      <div class="info-label">Hostname:</div>
      <div class="info-value">{{ hostname }}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Username:</div>
      <div class="info-value">{{ username }}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Local IP Address:</div>
      <div class="info-value">{{ ipAddress }}</div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import os from 'os'
/*
 * By: Joshua Medvinsky
 *
 * Description: This component detects and displays the hostname of the machine, the current username and local
 * IP address irrespective of the operating system (Linux, Windows and Linux).
 *
 */
export default {
  name: 'NetworkInfoTab',
  data: () => ({
    hostname: '',
    username: '',
    ipAddress: ''
  }),
  async mounted() {
    // Retrieve hostname
    this.hostname = window.location.hostname

    // Retrieve username based on the operating system
    if (process.platform === 'win32') {
      this.username = process.env.USERNAME
    } else if (process.platform === 'darwin' || process.platform === 'linux') {
      this.username = os.userInfo().username
    }

    // Retrieve local IP address
    try {
      const response = await axios.get('https://api.ipify.org?format=json')
      this.ipAddress = response.data.ip
    } catch (error) {
      console.error('Error retrieving IP address:', error)
    }
  }
}
</script>

<style scoped>
.info-container {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.info-label {
  font-weight: bold;
}

.info-value {
  font-style: italic;
}
</style>
