<template>
  <nav>
    <div class="nav-logo" @click="$emit('navigate', 'home')">
      Deka's<span> Life</span>
    </div>

    <ul class="nav-links">
      <li v-for="link in links" :key="link.page">
        <a
          :class="{ active: currentPage === link.page }"
          @click="$emit('navigate', link.page)"
        >{{ link.label }}</a>
      </li>
    </ul>

    <div class="nav-issue">01-Blog Personal</div>
  </nav>
</template>

<script setup>
defineProps({ currentPage: String })
defineEmits(['navigate'])

const links = [
  { page: 'home',     label: 'Inicio' },
  { page: 'articles', label: 'Artículos' },
  { page: 'about',    label: 'Sobre mí' },
  { page: 'contact',  label: 'Contacto' },
]
</script>

<style scoped>
nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4rem;
  height: 64px;
  border-bottom: 1px solid var(--rule);
  background: rgba(17, 16, 16, 0.92);
  backdrop-filter: blur(12px);
}

.nav-logo {
  font-family: var(--serif);
  font-size: 1.1rem;
  font-weight: 900;
  color: var(--heading);
  letter-spacing: -0.02em;
  cursor: pointer;
}
.nav-logo span { color: var(--accent); }

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
}

@media (max-width: 900px) {
  nav { padding: 0 1.5rem; }
  .nav-issue { display: none; }
  .nav-links { gap: 1.2rem; }
}
</style>
