<script lang="ts" setup>
import { useProfileStore } from 'src/stores/profile';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const username= ref('');
const password= ref('');
const profileStore = useProfileStore();
const $router = useRouter();
const $route = useRoute();
async function login() {
  await  profileStore.login();
  await $router.replace(($route.query?.redirect as string) ||  '/');
}
</script>
<template>
  <q-card class="bg-primary fixed-center">
    <q-card-section class="text-h6">
      Welcome to Event Wheeler
    </q-card-section>
    <q-card-actions>
      <q-btn icon="login" @click="login">Login with Google</q-btn>
      <q-btn icon="home" to="/" ></q-btn>
    </q-card-actions>
  </q-card>
</template>
