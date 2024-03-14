import { defineStore } from 'pinia';
import { date } from 'quasar';
import { myFirebaseService } from 'src/services/firebase.service';

export interface Profile {
  name: string;
  id: string;
  event?: string;
  avatar: string;
}

export interface Event {
  name: string;
  id: string;
  date: string;
  spinning?: boolean;
  owner: Profile;
}

export const useProfileStore = defineStore('profile', {
  state: () => ({
    events: [] as Event[]
  }),
  getters: {
  },
  actions: {
    async login() {
      await myFirebaseService.signInWithGoogleAccount();
      await this.getAllEvents();
    },
    logout() {
      return myFirebaseService.signOut();
    },
    async register ( event: Event ) {
      event.date = date.formatDate(new Date(), 'YYYY-MM-DD');
      await myFirebaseService.saveEvent(event);
      return this.getAllEvents();
    },
    announceWinner(profile: Profile) {
      return myFirebaseService.announceWinner(profile);
    },
    watchWinners(eventKey: string) {
      return myFirebaseService.streamWinners(eventKey);
    },
    joinEvent(eventKey: string) {
      const user = this.getUser();
      if (!user) return;
      return myFirebaseService.createRecord({
        avatar: user.photoURL || '',
        id: user.uid,
        name: user.displayName || 'Me',
        event: eventKey
      })
    },
    watchEvent(event:string) {
      return myFirebaseService.streamEventUpdates(event);
    },
    updateEvent(e: Event) {
      return myFirebaseService.saveEvent(e);
    },
    getUser() {
      return myFirebaseService.getUser();
    },
    auth() {
      return myFirebaseService.validateAuth();
    },
    streamWith(eventKey:string) {
      return myFirebaseService.streamWith(eventKey);
    },
    async getAllEvents() {
      const events = await myFirebaseService.getEvents(date.formatDate(new Date(), 'YYYY-MM-DD'));
      if (events) {
        this.events = events;
      }
    },
    async clone(clone:Event, profiles: Profile[]) {
      for (let i = 0; i < profiles.length; i++) {
        const profile = profiles[i];
        await myFirebaseService.createRecord({
          ...profile,
          event: clone.id
        })
      }

    }
  }
});
