import { defineStore } from 'pinia';
import { myFirebaseService } from 'src/services/firebase.service';

export interface Profile {
  name: string;
  id: string;
  avatar: string;
}

export const useProfileStore = defineStore('profile', {
  state: () => ({
    records: [{
      name: 'Lupin',
      id: 'III',
      avatar: 'https://upload.wikimedia.org/wikipedia/en/0/0f/ArseneLupinIII.jpg'
    }] as Profile[]
  }),

  getters: {
    headCount (state) {
      return state.records.length;
    }
  },

  actions: {
    async login() {
      const response = await myFirebaseService.signInWithGoogleAccount();
      if (response) {
        return myFirebaseService.createRecord({
          avatar: response.user.photoURL || '',
          id: response.user.uid,
          name: response.user.displayName || 'Me'
        })
      }
    },
    logout() {
      return myFirebaseService.signOut();
    },
    register ( profile: Profile ) {
      this.records.push(profile);
    },
    getUser() {
      return myFirebaseService.getUser();
    },
    auth() {
      return myFirebaseService.validateAuth();
    },
    streamWith() {
      return myFirebaseService.streamWith();
    }
  }
});
