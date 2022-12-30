<script setup>
</script>
<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style lang="sass">
@import '@quasar/extras/material-icons/material-icons.css'
@import '@quasar/extras/material-icons-outlined/material-icons-outlined.css'
@import 'quasar/src/css/index.sass'
@import '@quasar/extras/fontawesome-v6/fontawesome-v6.css'

/* Loxberry 3 Layout fix */
#main1 .ui-header .container > .column
  flex-direction: inherit
  display: block

#app .ui-btn
  margin-bottom: 0
  width: auto

h1.ui-title
  font-weight: 700
  line-height: 21px
  letter-spacing: normal
#page_content, #app .ui-checkbox
  margin: 0 !important
</style>


