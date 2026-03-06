<template>
  <div class="articles-page">
    <div class="section-header fade-up delay-1">
      <h2 class="section-title">Artículos</h2>
      <span class="section-count">{{ filtered.length }} entradas</span>
    </div>

    <div class="filter-bar fade-up delay-2">
      <button
        v-for="cat in categories"
        :key="cat"
        class="filter-btn"
        :class="{ active: activeFilter === cat }"
        @click="activeFilter = cat"
      >{{ cat }}</button>
    </div>

    <div class="articles-grid fade-up delay-3">
      <ArticleCard
        v-for="article in filtered"
        :key="article.id"
        :article="article"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { articles } from '../data/content.js'
import ArticleCard from '../components/ArticleCard.vue'

const activeFilter = ref('Todos')

const categories = computed(() => {
  const cats = [...new Set(articles.map(a => a.category))]
  return ['Todos', ...cats]
})

const filtered = computed(() =>
  activeFilter.value === 'Todos'
    ? articles
    : articles.filter(a => a.category === activeFilter.value)
)
</script>

<style scoped>
.articles-page { padding: 8rem 4rem 6rem; }

.filter-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}
.filter-btn {
  font-family: var(--mono);
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 0.4em 1em;
  border: 1px solid var(--rule);
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.2s;
}
.filter-btn:hover { border-color: var(--accent); color: var(--accent); }
.filter-btn.active { background: var(--accent); color: var(--ink); border-color: var(--accent); }

.articles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid var(--rule);
}

@media (max-width: 900px) {
  .articles-page { padding: 6rem 1.5rem 4rem; }
  .articles-grid { grid-template-columns: 1fr; }
}
</style>
