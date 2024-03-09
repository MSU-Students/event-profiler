<script lang="ts" setup>
import { ref } from 'vue';

const username= ref('');
const password= ref('');
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
      <q-btn icon="login">Login</q-btn>
      <q-btn icon="cancel" to="/" >No</q-btn>
    </q-card-actions>
  </q-card>
</template>
