// ============================================================
//  lobby.js
//  Gestión del lobby: crear partida, unirse, listar salas
// ============================================================

import { db } from './firebase-config.js';
import {
  ref, set, get, update, onValue, off, push, serverTimestamp, remove
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

export class Lobby {
  constructor(onGameStart) {
    this.onGameStart = onGameStart;
    this.username    = null;
    this.playerId    = this._genId();
    this.roomsRef    = ref(db, 'rooms');
    this._roomsListener = null;
  }

  _genId() {
    return Math.random().toString(36).slice(2, 10);
  }

  _genCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random()*chars.length)]).join('');
  }

  // ─── Auth (anonymous username) ─────────────────────────────
  enter(username) {
    this.username = username.trim().slice(0, 20) || 'Anónimo';
    return this.username;
  }

  // ─── Create room ───────────────────────────────────────────
  async createGame() {
    const code    = this._genCode();
    const roomRef = ref(db, `rooms/${code}`);
    await set(roomRef, {
      code,
      host:      this.username,
      hostId:    this.playerId,
      guest:     null,
      guestId:   null,
      status:    'waiting',  // waiting | playing | ended
      createdAt: serverTimestamp(),
    });
    return code;
  }

  // ─── Join room by code ─────────────────────────────────────
  async joinGame(code) {
    const codeUpper = code.trim().toUpperCase();
    const roomRef   = ref(db, `rooms/${codeUpper}`);
    const snap      = await get(roomRef);
    if (!snap.exists()) throw new Error('Sala no encontrada');
    const room = snap.val();
    if (room.status !== 'waiting') throw new Error('La partida ya comenzó');
    if (room.hostId === this.playerId) throw new Error('No puedes unirte a tu propia partida');

    await update(roomRef, {
      guest:   this.username,
      guestId: this.playerId,
      status:  'playing',
    });
    return codeUpper;
  }

  // ─── Listen for open rooms ─────────────────────────────────
  listenRooms(callback) {
    if (this._roomsListener) off(this.roomsRef, 'value', this._roomsListener);
    this._roomsListener = onValue(this.roomsRef, snap => {
      const rooms = [];
      snap.forEach(child => {
        const r = child.val();
        if (r.status === 'waiting' && r.hostId !== this.playerId)
          rooms.push(r);
      });
      callback(rooms);
    });
  }

  stopListeningRooms() {
    if (this._roomsListener) {
      off(this.roomsRef, 'value', this._roomsListener);
      this._roomsListener = null;
    }
  }

  // ─── Watch a room until both players are in ────────────────
  watchRoom(code, callback) {
    const roomRef = ref(db, `rooms/${code}`);
    onValue(roomRef, snap => {
      if (snap.exists()) callback(snap.val());
    });
    return () => off(roomRef);
  }

  // ─── Remove room (on game end / host leaves before join) ───
  async deleteRoom(code) {
    try { await remove(ref(db, `rooms/${code}`)); } catch {}
  }
}