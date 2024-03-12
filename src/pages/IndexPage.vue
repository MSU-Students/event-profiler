<template>
  <q-page class="row items-center justify-evenly">
    <div v-if="selected" >
      <q-banner class="text-h6">
        <template #avatar v-if="selected.avatar">
          <q-avatar><q-img :src="selected.avatar"/></q-avatar>
        </template>
        Congratulations {{ selected.name }}!
        <template #action>
          <q-btn @click="reset">Next</q-btn>
        </template>
      </q-banner>
      <qrcode-vue :value="$route.fullPath" :size="(Math.min($q.screen.width, $q.screen.height) - 200)" level="H" />
      <div class="text-h6 text-center">Scan to Join</div>
    </div>
    <div v-else-if="presentEvent && presentEvent.owner.id == profileStore.getUser()?.uid">
      <q-banner class="text-h6 text-center">Welcome to {{ presentEvent.name }}</q-banner>
      <Roulette v-if="people.length >= 4"
        display-shadow
        display-indicator
        :counter-clockwise="false"
        :duration="10"
        class="wheel"
        ref="wheel"
        easing="bounce"
        :items="people"
        :size="(Math.min($q.screen.width, $q.screen.height) - 150)"
        :result-variation="duration"
        @click="launchWheel"
        @wheel-end="wheelEnded"
      ></Roulette>
      <div v-else>
        <q-banner class="text-center">
          <div class="text-bold">Requires at least 4 participants</div>
          <div class="text-h6">Scan to join</div>
        </q-banner>
        <qrcode-vue :value="qrCodeUrl" :size="(Math.min($q.screen.width, $q.screen.height) - 200)" level="H" />
      </div>
    </div>
    <div v-else-if="presentEvent" class="text-center">
      <q-banner class="text-h6">Welcome to {{ presentEvent.name }}</q-banner>
      <q-spinner-orbit
        v-if="presentEvent.spinning"
          color="primary"
          size="8em"
        />
      <q-list bordered v-else>
        <div class="text-h6">Winners</div>
        <q-item v-for="w in winners" :key="w.id">
          <q-item-section avatar>
            <q-avatar>
              <q-img :src="w.avatar" />
            </q-avatar>
          </q-item-section>
          <q-item-section>{{ w.name }}</q-item-section>
        </q-item>
      </q-list>
    </div>
    <div v-else>
      <q-list bordered>
        <q-item clickable :to="'/'+e.id" v-for="e in profileStore.events" :key="e.id">
          <q-item-section avatar>
            <q-avatar>
              <q-img :src="e.owner.avatar" />
            </q-avatar>
          </q-item-section>
          <q-item-section>{{ e.name }}</q-item-section>
        </q-item>
        <q-item class="text-center text-bold" v-if="profileStore.events.length == 0">
          No event today!
        </q-item>
        <q-item clickable @click="createNewEvent">
          <q-item-section avatar>
            <q-icon name="today" />
          </q-item-section>
          <q-item-section>Host New Event</q-item-section>
        </q-item>
      </q-list>
    </div>
    <q-dialog v-model="showDialog">
      <q-card class="bg-primary fixed-center">
        <q-form @submit="saveEvent">
        <q-card-section class="text-h6">
          Host Event Wheeler
        </q-card-section>
        <q-card-section>
          <q-input label="Event Name" v-model="eventName" :rules="[(v) =>  v && v.length > 3 || 'Invalid Event']" />
        </q-card-section>
        <q-card-actions>
          <q-btn icon="save" type="submit">Start Event</q-btn>
        </q-card-actions>
      </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">

import { Roulette } from "vue3-roulette";
import QrcodeVue from 'qrcode.vue'
import { Event, Profile, useProfileStore } from 'src/stores/profile';
import { onMounted, ref } from 'vue';
import { computed } from '@vue/reactivity';
import { uid } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
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
const winners = ref<Profile[]>([]);
const selected = ref<Profile>();
const presentEvent = ref<Event>();
const eventName = ref('');
const duration = ref(100);
const people = computed(() => {
  return profiles.value.map(p => new Person(p.name, p.id, p.avatar));
})
const $route = useRoute();
const $router = useRouter();
const qrCodeUrl = computed(() => {
  return location.href;
})
function load() {
  const eventId = $route.params.event || '';
  const e = profileStore.events.find(e => e.id == eventId);
  if (e && presentEvent.value?.id !== e.id) {
    presentEvent.value = e;
    const user = profileStore.getUser();
    if (user && user.uid == presentEvent.value.owner.id) {
      profileStore.streamWith(presentEvent.value.id).subscribe({
        next(value) {
            profiles.value = value;
        },
      })
    }
    if (user && presentEvent.value.owner.id !== user.uid) {
      profileStore.joinEvent(presentEvent.value.id);
      profileStore.watchEvent(presentEvent.value.id).subscribe({
        next(value) {
          if (value[0].id == presentEvent.value?.id) {
            presentEvent.value = value[0];
          }
        },
      });
      profileStore.watchWinners(presentEvent.value.id).subscribe({
        next(value) {
          winners.value = value;
        },
      });
    }
  }
}
$router.afterEach(load)
onMounted(async () => {
  await profileStore.getAllEvents();
  load();
})

function launchWheel() {
  spinning.value = true;
  //duration.value = Math.round(Math.random() * 50) + 50;
  wheel.value?.launchWheel();
  if (presentEvent.value) {
    presentEvent.value.spinning = true;
    profileStore.updateEvent(presentEvent.value);
  }
}
async function wheelEnded(item: Person) {
  spinning.value = false;
  selected.value = profiles.value.find(p => p.id == item.id);
  if (presentEvent.value) {
    presentEvent.value.spinning = false;
    await profileStore.updateEvent(presentEvent.value);
    if (selected.value) {
      await profileStore.announceWinner(selected.value);
    }
  }
}
function reset() {
  const index = profiles.value.findIndex(p => p.id == selected.value?.id);
  if (index >= 0) {
    selected.value = undefined;
    profiles.value.splice(index, 1);
    //save winner
  }
}
function createNewEvent() {
  eventName.value = '';
  showDialog.value = true;

}
async function saveEvent() {
  const user = profileStore.getUser();
  if (user) {
    await profileStore.register({
      date: '',
      id: uid(),
      name: eventName.value,
      owner: {
        id: user.uid,
        avatar: user.photoURL || '',
        name: user.displayName || ''
      }
    });
    showDialog.value = false;
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
