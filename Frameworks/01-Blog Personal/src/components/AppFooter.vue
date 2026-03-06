<template>
  <footer>
    <div class="footer-brand">Deka's<span>Life</span></div>
    <div class="footer-copy">
      01-Blog Personal · Construido con Vue.js 3 · {{ year }}
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>

<style scoped>
footer {
  border-top: 1px solid var(--rule);
  padding: 2rem 4rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.footer-brand {
  font-family: var(--serif);
  font-size: 1rem;
  font-weight: 900;
  color: var(--heading);
}
.footer-brand span { color: var(--accent); }
.footer-copy {
  font-family: var(--mono);
  font-size: 0.62rem;
  color: var(--muted);
  letter-spacing: 0.08em;
}

@media (max-width: 900px) {
  footer { padding: 2rem 1.5rem; flex-direction: column; gap: 0.5rem; text-align: center; }
}
</style>
