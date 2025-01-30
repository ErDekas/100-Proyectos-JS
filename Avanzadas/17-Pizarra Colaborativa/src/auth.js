import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { app } from "../firebase";

class AuthService {
  constructor() {
    this.auth = getAuth(app);
    this.googleProvider = new GoogleAuthProvider();
    this.currentUser = null;

    // Observer para cambios en el estado de autenticación
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      this.onAuthStateChange?.(!!user, user);
    });
  }

  setAuthStateChangeCallback(callback) {
    this.onAuthStateChange = callback;
  }

  async registerWithEmail(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async loginWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async loginWithGoogle() {
    try {
      const result = await signInWithPopup(this.auth, this.googleProvider);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return !!this.currentUser;
  }
}

export const authService = new AuthService();
