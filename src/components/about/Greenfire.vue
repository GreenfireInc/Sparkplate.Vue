<template>
  <div class="w-full">
    <div class="flex justify-around">
      <div>
        <div class="mb-2">
          <label class="font-semibold"> Greenfire Management: </label>
          <ul class="ml-4">
            <li>Corey S.</li>
            <li>Nicole L.</li>
            <li>Uzma B.</li>
          </ul>
        </div>
        <div class="mb-2">
          <label class="font-semibold"> Developers: </label>
          <ul class="ml-4">
            <li>Aciel O.</li>
            <li>Tim R.</li>
          </ul>
        </div>
        <div class="mb-2">
          <label class="font-semibold"> Special Thanks To: </label>
          <ul class="ml-4">
            <li>Past Developers</li>
            <li>Past Graphic Designers</li>
          </ul>
        </div>
      </div>
      <div class="center-content">
        <img
          src="/assets/icons/greenfire.svg"
          class="logo"
          alt="greenfire-logo"
        />
      </div>
    </div>
    <div class="footer">
      <a
        v-for="link of links"
        :key="link.name + '-link'"
        class="footer-link"
        :href="link.url"
        target="_blank"
        >{{ link.name }}</a
      >
    </div>
  </div>
</template>

<script>
const link = (name, url) => ({ name, url })

export default {
  name: 'AboutGreenfire',
  data: () => ({
    links: [
      link('Website', 'https://www.greenfire.io'),
      link('Twitter', 'https://twitter.com/greenfire_io'),
      link('Instagram', 'https://www.instagram.com/greenfire.io'),
      link('LinkedIn', 'https://www.linkedin.com/company/greenfire-inc'),
      link('Keybase', 'https://keybase.io/team/greenfire'),
      link('Github', 'https://github.com/greenfireinc'),
      link('Medium', '#')
    ]
  })
}
</script>

<style lang="scss" scoped>
.footer {
  @apply flex justify-center w-full;

  .footer-link {
    @apply px-2 text-blue-600;

    &:not(:last-child) {
      border-right: 1px solid #1d1d1d;
    }
  }
}

.center-content {
  @apply flex items-center justify-center h-auto;
}

.logo {
  max-width: 14rem;
  height: auto;
  width: 70%;
}
</style>
