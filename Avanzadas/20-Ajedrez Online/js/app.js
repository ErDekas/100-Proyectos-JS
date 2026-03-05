// ============================================================
//  app.js — Orquestador principal
// ============================================================

import { db }    from './firebase-config.js';
import { Lobby } from './lobby.js';
import { GameUI } from './game-ui.js';
import {
  loginWithGoogle, loginWithEmail, registerWithEmail,
  logout, onAuthChange, updateUsername, saveGameResult
} from './auth.js';
import {
  ref, set, get, update, onValue, off, push, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ─── Estado global ────────────────────────────────────────────
let currentUser    = null;
let currentProfile = null;
let lobby          = null;
let gameUI         = null;
let gameCode       = null;
let myColor        = null;
let gameRef        = null;
let chatRef        = null;
let stopWatchRoom  = null;
let timerStarted   = false;
let isApplyingMove = false;
let gameOverSaved  = false;  // evita guardar el resultado dos veces
let opponentName   = null;

// ─── Toast ────────────────────────────────────────────────────
function toast(msg, type = '') {
  let el = document.getElementById('toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.className = `toast ${type} show`;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 3500);
}

// ─── Modal de confirmación ────────────────────────────────────
function showConfirm(title, desc, icon = '⚠') {
  return new Promise(resolve => {
    const modal = document.getElementById('confirm-modal');
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-desc').textContent  = desc;
    document.getElementById('confirm-icon').textContent  = icon;
    modal.classList.remove('hidden');

    const ok     = document.getElementById('confirm-ok');
    const cancel = document.getElementById('confirm-cancel');

    const cleanup = (result) => {
      modal.classList.add('hidden');
      ok.replaceWith(ok.cloneNode(true));
      cancel.replaceWith(cancel.cloneNode(true));
      resolve(result);
    };

    document.getElementById('confirm-ok').onclick     = () => cleanup(true);
    document.getElementById('confirm-cancel').onclick = () => cleanup(false);
  });
}

// ─── Modal de oferta de tablas ────────────────────────────────
function showDrawOffer(opponentName) {
  return new Promise(resolve => {
    const modal = document.getElementById('draw-offer-modal');
    document.getElementById('draw-offer-desc').textContent =
      `${opponentName} te ofrece tablas. ¿Aceptas?`;
    modal.classList.remove('hidden');

    const accept = document.getElementById('draw-accept');
    const reject = document.getElementById('draw-reject');

    const cleanup = (result) => {
      modal.classList.add('hidden');
      accept.replaceWith(accept.cloneNode(true));
      reject.replaceWith(reject.cloneNode(true));
      resolve(result);
    };

    document.getElementById('draw-accept').onclick = () => cleanup(true);
    document.getElementById('draw-reject').onclick = () => cleanup(false);
  });
}

// ─── Screens ──────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    const active = s.id === id;
    s.style.display = active ? 'flex' : 'none';
    s.classList.toggle('active', active);
  });
}

// ─── Util ─────────────────────────────────────────────────────
function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function fmtDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('es-ES', { day:'2-digit', month:'2-digit', year:'2-digit' });
}

// ====================================================
//  AUTH SCREEN
// ====================================================
const loginPanel    = document.getElementById('login-panel');
const registerPanel = document.getElementById('register-panel');

document.getElementById('link-to-register').onclick = () => {
  loginPanel.classList.add('hidden');
  registerPanel.classList.remove('hidden');
};
document.getElementById('link-to-login').onclick = () => {
  registerPanel.classList.add('hidden');
  loginPanel.classList.remove('hidden');
};

// Google login (ambos paneles)
async function handleGoogle() {
  try {
    const { user, profile } = await loginWithGoogle();
    onProfileLoaded(user, profile);
  } catch(e) { toast(e.message, 'error'); }
}
document.getElementById('btn-google').onclick     = handleGoogle;
document.getElementById('btn-google-reg').onclick = handleGoogle;

// Email login
document.getElementById('btn-login-email').onclick = async () => {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-error');
  errEl.classList.add('hidden');
  try {
    const { user, profile } = await loginWithEmail(email, password);
    onProfileLoaded(user, profile);
  } catch(e) {
    errEl.textContent = translateAuthError(e.code || e.message);
    errEl.classList.remove('hidden');
  }
};

// Email register
document.getElementById('btn-register').onclick = async () => {
  const username = document.getElementById('reg-username').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const errEl    = document.getElementById('register-error');
  errEl.classList.add('hidden');
  try {
    const { user, profile } = await registerWithEmail(email, password, username);
    onProfileLoaded(user, profile);
  } catch(e) {
    errEl.textContent = translateAuthError(e.code || e.message);
    errEl.classList.remove('hidden');
  }
};

function translateAuthError(code) {
  const map = {
    'auth/email-already-in-use': 'Ese correo ya está registrado',
    'auth/invalid-email':        'Correo no válido',
    'auth/weak-password':        'La contraseña debe tener al menos 6 caracteres',
    'auth/user-not-found':       'Usuario no encontrado',
    'auth/wrong-password':       'Contraseña incorrecta',
    'auth/invalid-credential':   'Credenciales incorrectas',
  };
  return map[code] || code;
}

// ─── Auth state observer ──────────────────────────────────────
onAuthChange((user, profile) => {
  if (user && profile) {
    onProfileLoaded(user, profile);
  } else {
    showScreen('auth-screen');
  }
});

function onProfileLoaded(user, profile) {
  currentUser    = user;
  currentProfile = profile;
  initLobby();
}

// ====================================================
//  LOBBY
// ====================================================
function initLobby() {
  showScreen('lobby');
  updateLobbyHeader();

  if (!lobby) {
    lobby = new Lobby();
    lobby.enter(currentProfile.username);
  } else {
    lobby.enter(currentProfile.username);
  }

  lobby.listenRooms(rooms => {
    const list = document.getElementById('rooms-list');
    document.getElementById('rooms-count').textContent = rooms.length;
    if (!rooms.length) {
      list.innerHTML = '<div class="empty-state">No hay partidas disponibles</div>';
      return;
    }
    list.innerHTML = rooms.map(r => `
      <div class="room-item">
        <div class="room-info">
          <span class="room-host">♟ ${escHtml(r.host)}</span>
          <span class="room-code">${r.code}</span>
        </div>
        <button class="btn-secondary" data-code="${r.code}">Unirse</button>
      </div>
    `).join('');
    list.querySelectorAll('[data-code]').forEach(btn => {
      btn.onclick = () => joinGame(btn.dataset.code);
    });
  });
}

function updateLobbyHeader() {
  if (!currentProfile) return;
  const p = currentProfile;
  document.getElementById('welcome-msg').textContent     = `♟ ${p.username}`;
  document.getElementById('profile-stats').textContent =
    `${p.wins||0}V · ${p.draws||0}T · ${p.losses||0}D`;
}

document.getElementById('btn-logout').onclick = async () => {
  lobby?.stopListeningRooms();
  lobby = null;
  await logout();
  showScreen('auth-screen');
};

document.getElementById('btn-profile').onclick = () => showProfileScreen();

document.getElementById('btn-create').addEventListener('click', async () => {
  if (!lobby) return;
  try {
    gameCode = await lobby.createGame();
    toast(`Partida creada: ${gameCode}`, 'success');
    waitForOpponent(gameCode);
  } catch(e) { toast(e.message, 'error'); }
});

document.getElementById('btn-join').addEventListener('click', () => {
  const code = document.getElementById('game-code-input').value;
  if (!code) { toast('Ingresa un código', 'error'); return; }
  joinGame(code);
});

document.getElementById('game-code-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const code = document.getElementById('game-code-input').value;
    if (code) joinGame(code);
  }
});

async function joinGame(code) {
  if (!lobby) return;
  try {
    gameCode = await lobby.joinGame(code);
    myColor  = 'b';
    startGame();
  } catch(e) { toast(e.message, 'error'); }
}

function waitForOpponent(code) {
  toast(`Esperando oponente… Código: ${code}`);
  stopWatchRoom = lobby.watchRoom(code, room => {
    if (room.status === 'playing' && room.guest) {
      if (stopWatchRoom) { stopWatchRoom(); stopWatchRoom = null; }
      myColor = 'w';
      startGame();
    }
  });
}

// ====================================================
//  PERFIL
// ====================================================
function showProfileScreen() {
  if (!currentProfile) return;
  const p = currentProfile;
  document.getElementById('profile-username-display').textContent = p.username;
  document.getElementById('profile-email-display').textContent    = currentUser?.email || '';
  document.getElementById('stat-wins').textContent   = p.wins   || 0;
  document.getElementById('stat-draws').textContent  = p.draws  || 0;
  document.getElementById('stat-losses').textContent = p.losses || 0;

  loadGameHistory();
  showScreen('profile-screen');
}

async function loadGameHistory() {
  const histRef = ref(db, `users/${currentUser.uid}/history`);
  const snap    = await get(histRef);
  const listEl  = document.getElementById('game-history-list');

  if (!snap.exists()) {
    listEl.innerHTML = '<div class="empty-state">Aún no has jugado ninguna partida</div>';
    return;
  }

  const games = [];
  snap.forEach(child => games.push(child.val()));
  games.sort((a, b) => b.playedAt - a.playedAt);

  listEl.innerHTML = games.map(g => `
    <div class="history-item">
      <span class="history-result ${g.result}">${g.result === 'win' ? 'Victoria' : g.result === 'loss' ? 'Derrota' : 'Tablas'}</span>
      <span class="history-opponent">vs ${escHtml(g.opponent || '?')}</span>
      <span class="history-color">${g.color === 'w' ? '⬜ Blancas' : '⬛ Negras'}</span>
      <span class="history-date">${fmtDate(g.playedAt)}</span>
    </div>
  `).join('');
}

document.getElementById('btn-back-from-profile').onclick = () => {
  initLobby();
};
document.getElementById('btn-logout-profile').onclick = async () => {
  lobby?.stopListeningRooms();
  lobby = null;
  await logout();
  showScreen('auth-screen');
};

document.getElementById('btn-save-username').onclick = async () => {
  const newName = document.getElementById('new-username-input').value.trim();
  const errEl   = document.getElementById('username-edit-error');
  errEl.classList.add('hidden');
  try {
    const updated = await updateUsername(currentUser.uid, currentProfile.username, newName);
    currentProfile.username = updated;
    document.getElementById('profile-username-display').textContent = updated;
    document.getElementById('new-username-input').value = '';
    toast('Nombre actualizado', 'success');
    updateLobbyHeader();
  } catch(e) {
    errEl.textContent = e.message;
    errEl.classList.remove('hidden');
  }
};

// ====================================================
//  PARTIDA
// ====================================================
async function startGame() {
  lobby?.stopListeningRooms();
  timerStarted   = false;
  isApplyingMove = false;

  showScreen('game-screen');

  const roomSnap = await get(ref(db, `rooms/${gameCode}`));
  const room     = roomSnap.val();
  opponentName   = myColor === 'w' ? room.guest : room.host;

  gameRef = ref(db, `games/${gameCode}`);
  chatRef = ref(db, `chats/${gameCode}`);

  gameUI = new GameUI(handleMove, handleResign, handleDraw, handleChat);
  gameUI.setupPlayers(currentProfile.username, myColor, opponentName);
  gameUI.setGameCode(gameCode);
  gameUI.setStatus('Cargando partida…');

  if (myColor === 'w') {
    const snap = await get(gameRef);
    if (!snap.exists()) await initFirebaseGame();
  }

  onValue(gameRef, async snap => {
    if (!snap.exists() || isApplyingMove) return;
    const data = snap.val();
    gameUI.loadState(data.state);

    if (!timerStarted) { timerStarted = true; gameUI.startTimer(); }
    if (data.event) handleEvent(data.event);

    if (gameUI.engine.isGameOver()) {
      // El oponente hizo el movimiento ganador — guardar resultado para este jugador
      await handleGameOver(gameUI.engine.result, gameUI.engine.status);
    } else {
      const isMyTurn = gameUI.engine.turn === myColor;
      gameUI.setStatus(isMyTurn ? '🟢 Tu turno' : `⏳ Turno de ${opponentName}`);
    }
  });

  onValue(chatRef, snap => {
    gameUI.chatMsgs.innerHTML = '';
    snap.forEach(child => {
      const m = child.val();
      gameUI.addChatMessage(m.author, m.text, m.system);
    });
  });

  gameUI.addChatMessage('', `Partida iniciada · Código: ${gameCode}`, true);
}

async function initFirebaseGame() {
  await set(gameRef, { state: gameUI.engine.serialize(), event: null, createdAt: serverTimestamp() });
}

// ─── Botones en partida ───────────────────────────────────────
document.getElementById('btn-back-lobby').onclick = async () => {
  const ok = await showConfirm('¿Volver al lobby?', 'Perderás la partida actual.', '🚪');
  if (ok) goToLobby();
};
document.getElementById('btn-new-game').onclick    = () => goToLobby();
document.getElementById('btn-lobby-modal').onclick = () => goToLobby();

function goToLobby() {
  // Limpiar listeners activos
  if (gameRef) { off(gameRef); gameRef = null; }
  if (chatRef) { off(chatRef); chatRef = null; }
  gameUI        = null;
  gameCode      = null;
  myColor       = null;
  gameOverSaved = false;
  initLobby();
}

// ─── Movimiento ───────────────────────────────────────────────
async function handleMove(from, to, promoteTo) {
  const ok = gameUI.applyMove(from, to, promoteTo);
  if (!ok) return;

  isApplyingMove = true;
  await update(gameRef, { state: gameUI.engine.serialize(), event: null });
  isApplyingMove = false;

  if (gameUI.engine.isGameOver()) {
    await handleGameOver(gameUI.engine.result, gameUI.engine.status);
  }
}

// ─── Rendirse ─────────────────────────────────────────────────
async function handleResign() {
  const ok = await showConfirm('¿Rendirse?', 'Perderás la partida. Esta acción no se puede deshacer.', '🏳');
  if (!ok) return;
  const winner = myColor === 'w' ? 'b' : 'w';
  await update(gameRef, { event: { type: 'resign', by: myColor } });
  gameUI.showResult(winner, 'resign');
  await handleGameOver(winner, 'resign');
}

// ─── Tablas ───────────────────────────────────────────────────
async function handleDraw() {
  await update(gameRef, { event: { type: 'draw_offer', by: myColor } });
  toast('Oferta de tablas enviada');
}

// ─── Eventos remotos ──────────────────────────────────────────
async function handleEvent(event) {
  if (!event || event.by === myColor) return;

  if (event.type === 'resign') {
    const winner = event.by === 'w' ? 'b' : 'w';
    gameUI.showResult(winner, 'resign');
    gameUI.addChatMessage('', `${opponentName} se rindió`, true);
    await handleGameOver(winner, 'resign');
  } else if (event.type === 'draw_offer') {
    const accept = await showDrawOffer(opponentName);
    if (accept) {
      await update(gameRef, { event: { type: 'draw_accepted', by: myColor } });
      gameUI.showResult('draw', 'draw_offer');
      gameUI.addChatMessage('', 'Tablas acordadas', true);
      await handleGameOver('draw', 'draw_offer');
    }
  } else if (event.type === 'draw_accepted') {
    gameUI.showResult('draw', 'draw_offer');
    gameUI.addChatMessage('', 'Tablas acordadas', true);
    await handleGameOver('draw', 'draw_offer');
  }
}

// ─── Chat ─────────────────────────────────────────────────────
async function handleChat(text) {
  await push(chatRef, { author: currentProfile.username, text, system: false, ts: serverTimestamp() });
}

// ─── Fin de partida → guarda en perfil ───────────────────────
async function handleGameOver(result, reason) {
  if (gameOverSaved) return;
  gameOverSaved = true;
  // Determinar win/loss/draw para este jugador
  let myResult = 'draw';
  if (result === 'draw') myResult = 'draw';
  else if (result === myColor) myResult = 'win';
  else myResult = 'loss';

  try {
    await saveGameResult(currentUser.uid, myResult, opponentName, gameCode, myColor);
    // Refrescar stats en memoria
    if (myResult === 'win')  currentProfile.wins   = (currentProfile.wins   || 0) + 1;
    if (myResult === 'loss') currentProfile.losses = (currentProfile.losses || 0) + 1;
    if (myResult === 'draw') currentProfile.draws  = (currentProfile.draws  || 0) + 1;
    updateLobbyHeader();
    await update(ref(db, `rooms/${gameCode}`), { status: 'ended' });
  } catch {}
}

// ─── Arranque ─────────────────────────────────────────────────
showScreen('auth-screen');