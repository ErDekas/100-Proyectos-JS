<template>
  <div class="about-page">
    <div class="about-grid">
      <!-- Aside: portrait + stats -->
      <div class="about-aside fade-up delay-1">
        <div class="about-portrait">
          <img v-if="author.photo" :src="author.photo" :alt="author.name" class="portrait-img" />
          <span v-else class="portrait-placeholder">✦</span>
        </div>
        <div class="about-stats">
          <div class="stat-item" v-for="stat in stats" :key="stat.label">
            <div class="stat-num">{{ stat.num }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <!-- Main content -->
      <div class="about-content fade-up delay-2">
        <div class="section-header">
          <h2 class="section-title">Sobre mí</h2>
        </div>

        <div class="about-name">Hola,<br>soy <em>Deka</em></div>
        <div class="about-role">{{ author.role }}</div>

        <p class="about-bio">{{ author.bio }}</p>

        <p class="about-body" v-for="(p, i) in author.about" :key="i">{{ p }}</p>

        <div class="hobbies">
          <div class="hobbies-label">Aficiones</div>
          <div class="hobbies-list">
            <span class="hobby-tag" v-for="h in author.hobbies" :key="h">{{ h }}</span>
          </div>
        </div>

        <div class="skills-label">Stack actual</div>
        <div class="skills-grid">
          <div class="skill-tag" v-for="skill in author.skills" :key="skill">{{ skill }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { author, stats } from '../data/content.js'
</script>

<style scoped>
.about-page { padding: 8rem 4rem 6rem; }

.about-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 6rem;
  align-items: start;
}

.about-portrait {
  width: 100%;
  aspect-ratio: 3/4;
  background: var(--surface2);
  border: 1px solid var(--rule);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--serif);
  font-size: 5rem;
  color: var(--rule);
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;
}
.about-portrait::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 60%, rgba(201,168,108,0.08));
  pointer-events: none;
}
.portrait-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  display: block;
}
.portrait-placeholder {
  font-family: var(--serif);
  font-size: 5rem;
  color: var(--rule);
}

.about-stats { display: flex; flex-direction: column; gap: 1rem; }
.stat-item {
  padding: 1rem;
  border: 1px solid var(--rule);
  background: var(--surface);
}
.stat-num {
  font-family: var(--serif);
  font-size: 2rem;
  font-weight: 900;
  color: var(--accent);
  line-height: 1;
}
.stat-label {
  font-family: var(--mono);
  font-size: 0.62rem;
  color: var(--muted);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-top: 0.2rem;
}

.about-name {
  font-family: var(--serif);
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  font-weight: 900;
  color: var(--heading);
  letter-spacing: -0.03em;
  line-height: 1;
  margin-bottom: 0.5rem;
}
.about-name em { font-style: italic; color: var(--accent); }
.about-role {
  font-family: var(--mono);
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 2rem;
}
.about-bio {
  font-size: 1.05rem;
  color: var(--body);
  line-height: 1.85;
  margin-bottom: 2rem;
  border-left: 3px solid var(--accent);
  padding-left: 1.5rem;
  font-style: italic;
}
.about-body {
  font-size: 0.95rem;
  color: var(--muted);
  line-height: 1.85;
  margin-bottom: 1.5rem;
}

.hobbies { margin: 2rem 0 1rem; }
.hobbies-label, .skills-label {
  font-family: var(--mono);
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 0.8rem;
}
.hobbies-list { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 2rem; }
.hobby-tag {
  font-family: var(--mono);
  font-size: 0.68rem;
  padding: 0.4em 0.9em;
  border: 1px solid var(--accent2);
  color: var(--body);
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.8rem;
  margin-top: 0.5rem;
}
.skill-tag {
  font-family: var(--mono);
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.6em 1em;
  border: 1px solid var(--rule);
  color: var(--muted);
  text-align: center;
  transition: all 0.2s;
}
.skill-tag:hover { border-color: var(--accent); color: var(--accent); background: rgba(201,168,108,0.05); }

@media (max-width: 900px) {
  .about-page { padding: 6rem 1.5rem 4rem; }
  .about-grid { grid-template-columns: 1fr; gap: 3rem; }
  .skills-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
