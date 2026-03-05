// ============================================================
//  auth.js — Login con Google / Email + gestión de perfil
// ============================================================

import { auth, db } from './firebase-config.js';
import {
  GoogleAuthProvider, signInWithPopup,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  ref, get, set, update
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ─── Obtener / crear perfil de usuario en DB ─────────────────
export async function getOrCreateProfile(uid, displayName) {
  const profileRef = ref(db, `users/${uid}`);
  const snap = await get(profileRef);
  if (snap.exists()) return snap.val();

  // Generar username único a partir del displayName
  const base     = (displayName || 'jugador').replace(/\s+/g, '').toLowerCase().slice(0, 15);
  const username = await findUniqueUsername(base);

  const profile = {
    uid,
    username,
    displayName: displayName || username,
    wins:   0,
    losses: 0,
    draws:  0,
    createdAt: Date.now(),
  };
  await set(profileRef, profile);
  return profile;
}

async function findUniqueUsername(base) {
  const usernamesRef = ref(db, 'usernames');
  const snap = await get(usernamesRef);
  const taken = snap.exists() ? snap.val() : {};

  let candidate = base;
  let i = 2;
  while (taken[candidate]) {
    candidate = base + i++;
  }
  // Reservar el username
  await set(ref(db, `usernames/${candidate}`), true);
  return candidate;
}

export async function updateUsername(uid, oldUsername, newUsername) {
  const clean = newUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20);
  if (!clean || clean.length < 3) throw new Error('El nombre debe tener al menos 3 caracteres (letras, números, _)');

  const usernamesSnap = await get(ref(db, `usernames/${clean}`));
  if (usernamesSnap.exists()) throw new Error('Ese nombre de usuario ya está en uso');

  // Liberar el anterior y reservar el nuevo
  await set(ref(db, `usernames/${oldUsername}`), null);
  await set(ref(db, `usernames/${clean}`), true);
  await update(ref(db, `users/${uid}`), { username: clean });
  return clean;
}

// ─── Login con Google ─────────────────────────────────────────
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result   = await signInWithPopup(auth, provider);
  const user     = result.user;
  const profile  = await getOrCreateProfile(user.uid, user.displayName);
  return { user, profile };
}

// ─── Registro con email ───────────────────────────────────────
export async function registerWithEmail(email, password, displayName) {
  if (!displayName?.trim()) throw new Error('Ingresa un nombre de usuario');
  const result  = await createUserWithEmailAndPassword(auth, email, password);
  const profile = await getOrCreateProfile(result.user.uid, displayName.trim());
  return { user: result.user, profile };
}

// ─── Login con email ──────────────────────────────────────────
export async function loginWithEmail(email, password) {
  const result  = await signInWithEmailAndPassword(auth, email, password);
  const snap    = await get(ref(db, `users/${result.user.uid}`));
  const profile = snap.exists() ? snap.val() : await getOrCreateProfile(result.user.uid, result.user.displayName);
  return { user: result.user, profile };
}

// ─── Logout ───────────────────────────────────────────────────
export async function logout() {
  await signOut(auth);
}

// ─── Observer ────────────────────────────────────────────────
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, async user => {
    if (!user) { callback(null, null); return; }
    const snap    = await get(ref(db, `users/${user.uid}`));
    const profile = snap.exists() ? snap.val() : await getOrCreateProfile(user.uid, user.displayName);
    callback(user, profile);
  });
}

// ─── Guardar resultado de partida en el perfil ───────────────
export async function saveGameResult(uid, result, opponentName, gameCode, myColor) {
  const historyRef = ref(db, `users/${uid}/history/${gameCode}`);
  await set(historyRef, {
    opponent:  opponentName,
    color:     myColor,
    result,           // 'win' | 'loss' | 'draw'
    playedAt:  Date.now(),
    code:      gameCode,
  });

  const profileRef = ref(db, `users/${uid}`);
  const snap = await get(profileRef);
  if (!snap.exists()) return;
  const p = snap.val();
  const update_data = {};
  if (result === 'win')  update_data.wins   = (p.wins   || 0) + 1;
  if (result === 'loss') update_data.losses = (p.losses || 0) + 1;
  if (result === 'draw') update_data.draws  = (p.draws  || 0) + 1;
  await update(profileRef, update_data);
}