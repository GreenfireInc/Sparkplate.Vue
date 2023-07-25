<template>
  <div class="releaseNotes">
    <section>
      <h3>Release Notes</h3>
      <div ref="notes" class="px-2" />
    </section>
    <section>
      <h3>Changelog</h3>
      <div ref="changelog" class="px-2" />
    </section>
  </div>
</template>

<script>
export default {
  name: 'AboutNotes',
  beforeMount() {
    window.app.getReleaseInfo().then(({ notesHTML, changelogHTML }) => {
      this.$refs.notes.innerHTML = notesHTML
      this.$refs.changelog.innerHTML = changelogHTML
    })
  }
}
</script>

<style lang="scss">
.releaseNotes {
  @apply p-2;

  section {
    h3 {
      @apply text-xl font-semibold;
    }
    h4 {
      @apply text-lg;
    }
    ul {
      @apply list-disc pl-6;
    }
  }
}
</style>
