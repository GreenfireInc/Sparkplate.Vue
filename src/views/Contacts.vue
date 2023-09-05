<!-- Notes about this component:
Contributors: Antonio Cruz (TonyBoy56)

Description:
* My intention was to create a table that would show a possible list of contacts a signed in user may already have.
* Upon clicking a Contact Name, a modal will appear near the bottom of the page displaying their Name, and Email as contact info.
  - Changes: Plans to have this modal as a popup at the top of the page rather than the bottom.

Changes to the component for better UI/UX:
* Leverage ContactService.js
* Add the ability to add/edit/remove contacts
-->

<template>
  <div class="view">
    <h1 class="view-name">Contacts</h1>
    <div class="bg-white shadow py-5 px-4 mt-4">
      <button @click="toggleVcfModal">VCF File Upload</button>
      <div class="modal-background" v-if="isModalVisible">
        <div class="modal-content">
          <h2>Import VCF File</h2>
          <input type="file" @change="handleFileUpload" accept=".vcf" />
          <div v-if="vcfData">
            <h3>Contact Information</h3>
            <pre>{{ vcfData }}</pre>
            <qrcode-vue :value="vcfData"></qrcode-vue>
          </div>
          <button class="close" @click="toggleVcfModal">&times;</button>
        </div>
      </div>
      <table class="table">
        <thead class="container">
          <tr class="row">
            <th class="col">Name</th>
            <th class="col">Email</th>
          </tr>
        </thead>
        <tbody class="container">
          <!-- Loop through contacts to display on the table -->
          <tr class="row" v-for="(contact, index) in contacts" :key="index">
            <td class="col">
              <button @click="openContactModal(contact)">
                {{ contact.name }}
              </button>
            </td>
            <td class="col">{{ contact.email }}</td>
          </tr>
        </tbody>
      </table>
      <!-- Contacts Modal -->
      <div class="modal-background" v-if="selectedContact">
        <div class="modal-content">
          <button class="close" @click="closeContactModal">&times;</button>
          <h2>Contact Information</h2>
          <div><strong>Name:</strong> {{ selectedContact.name }}</div>
          <div><strong>Email:</strong> {{ selectedContact.email }}</div>
          <div><strong>Address:</strong> {{ selectedContact.address }}</div>
          <div><strong>Company:</strong> {{ selectedContact.company }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import QrcodeVue from 'vue-qrcode'

export default {
  name: 'ContactsPage',
  components: {
    QrcodeVue
  },
  data() {
    return {
      isModalVisible: false,
      vcfData: null,
      selectedContact: null,
      contacts: [
        {
          name: 'John Doe',
          email: 'john@example.com',
          address: 'example address',
          company: 'Example Company, Inc'
        },
        {
          name: 'Jack Ryan',
          email: 'jack@example.com',
          address: 'example address',
          company: 'Example Company, Inc'
        },
        {
          name: 'Lara Croft',
          email: 'lara@example.com',
          address: 'example address',
          company: 'Example Company, Inc'
        },
        {
          name: 'Soap MacTavish',
          email: 'soap@example.com',
          address: 'example address',
          company: 'Example Company, Inc'
        },
        {
          name: 'John Price',
          email: 'john@example.com',
          address: 'example address',
          company: 'Example Company, Inc'
        },
        {
          name: 'Handler Walter',
          email: 'walter@example.com',
          address: 'example address',
          company: 'Example Company, Inc'
        }
      ]
    }
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()

        reader.onload = (e) => {
          this.vcfData = e.target.result
        }
        reader.readAsText(file)
      }
    },
    toggleVcfModal() {
      this.isModalVisible = !this.isModalVisible
    },
    openContactModal(contact) {
      this.selectedContact = contact
    },
    closeContactModal() {
      this.selectedContact = null
    }
  }
}
</script>

<style scoped>
/* Style for the close button */
.close {
  position: absolute;
  top: 0;
  right: 0;
  padding: 10px;
  cursor: pointer;
}
</style>
