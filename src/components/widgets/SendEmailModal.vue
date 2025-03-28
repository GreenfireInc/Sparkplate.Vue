<!--
  Contributors: Aciel Ochoa

  Description: Send Email Modal component to handle sending/modifying emails
    througout the Sparkplate applicaiton.

  Props:
    email - OBJECT REQUIRED
      subject: STRING REQUIRED initial email subject header
      body: STRING REQUIRED initial email body
    submit - FUNCTION REQUIRED
      This function will be added to the submit event listener
      on the form.
    handleChange - CUSTOM EVENT
      ex. handleChange (payload) { this.email[payload.target] = payload.value }
      Only argument is payload OBJECT:
        target: STRING recipient, body, or subject
        value: STRING || OBJECT
    selectRecipient - BOOLEAN adds the recipient field to the form
-->

<template>
  <modal name="send-email" height="auto" classes="p-3">
    <h2 class="text-xl text-blue-800 font-medium">Send as Email</h2>
    <form class="flex flex-col text-left" @submit.prevent="submit">
      <div v-if="selectRecipient" class="input-field">
        <label for="recipient" class="mb-1">To</label>
        <select id="recipient" class="p-1" @change="handleChange">
          <option value="-1">Choose a Recipient</option>
          <option
            v-for="contact in contacts.filter((c) => c.type === 'regular')"
            :key="contact.id"
            :value="JSON.stringify(contact)"
          >
            {{ contact.firstname + ' ' + contact.lastname }}
          </option>
        </select>
      </div>
      <div class="input-field">
        <label for="email-subject" class="mb-1">Subject</label>
        <input
          id="subject"
          type="text"
          :value="email.subject"
          required
          @input="handleChange"
        />
      </div>
      <div class="input-field">
        <label for="email-body" class="mb-1">Body</label>
        <textarea
          id="body"
          class="input-field"
          :value="email.body"
          rows="10"
          required
          @input="handleChange"
        />
      </div>
      <div class="d-flex flex-row-reverse">
        <button
          type="submit"
          class="btn bg-blue-700 text-white w-24 justify-center"
        >
          Send
        </button>
        <button
          type="button"
          class="btn bg-gray-300 w-24 justify-center"
          @click.prevent="handleClose"
        >
          Cancel
        </button>
      </div>
    </form>
  </modal>
</template>

<script>
export default {
  name: 'SendEmailModal',
  props: {
    email: {
      type: Object,
      required: true
    },
    submit: {
      type: Function,
      required: true
    },
    selectRecipient: Boolean
  },
  methods: {
    handleChange(e) {
      const target = e.target.id
      const value =
        target === 'recipient' ? JSON.parse(e.target.value) : e.target.value
      this.$emit('handleChange', { target, value })
    },
    handleClose() {
      this.$modal.hide('send-email')
    }
  }
}
</script>
