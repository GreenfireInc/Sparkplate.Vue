<!-- Notes about this component:
* My intention was to create a table that would show possible list of contacts a person may already have.
* Upon clicking a Contact Name, a modal will appear near the bottom of the page displaying their Name, and Email as contact info.
  - Changes: Plans to have this modal as a popup at the top of the page rather than the bottom.
  - Include vcf file imports to convey them with a QR code, containing the same contact info.

Changes to the component for better UI/UX:
* Leverage ContactService.js
* Add the ability to add/edit/remove contacts
-->

<template>
  <div class="view">
    <h1 class="view-name">Contacts</h1>
    <div class="bg-white shadow py-5 px-4 mt-4">
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
              <button @click="openModal(contact)">{{ contact.name }}</button>
            </td>
            <td class="col">{{ contact.email }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Contacts Modal -->
      <div class="modal-background" v-if="selectedContact">
        <div class="modal-content">
          <span class="close" @click="closeModal">&times;</span>
          <h2>Contact Information</h2>
          <div><strong>Name:</strong> {{ selectedContact.name }}</div>
          <div><strong>Email:</strong> {{ selectedContact.email }}</div>
          <!-- Generate more contact fields, possibly -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContactsPage',
  data() {
    return {
      contacts: [
        { name: 'John Doe', email: 'john@example.com' },
        { name: 'Jack Ryan', email: 'jack@example.com' },
        { name: 'Lara Croft', email: 'lara@example.com' },
        { name: 'Soap MacTavish', email: 'soap@example.com' },
        { name: 'John Price', email: 'john@example.com' },
        { name: 'Handler Walter', email: 'walter@example.com' }
      ],
      selectedContact: null
    }
  },
  methods: {
    openModal(contact) {
      console.log('name is selected')
      this.selectedContact = contact
    },
    closeModal() {
      this.selectedContact = null
    }
  }
}
</script>

<style scoped>
/* Style for the modal container */
/* .modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  z-index: 1;
} */

/* Style for the modal content */
/* .modal-content {
  background-color: #fff;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  max-width: 600px;
  position: relative;
} */

/* Style for the close button */
.close {
  position: absolute;
  top: 0;
  right: 0;
  padding: 10px;
  cursor: pointer;
}
</style>
