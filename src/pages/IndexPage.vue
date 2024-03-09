<template>
  <q-page class="row items-center justify-evenly">
    <q-banner v-if="selected">
      <template #avatar v-if="selected.avatar">
        <q-avatar><q-img :src="selected.avatar"/></q-avatar>
      </template>
      {{ selected.name }}
      <template #action>
        <q-btn @click="reset">Next</q-btn>
      </template>
    </q-banner>
    <Roulette
      v-else
      display-shadow
      display-indicator
      :counter-clockwise="false"
      :duration="10"
      class="wheel"
      ref="wheel"
      easing="bounce"
      :items="people"
      :size="(Math.min($q.screen.width, $q.screen.height) - 100)"
      :result-variation="duration"
      @click="launchWheel"
      @wheel-end="wheelEnded"
    ></Roulette>



    <q-dialog v-model="showDialog">
      <q-card class="bg-primary fixed-center">
        <q-card-section class="text-h6">
          New Event
        </q-card-section>
        <q-card-section>
          <q-input v-model="eventName" />
        </q-card-section>
        <q-card-actions>
          <q-btn icon="save" v-close-popup>Start Event</q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { Roulette } from "vue3-roulette";
import { Profile, useProfileStore } from 'src/stores/profile';
import { onMounted, ref } from 'vue';
import { computed } from '@vue/reactivity';
class Person {
  htmlContent: string;
  constructor(public name: string, public id:string, avatar: string) {
    this.htmlContent = `<div class="flex col center" style="gap: 25px;">${name}<br/><img class="avatar" src="${avatar}" alt="" /></div>`;
  }
}

interface SpinningWheel {
  launchWheel(): void;
  reset(): void;
}
const wheel = ref<SpinningWheel|null>(null);
const spinning = ref(false);
const profileStore = useProfileStore();
const showDialog = ref(false);
const profiles = ref<Profile[]>([]);
const selected = ref<Profile>();
const eventName = ref('');
const duration = ref(100);
const people = computed(() => {
  return profiles.value.map(p => new Person(p.name, p.id, p.avatar));
})

onMounted(() => {
  profileStore.streamWith().subscribe({
    next(value) {
        profiles.value = value;
    },
  })
})
function launchWheel() {
  spinning.value = true;
  //duration.value = Math.round(Math.random() * 50) + 50;
  wheel.value?.launchWheel();
}
function wheelEnded(item: Person) {
  spinning.value = false;
  selected.value = profiles.value.find(p => p.id == item.id);
}
function reset() {
  const index = profiles.value.findIndex(p => p.id == selected.value?.id);
  if (index >= 0) {
    selected.value = undefined;
    profiles.value.splice(index, 1);
    // duration.value = 0;
    // wheel.value?.reset();
  }
}
</script>;

<style lang="css">
.flex {
  display: flex;
}

.flex.col {
  flex-direction: column;
}

.flex.center {
  justify-content: center;
  align-items: center;
}
.wheel {
  user-select: none;
}

.wheel-container::after {
  content: "";
  height: 210px;
  width: 2px;
  position: absolute;
  border: 1px solid rgba(0, 0, 0, 0.25);
  top: 0;
  left: calc(50% - 2px);
  border-radius: 50%;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.wheel:not(.wheel-container)::after {
  content: "";
  background-image: url(/icons/favicon-128x128.png);
  width: 64px;
  height: 64px;
  position: absolute;
  top: 50%;
  left: 50%;
  background-size: contain;
  z-index: 5;
  transform: translate(-50%, -50%);
}

.wheel .wheel-item:nth-child(odd) {
  background: linear-gradient(90deg, #2cbd9a 0%, #65c86d);
}

.wheel .wheel-item:nth-child(even) {
  background: linear-gradient(to right, #ffa246, #e14a53);
}
.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  box-shadow: 4px 4px 10px black;
}
</style>
