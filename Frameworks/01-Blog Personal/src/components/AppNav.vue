<template>
  <nav>
    <div class="nav-logo" @click="close(); $emit('navigate', 'home')">
      Deka's<span> Life</span>
    </div>

    <!-- Desktop links -->
    <ul class="nav-links">
      <li v-for="link in links" :key="link.page">
        <a
          :class="{ active: currentPage === link.page }"
          @click="$emit('navigate', link.page)"
        >{{ link.label }}</a>
      </li>
    </ul>

    <div class="nav-issue">01-Blog Personal</div>

    <!-- Hamburger button (mobile only) -->
    <button class="hamburger" @click="toggle" :aria-expanded="open" aria-label="Menú">
      <span class="bar" :class="{ open }"></span>
      <span class="bar" :class="{ open }"></span>
      <span class="bar" :class="{ open }"></span>
    </button>
  </nav>

  <!-- Mobile drawer -->
  <Transition name="drawer">
    <div v-if="open" class="mobile-menu">
      <ul>
        <li v-for="link in links" :key="link.page">
          <a
            :class="{ active: currentPage === link.page }"
            @click="close(); $emit('navigate', link.page)"
          >{{ link.label }}</a>
        </li>
      </ul>
      <div class="mobile-issue">01-Blog Personal</div>
    </div>
  </Transition>

  <!-- Overlay -->
  <div v-if="open" class="overlay" @click="close"></div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({ currentPage: String })
defineEmits(['navigate'])

const links = [
  { page: 'home',     label: 'Inicio' },
  { page: 'articles', label: 'Artículos' },
  { page: 'about',    label: 'Sobre mí' },
  { page: 'contact',  label: 'Contacto' },
]

const open = ref(false)
const toggle = () => { open.value = !open.value }
const close  = () => { open.value = false }
</script>

<style scoped>
nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4rem;
  height: 64px;
  border-bottom: 1px solid var(--rule);
  background: rgba(17, 16, 16, 0.96);
  backdrop-filter: blur(12px);
}

.nav-logo {
  font-family: var(--serif);
  font-size: 1.1rem;
  font-weight: 900;
  color: var(--heading);
  letter-spacing: -0.02em;
  cursor: pointer;
  white-space: nowrap;
  z-index: 1;
}
.nav-logo span { color: var(--accent); }

/* ── Desktop links ── */
.nav-links {
  display: flex;
  gap: 2.5rem;
  list-style: none;
}
.nav-links a {
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
}
.nav-links a:hover,
.nav-links a.active { color: var(--accent); }

.nav-issue {
  font-family: var(--mono);
  font-size: 0.68rem;
  color: var(--muted);
  letter-spacing: 0.08em;
  white-space: nowrap;
}

/* ── Hamburger ── */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  z-index: 1;
}
.bar {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--heading);
  transition: transform 0.3s ease, opacity 0.3s ease;
  transform-origin: center;
}
/* X animation */
.bar:nth-child(1).open { transform: translateY(7px) rotate(45deg); }
.bar:nth-child(2).open { opacity: 0; transform: scaleX(0); }
.bar:nth-child(3).open { transform: translateY(-7px) rotate(-45deg); }

/* ── Mobile drawer ── */
.mobile-menu {
  display: none;
  position: fixed;
  top: 64px; left: 0; right: 0;
  z-index: 199;
  background: rgba(17, 16, 16, 0.98);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--rule);
  padding: 1.5rem 2rem 2rem;
}
.mobile-menu ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.mobile-menu a {
  display: block;
  font-family: var(--mono);
  font-size: 0.8rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
  text-decoration: none;
  padding: 1rem 0;
  border-bottom: 1px solid var(--rule);
  cursor: pointer;
  transition: color 0.2s;
}
.mobile-menu a:hover,
.mobile-menu a.active { color: var(--accent); }

.mobile-issue {
  font-family: var(--mono);
  font-size: 0.62rem;
  color: var(--muted);
  letter-spacing: 0.1em;
  margin-top: 1.2rem;
  opacity: 0.5;
}

.overlay {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 198;
  background: rgba(0,0,0,0.5);
}

/* ── Drawer transition ── */
.drawer-enter-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.drawer-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.drawer-enter-from   { opacity: 0; transform: translateY(-8px); }
.drawer-leave-to     { opacity: 0; transform: translateY(-8px); }

/* ── Responsive ── */
@media (max-width: 768px) {
  nav { padding: 0 1.5rem; }
  .nav-links  { display: none; }
  .nav-issue  { display: none; }
  .hamburger  { display: flex; }
  .mobile-menu { display: block; }
  .overlay    { display: block; }
}
</style>
