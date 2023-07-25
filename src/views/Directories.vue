<template>
  <div class="view">
    <h1 class="view-name">Directories</h1>
    <div class="d-flex justify-center w-100 m-2">
      <img
        src="/assets/icons/sparkplate.svg"
        width="150"
        class="logo Greenfire"
        alt="Sparkplate logo"
      />
    </div>
    <table class="table">
      <thead class="container">
        <tr class="row">
          <th class="col">Description</th>
          <th class="col">Path</th>
        </tr>
      </thead>
      <tbody class="container">
        <tr class="row">
          <td class="col">Static Assets</td>
          <td class="col">./public</td>
        </tr>
        <tr class="row">
          <td class="col">Electron Background Process Entrypoint</td>
          <td class="col">./background/index.js</td>
        </tr>
        <tr class="row">
          <td class="col">Vue Renderer Entrypoint</td>
          <td class="col">./src/main.js</td>
        </tr>
        <tr class="row">
          <td class="col">Main Application Component</td>
          <td class="col">./src/App.vue</td>
        </tr>
        <tr class="row">
          <td class="col">Side Navigation Component</td>
          <td class="col">./src/components/partials/SideNav.vue</td>
        </tr>
        <tr class="row">
          <td class="col">Test Page Component</td>
          <td class="col">./src/view/Test.vue</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'DirectoriesPage'
}
</script>
