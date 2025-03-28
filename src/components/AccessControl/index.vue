<template>
  <div class="content-wrapper">
    <div v-if="!accounts.authenticated" class="signup-login">
      <registration-form />
    </div>
  </div>
</template>

<script>
import RegistrationForm from './registration/RegistrationForm.vue'

export default {
  name: 'AccessControl',
  components: { RegistrationForm }
}
</script>
<style lang="scss" scoped>
.content-wrapper {
  @apply h-full;
}
.signup-login {
  background-image: url(/img/wallet-pic.jfif);
  background-image: url(/assets/vectors/pattern1.svg);
  background-size: 10rem;
  background-color: white;
  background-position: cover;
  padding-top: 40px;
  @apply w-full h-full top-0 text-white absolute flex items-center;
}
svg {
  vertical-align: super;
  display: flex;
}
</style>
