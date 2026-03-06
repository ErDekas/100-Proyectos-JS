<template>
  <div class="home">
    <!-- Masthead -->
    <div class="hero-masthead fade-up delay-1">
      <div>
        <div class="hero-kicker">Diario de un desarrollador</div>
        <div class="hero-tagline">De Jaén al mundo, un proyecto cada vez</div>
      </div>
      <div class="hero-title">Deka's<br><em>Life</em></div>
      <div class="hero-meta">
        <div class="hero-date">VOL. I — Nº 61</div>
        <div class="hero-date">{{ currentDate }}</div>
        <div class="hero-date">Vue.js 3.x</div>
      </div>
    </div>

    <div class="hero-rule"></div>
    <div class="hero-rule-thin"></div>

    <!-- Featured grid -->
    <div class="hero-featured fade-up delay-2">
      <!-- Main featured article -->
      <div class="hero-main-article" @click="$emit('navigate', 'articles')">
        <div>
          <span class="article-category">{{ featured.category }}</span>
          <h2 class="hero-article-title">{{ featured.title }}</h2>
          <p class="hero-article-excerpt">{{ featured.excerpt }}</p>
        </div>
        <div class="hero-article-byline">
          <span>Pablo Linares · Deka</span>
          <span class="byline-dot">◆</span>
          <span>{{ featured.date }}</span>
          <span class="byline-dot">◆</span>
          <span>{{ featured.readTime }}</span>
        </div>
      </div>

      <!-- Sidebar articles -->
      <div class="hero-sidebar">
        <div
          v-for="(art, i) in sidebar"
          :key="art.id"
          class="sidebar-article"
          @click="$emit('navigate', 'articles')"
        >
          <div class="sidebar-num">0{{ i + 1 }}</div>
          <div class="sidebar-title">{{ art.title }}</div>
          <div class="sidebar-meta">{{ art.category }} — {{ art.date }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { articles } from '../data/content.js'

defineEmits(['navigate'])

const currentDate = computed(() =>
  new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
)

const featured = articles[0]
const sidebar  = articles.slice(1, 4)
</script>

<style scoped>
.home {
  min-height: 100vh;
  padding-top: 64px;
  display: flex;
  flex-direction: column;
}

.hero-masthead {
  border-bottom: 1px solid var(--rule);
  padding: 3rem 4rem 2.5rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: end;
  gap: 2rem;
}
.hero-kicker {
  font-family: var(--mono);
  font-size: 0.68rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 0.5rem;
}
.hero-tagline {
  font-family: var(--body-font);
  font-style: italic;
  font-size: 0.9rem;
  color: var(--muted);
  max-width: 220px;
}
.hero-title {
  font-family: var(--serif);
  font-size: clamp(4rem, 9vw, 8rem);
  font-weight: 900;
  line-height: 0.9;
  color: var(--heading);
  letter-spacing: -0.03em;
  text-align: center;
}
.hero-title em { font-style: italic; color: var(--accent); }
.hero-meta { text-align: right; }
.hero-date {
  font-family: var(--mono);
  font-size: 0.68rem;
  color: var(--muted);
  letter-spacing: 0.1em;
  line-height: 2;
}
.hero-rule      { width: 100%; height: 6px; background: var(--heading); }
.hero-rule-thin { width: 100%; height: 2px; background: var(--accent); margin: 3px 0 0; }

.hero-featured {
  display: grid;
  grid-template-columns: 1fr 1fr;
  flex: 1;
}
.hero-main-article {
  padding: 3rem 4rem;
  border-right: 1px solid var(--rule);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  transition: background 0.3s;
}
.hero-main-article:hover { background: var(--surface); }

.hero-article-title {
  font-family: var(--serif);
  font-size: clamp(1.8rem, 3.5vw, 2.8rem);
  font-weight: 700;
  line-height: 1.15;
  color: var(--heading);
  letter-spacing: -0.02em;
  margin-bottom: 1.2rem;
}
.hero-article-excerpt {
  font-size: 0.95rem;
  color: var(--body);
  line-height: 1.8;
  margin-bottom: 2rem;
  max-width: 520px;
}
.hero-article-byline {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-family: var(--mono);
  font-size: 0.68rem;
  color: var(--muted);
  letter-spacing: 0.06em;
}
.byline-dot { color: var(--accent); }

.hero-sidebar { display: flex; flex-direction: column; }
.sidebar-article {
  padding: 2rem;
  border-bottom: 1px solid var(--rule);
  cursor: pointer;
  transition: background 0.3s;
  flex: 1;
}
.sidebar-article:hover { background: var(--surface); }
.sidebar-num {
  font-family: var(--mono);
  font-size: 2.5rem;
  font-weight: 300;
  color: var(--rule);
  line-height: 1;
  margin-bottom: 0.8rem;
}
.sidebar-title {
  font-family: var(--serif);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--heading);
  line-height: 1.3;
  margin-bottom: 0.5rem;
}
.sidebar-meta {
  font-family: var(--mono);
  font-size: 0.62rem;
  color: var(--muted);
  letter-spacing: 0.08em;
}

@media (max-width: 900px) {
  .hero-masthead { grid-template-columns: 1fr; padding: 2rem 1.5rem; }
  .hero-meta { text-align: left; }
  .hero-featured { grid-template-columns: 1fr; }
  .hero-main-article { padding: 2rem 1.5rem; border-right: none; border-bottom: 1px solid var(--rule); }
}
</style>
