<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { useProfileStore } from 'src/stores/profile';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const username= ref('');
const password= ref('');
const profileStore = useProfileStore();
const $q = useQuasar();
const $router = useRouter();
async function logout() {
  await profileStore.logout();
  $q.notify({
    message: 'YOu are now out'
  })
  await $router.replace({
    name: 'login'
  })
}
</script>
<template>
  <q-card class="bg-primary fixed-center">
    <q-card-section class="text-h6">
      Are you Sure
    </q-card-section>
    <q-card-actions>
      <q-btn icon="logout" @click="logout">Yes</q-btn>
    </q-card-actions>
  </q-card>
</template>
