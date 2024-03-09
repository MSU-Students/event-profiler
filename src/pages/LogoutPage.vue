<script lang="ts" setup>
import { ref } from 'vue';

const username= ref('');
const password= ref('');
</script>
<template>
  <q-card class="bg-primary fixed-center">
    <q-card-section class="text-h6">
      Are you Sure
    </q-card-section>
    <q-card-actions>
      <q-btn icon="logout" to="/auth/login">Yes</q-btn>
    </q-card-actions>
  </q-card>
</template>
