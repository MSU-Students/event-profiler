<template>
  <q-page class="row items-center justify-evenly">
    <q-list bordered>
      <q-item clickable v-for="p in profiles" :key="p.id" >
        <q-item-section avatar>
          <q-avatar>
            <q-img :src="p.avatar"/>
          </q-avatar>
        </q-item-section>
        <q-item-section>{{ p.name }}</q-item-section>
      </q-item>
      <q-separator/>
      <q-item clickable @click="showDialog = true" >
        <q-item-section avatar>
          <q-icon name="add" />
        </q-item-section>
        <q-item-section>Add New Profile</q-item-section>
      </q-item>
    </q-list>



    <q-dialog v-model="showDialog">
      <q-card class="bg-primary fixed-center">
    <q-card-section class="text-h6">
      Add Profile
    </q-card-section>
    <q-card-section>
      <q-input v-model="profile.name" />
      <q-input v-model="profile.avatar"  />
    </q-card-section>
    <q-card-actions>
      <q-btn icon="save" @click="saveProfile" v-close-popup>Save</q-btn>

    </q-card-actions>
  </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { Profile, useProfileStore } from 'src/stores/profile';
import { onMounted, ref } from 'vue';
const profileStore = useProfileStore();
const showDialog = ref(false);
const profiles = ref<Profile[]>([]);
const profile = ref<Profile>({
  avatar: '', id: '', name: ''
});

function saveProfile() {
  profileStore.register(profile.value);
}
onMounted(() => {
  profileStore.streamWith().subscribe({
    next(value) {
        profiles.value = value;
    },
  })
})
</script>
