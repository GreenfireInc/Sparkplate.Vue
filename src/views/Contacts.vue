<template>
  <div class="view">
    <h1 class="view-name">Contacts</h1>
    <div class="bg-white shadow py-5 px-4 mt-4">
      <table class="table">
        <thead class="container">
          <tr class="clickable-row">
            <th class="col">Name</th>
          </tr>
        </thead>
        <tbody class="container">
          <tr class="clickable-row">
            <td class="col">John Doe</td>
          </tr>
          <tr class="clickable-row">
            <td class="col">Jack Ryan</td>
          </tr>
          <tr class="clickable-row">
            <td class="col">Lara Croft</td>
          </tr>
          <tr class="clickable-row">
            <td class="col">Soap McTavish</td>
          </tr>
          <tr class="clickable-row">
            <td class="col">John Price</td>
          </tr>
          <tr class="clickable-row">
            <td class="col">Handler Walter</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContactsPage'
}
</script>
