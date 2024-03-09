// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, AuthCredential, User, UserCredential, createUserWithEmailAndPassword, fetchSignInMethodsForEmail, sendEmailVerification, sendPasswordResetEmail, signInAnonymously, signInWithCredential, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDocs, getFirestore, onSnapshot, query, setDoc, where } from "firebase/firestore";
import { collection, addDoc } from "firebase/firestore";
import { Event, Profile } from 'src/stores/profile';
import { Observable, Subject, retry } from 'rxjs';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBq4HqgxHDMkqLwSR2qfDvsTDzjp679ccI",
  authDomain: "event-wheeler.firebaseapp.com",
  projectId: "event-wheeler",
  storageBucket: "event-wheeler.appspot.com",
  messagingSenderId: "917549826899",
  appId: "1:917549826899:web:b9483e42a0d618f4a297a6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();
const auth = getAuth();
const db = getFirestore(app);

class MyFirebaseService {
  loginWithGoogle() {
    return signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        console.log(token);
        // The signed-in user info.
        const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)
        // ...
      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
        return errorMessage;
      });

  }
  async signInWithGoogleAccount() {
    const res = await signInWithPopup(auth, provider);
    return res;
  }
  getUser() {
    return auth.currentUser;
  }
  auth() {
    return auth.currentUser;
  }
  refreshToken() {
    return auth.currentUser?.getIdToken(/* forceRefresh */ true);
  }
  async checkTokenRefresh() {
    return auth.currentUser?.getIdTokenResult()
      .then((idTokenResult) => {
        // Compare idTokenResult.expirationTime with current time
        // If the token is about to expire, refresh it
        if (idTokenResult && new Date(idTokenResult.expirationTime).getTime() < Date.now()) {
          // Call the function to refresh the token
          return this.refreshToken();
        }
      });
  }
  authenticate() {
    return new Promise<User | null>((resolve) => {
      auth.onAuthStateChanged((user) => {
        if (user) {
          this.checkTokenRefresh();
        }
        resolve(user);
      });
    });
  }
  async validateAuth() {
    if (!(!auth.currentUser)) {
      await this.authenticate();
    } else {
      await this.checkTokenRefresh();
    }
  }
  async signOut() {
    return signOut(auth);
  }
  async signInWithSession(cred: AuthCredential) {
    const res = await signInWithCredential(auth, cred);
    return res;
  }
  signInAnonymously(): Promise<UserCredential> {
    return signInAnonymously(auth);
  }
  async signInWithEmailAndPass(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }
  async createUserWithEmailPass(email: string, password: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(cred.user);
    return cred;
  }
  async resendEmailVerification() {
    const cred = await this.authenticate();
    if (cred) {
      await sendEmailVerification(cred);
    }
  }
  async forgetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
  }
  async fetchSignInMethodsForEmail(email: string) {
    return fetchSignInMethodsForEmail(auth, email);
  }
  async createRecord(profile: Profile) {
    return await setDoc(doc(db, "profiles",(profile.event || '') + ':' +profile.id), profile);
  }
  async announceWinner(profile: Profile) {
    return await setDoc(doc(db, "winners",(profile.event || '') + ':' +profile.id), profile);
  }

  streamWith(eventKey: string) {
    const collectionRef = collection(db, 'profiles');
    const queryRef = query(collectionRef, where('event', '==', eventKey));
    return new Observable<Profile[]>((subscriber) => {
      onSnapshot(queryRef || collectionRef, {
        complete: () => subscriber.complete(),
        next: (snapshot) => {
          const records = snapshot.docs.map((doc) => {
            return { ...doc.data() } as unknown as Profile;
          });
          if (snapshot.metadata.fromCache) {
            subscriber.next();
            return;
          }
          subscriber.next(records);
        },
        error: (err) => subscriber.error(err),
      });
    }).pipe(
      retry({
        delay: 1000 * 5,
      })
    );
  }
  streamWinners(eventKey: string) {
    const collectionRef = collection(db, 'winners');
    const queryRef = query(collectionRef, where('event', '==', eventKey));
    return new Observable<Profile[]>((subscriber) => {
      onSnapshot(queryRef || collectionRef, {
        complete: () => subscriber.complete(),
        next: (snapshot) => {
          const records = snapshot.docs.map((doc) => {
            return { ...doc.data() } as unknown as Profile;
          });
          if (snapshot.metadata.fromCache) {
            subscriber.next();
            return;
          }
          subscriber.next(records);
        },
        error: (err) => subscriber.error(err),
      });
    }).pipe(
      retry({
        delay: 1000 * 5,
      })
    );
  }
  streamEventUpdates(id: string) {
    const collectionRef = collection(db, 'events');
    const queryRef = query(collectionRef, where('id', '==', id));
    return new Observable<Event[]>((subscriber) => {
      onSnapshot(queryRef || collectionRef, {
        complete: () => subscriber.complete(),
        next: (snapshot) => {
          const records = snapshot.docs.map((doc) => {
            return { ...doc.data(), id: doc.id } as unknown as Event;
          });
          if (snapshot.metadata.fromCache) {
            subscriber.next();
            return;
          }
          subscriber.next(records);
        },
        error: (err) => subscriber.error(err),
      });
    }).pipe(
      retry({
        delay: 1000 * 5,
      })
    );
  }

  async saveEvent(e: Event) {
    return await setDoc(doc(db, "events", e.id), e);
  }
  async getEvents(date: string) {
    const queryRef = query( collection(db, 'events'), where('date', '==', date))
    const docsRef = await getDocs(queryRef);
    if (docsRef.empty) {
      return !docsRef.metadata.fromCache ? [] : undefined;
    } else {
      return docsRef.docs.map((d) => d.data() as Event);
    }
  }
}

export const myFirebaseService = new MyFirebaseService();

