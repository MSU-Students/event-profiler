<script lang="ts" setup>
import { useProfileStore } from 'src/stores/profile';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const username= ref('');
const password= ref('');
const profileStore = useProfileStore();
const $router = useRouter();
async function login() {
  await  profileStore.login();
  await $router.replace('/');
}
</script>
<template>
  <q-card class="bg-primary fixed-center">
    <q-card-section class="text-h6">
      Login Page
    </q-card-section>
    <q-card-section>
      <q-input v-model="username" />
      <q-input v-model="password" type="password"  />
    </q-card-section>
    <q-banner>
      {{ username + password }}
    </q-banner>
    <q-card-actions>
      <q-btn icon="login" @click="login">Login with Google</q-btn>
      <q-btn icon="login">Login</q-btn>
      <q-btn icon="cancel" to="/" >No</q-btn>
    </q-card-actions>
  </q-card>
</template>
