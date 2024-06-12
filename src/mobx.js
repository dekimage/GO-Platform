import { makeAutoObservable, runInAction } from "mobx";
import { auth, db } from "./firebase";
import {
  onAuthStateChanged,
  signInAnonymously,
  getAuth,
  EmailAuthProvider,
  linkWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  deleteDoc,
  query,
  onSnapshot,
  updateDoc,
  getDocs,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

import Logger from "@/utils/logger";

export const getRandomHexColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const DEFAULT_USER = {
  balance: 1000,
  color: getRandomHexColor(),
  joined: new Date(),
};

const logger = new Logger({ debugEnabled: false }); // switch to true to see console logs from firebase

class Store {
  // App Data

  todos = [];
  user = null;

  // Static Data

  lists = [];
  // App States
  isMobileOpen = false;
  loading = true;

  constructor() {
    makeAutoObservable(this);
    this.seedFirestore = this.seedFirestore.bind(this);
    this.initializeAuth();

    this.setIsMobileOpen = this.setIsMobileOpen.bind(this);

    this.upgradeAccount = this.upgradeAccount.bind(this);
    this.loginWithEmail = this.loginWithEmail.bind(this);
    this.signupWithEmail = this.signupWithEmail.bind(this);

    this.updateUser = this.updateUser.bind(this);
  }

  initializeAuth() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        runInAction(() => {
          if (!userDoc.exists()) {
            const newUser = {
              ...DEFAULT_USER,
              uid: user.uid,
              provider: "anonymous",
              username: "Guest",
              createdAt: new Date(),
            };
            setDoc(userDocRef, newUser).then(() => {
              this.user = newUser;
            });
          } else {
            this.user = { uid: user.uid, ...userDoc.data() };
          }
        });
      } else {
        runInAction(() => {
          this.user = null;
        });
      }
      runInAction(() => {
        this.loading = false;
      });
    });
  }

  seedFirestore = async () => {
    const products = [
      {
        name: "Apple iPhone 15, 128GB, Black",
        description: "Latest iPhone model",
        image:
          "https://m.media-amazon.com/images/I/51PtFHUPjBL._AC_SL1000_.jpg",
        price: 1000,
        amazonId: "B0CMPMY9ZZ",
      },
      {
        name: "Apple 2024 MacBook Air 13-inch",
        description: "Light and powerful laptop",
        image:
          "https://m.media-amazon.com/images/I/71ItMeqpN3L._AC_SL1500_.jpg",
        price: 1290,
        amazonId: "B0CX22ZW1T",
      },
      {
        name: "Apple 2023 MacBook Pro Laptop M3",
        description: "High performance laptop",
        image:
          "https://m.media-amazon.com/images/I/61RJn0ofUsL._AC_SL1500_.jpg",
        price: 2400,
        amazonId: "B0CM5KK44S",
      },
      // Add more products as needed
    ];
    try {
      const productsCollection = collection(db, "products");
      for (const product of products) {
        await addDoc(productsCollection, product);
      }
      console.log("Products added successfully");
    } catch (error) {
      console.error("Error adding products: ", error);
    }
  };

  // GLOBAL MOBX STATE
  setIsMobileOpen(isMobileOpen) {
    runInAction(() => {
      this.isMobileOpen = isMobileOpen;
    });
  }

  async updateUser(newData) {
    try {
      const userDocRef = doc(db, "users", this.user.uid);
      await updateDoc(userDocRef, newData);
      runInAction(() => {
        this.user = { ...this.user, ...newData };
      });
    } catch (error) {
      console.error("Error updating user:", error);
    }
  }

  //
  //
  //
  //
  //
  // AUTH FUNCTIONS
  async upgradeAccount(email, password, username) {
    try {
      const credential = EmailAuthProvider.credential(email, password);
      const userCredential = await linkWithCredential(
        auth.currentUser,
        credential
      );

      const userDocRef = doc(db, "users", userCredential.user.uid);
      await updateDoc(userDocRef, {
        username,
      });

      runInAction(() => {
        this.user = {
          ...userCredential.user,
          username,
        };
      });
    } catch (error) {
      console.error("Error upgrading account:", error);
    }
  }

  signInAnonymously = async () => {
    await signInAnonymously(auth);
    logger.debug("Signed in anonymously");
  };

  async loginWithEmail({ email, password }) {
    try {
      this.loading = true;
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      runInAction(() => {
        this.user = userCredential.user;
        this.loading = false;
      });
    } catch (error) {
      console.error("Error logging in:", error);
      runInAction(() => {
        this.loading = false;
      });
      throw error;
    }
  }

  async signupWithEmail(email, password, username) {
    try {
      this.loading = true;
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Additional user properties
      const newUserProfile = {
        ...DEFAULT_USER,
        createdAt: new Date(),
        username: username,
        email: email,
        uid: userCredential.user.uid,
      };

      // Create a user profile in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), newUserProfile);

      runInAction(() => {
        this.user = newUserProfile;
        this.loading = false;
      });
    } catch (error) {
      console.error("Error signing up:", error);
      runInAction(() => {
        this.loading = false;
      });
      throw error;
    }
  }

  async logout() {
    try {
      await signOut(auth); // Sign out from Firebase Authentication
      runInAction(() => {
        this.user = null; // Reset the user in the store
      });
    } catch (error) {
      console.error("Error during logout:", error);
      // Handle any errors that occur during logout
    }
  }

  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const newUserProfile = {
          ...DEFAULT_USER,
          createdAt: new Date(),
          username: user.displayName || "New User",
          email: user.email,
          uid: user.uid,
        };

        await setDoc(userDocRef, newUserProfile);

        runInAction(() => {
          this.user = newUserProfile;
        });
      } else {
        runInAction(() => {
          this.user = { uid: user.uid, ...userDoc.data() };
        });
      }
    } catch (error) {
      console.error("Error with Google sign-in:", error);
    }
  }

  async sendPasswordReset(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      // Handle success, such as showing a message to the user
    } catch (error) {
      console.error("Error sending password reset email:", error);
      // Handle errors, such as invalid email, etc.
    }
  }

  get isUserAnonymous() {
    return this.user && this.user.provider == "anonymous";
  }
}

const MobxStore = new Store();
export default MobxStore;
