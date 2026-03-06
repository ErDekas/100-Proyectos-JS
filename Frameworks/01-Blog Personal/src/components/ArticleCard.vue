<template>
  <div class="article-card" :class="{ expanded: isOpen }">
    <!-- Header: siempre visible -->
    <div class="card-header" @click="toggle">
      <div class="card-top">
        <div class="card-category">{{ article.category }}</div>
        <div class="card-read-time">{{ article.readTime }}</div>
      </div>
      <h3 class="card-title">{{ article.title }}</h3>
      <p class="card-excerpt">{{ article.excerpt }}</p>
      <div class="card-footer">
        <span class="card-date">{{ article.date }}</span>
        <button class="card-toggle" :aria-expanded="isOpen">
          <span class="toggle-text">{{ isOpen ? 'Cerrar' : 'Leer artículo' }}</span>
          <span class="toggle-icon" :class="{ rotated: isOpen }">↓</span>
        </button>
      </div>
    </div>

    <!-- Body: contenido completo desplegable -->
    <Transition name="expand">
      <div v-if="isOpen" class="card-body">
        <div class="article-divider"></div>
        <div class="article-content">
          <template v-for="(block, i) in article.content" :key="i">
            <h4 v-if="block.type === 'heading'" class="content-heading">
              {{ block.text }}
            </h4>
            <p v-else-if="block.type === 'paragraph'" class="content-paragraph">
              {{ block.text }}
            </p>
            <blockquote v-else-if="block.type === 'quote'" class="content-quote">
              <span class="quote-mark">"</span>
              {{ block.text }}
            </blockquote>
          </template>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({ article: Object })

const isOpen = ref(false)
const toggle = () => { isOpen.value = !isOpen.value }
</script>

<style scoped>
.article-card {
  padding: 0;
  border-right: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
  position: relative;
  overflow: hidden;
  transition: background 0.25s;
}
.article-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 3px; height: 0;
  background: var(--accent);
  transition: height 0.4s;
}
.article-card:hover::before,
.article-card.expanded::before { height: 100%; }
.article-card.expanded { background: var(--surface); }

/* ── Header ── */
.card-header {
  padding: 2.5rem 2rem 2rem;
  cursor: pointer;
}
.card-header:hover .card-title { color: var(--accent); }

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.card-category {
  font-family: var(--mono);
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
}
.card-read-time {
  font-family: var(--mono);
  font-size: 0.6rem;
  color: var(--muted);
  letter-spacing: 0.06em;
}

.card-title {
  font-family: var(--serif);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--heading);
  line-height: 1.3;
  margin-bottom: 0.8rem;
  letter-spacing: -0.01em;
  transition: color 0.2s;
}
.card-excerpt {
  font-size: 0.83rem;
  color: var(--muted);
  line-height: 1.7;
  margin-bottom: 1.5rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-date {
  font-family: var(--mono);
  font-size: 0.6rem;
  color: var(--muted);
  letter-spacing: 0.06em;
}

.card-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: 1px solid var(--rule);
  color: var(--accent);
  font-family: var(--mono);
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 0.35em 0.8em;
  cursor: pointer;
  transition: all 0.2s;
}
.card-toggle:hover { border-color: var(--accent); background: rgba(201,168,108,0.07); }

.toggle-icon {
  display: inline-block;
  transition: transform 0.3s ease;
  font-size: 0.8rem;
}
.toggle-icon.rotated { transform: rotate(180deg); }

/* ── Expandable body ── */
.article-divider {
  height: 1px;
  background: linear-gradient(to right, var(--accent), transparent);
  margin: 0 2rem;
}

.article-content {
  padding: 2rem 2rem 2.5rem;
}

.content-heading {
  font-family: var(--serif);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--heading);
  letter-spacing: -0.01em;
  margin: 1.8rem 0 0.8rem;
}
.content-heading:first-child { margin-top: 0; }

.content-paragraph {
  font-size: 0.88rem;
  color: var(--body);
  line-height: 1.85;
  margin-bottom: 1.1rem;
}

.content-quote {
  border-left: 3px solid var(--accent);
  padding: 0.8rem 1.2rem;
  margin: 1.5rem 0;
  background: rgba(201,168,108,0.04);
  font-style: italic;
  font-size: 0.92rem;
  color: var(--heading);
  line-height: 1.7;
  position: relative;
}
.quote-mark {
  font-family: var(--serif);
  font-size: 2rem;
  color: var(--accent);
  line-height: 0;
  vertical-align: -0.5rem;
  margin-right: 0.2rem;
  opacity: 0.6;
}

/* ── Transition ── */
.expand-enter-active { transition: all 0.35s ease; overflow: hidden; }
.expand-leave-active { transition: all 0.25s ease; overflow: hidden; }
.expand-enter-from   { opacity: 0; max-height: 0; }
.expand-enter-to     { opacity: 1; max-height: 1000px; }
.expand-leave-from   { opacity: 1; max-height: 1000px; }
.expand-leave-to     { opacity: 0; max-height: 0; }
</style>
