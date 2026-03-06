<template>
  <div class="contact-page">
    <div class="contact-grid">
      <!-- Left: intro + links -->
      <div class="contact-intro fade-up delay-1">
        <h2 class="contact-big">¿Hablamos<br>de <em>código</em>?</h2>
        <p class="contact-text">
          Si estás construyendo algo interesante, tienes una idea para colaborar,
          o simplemente quieres hablar sobre videojuegos y JavaScript hasta las 3 de la madrugada — estoy aquí.
        </p>
        <div class="contact-links">
          <a
            v-for="link in socialLinks"
            :key="link.label"
            class="contact-link"
            :href="link.url"
            target="_blank"
            rel="noopener"
          >
            <span class="link-icon">{{ link.icon }}</span>
            <span>{{ link.label }}</span>
          </a>
        </div>
      </div>

      <!-- Right: form -->
      <div class="contact-form fade-up delay-2">
        <div v-if="!sent">
          <div class="form-group">
            <label class="form-label">Nombre</label>
            <input class="form-input" type="text" v-model="form.name" placeholder="Tu nombre" />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input class="form-input" type="email" v-model="form.email" placeholder="tu@email.com" />
          </div>
          <div class="form-group">
            <label class="form-label">Mensaje</label>
            <textarea class="form-textarea" v-model="form.message" placeholder="Cuéntame..."></textarea>
          </div>
          <button class="btn-send" @click="submit">Enviar mensaje →</button>
        </div>

        <div v-else class="form-success">
          <div class="success-icon">✦</div>
          <div class="success-title">Mensaje enviado</div>
          <div class="success-body">Gracias {{ form.name }}. Te respondo pronto desde pabletor0505@gmail.com</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { socialLinks } from '../data/content.js'

const form = ref({ name: '', email: '', message: '' })
const sent  = ref(false)

const submit = () => {
  if (form.value.name && form.value.email && form.value.message) {
    sent.value = true
  }
}
</script>

<style scoped>
.contact-page { padding: 8rem 4rem 6rem; }

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6rem;
}

.contact-big {
  font-family: var(--serif);
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 900;
  color: var(--heading);
  letter-spacing: -0.03em;
  line-height: 1.05;
  margin-bottom: 1.5rem;
}
.contact-big em { font-style: italic; color: var(--accent); }

.contact-text {
  font-size: 0.95rem;
  color: var(--muted);
  line-height: 1.85;
  margin-bottom: 2.5rem;
}

.contact-links { display: flex; flex-direction: column; gap: 1rem; }
.contact-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  color: var(--body);
  text-decoration: none;
  padding: 1rem;
  border: 1px solid var(--rule);
  transition: all 0.2s;
}
.contact-link:hover { border-color: var(--accent); color: var(--accent); background: var(--surface); }
.link-icon { font-size: 1.1rem; }

.form-group { margin-bottom: 1.5rem; }
.form-label {
  display: block;
  font-family: var(--mono);
  font-size: 0.65rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 0.5rem;
}
.form-input, .form-textarea {
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--rule);
  color: var(--heading);
  font-family: var(--body-font);
  font-size: 0.9rem;
  padding: 0.85rem 1rem;
  outline: none;
  transition: border-color 0.2s;
  resize: none;
}
.form-input:focus, .form-textarea:focus { border-color: var(--accent); }
.form-textarea { min-height: 130px; }

.btn-send {
  width: 100%;
  background: var(--accent);
  color: var(--ink);
  border: none;
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-weight: 500;
  padding: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-send:hover { background: var(--heading); }

.form-success {
  padding: 3rem;
  border: 1px solid var(--accent);
  background: rgba(201,168,108,0.05);
  text-align: center;
}
.success-icon {
  font-family: var(--serif);
  font-size: 2.5rem;
  color: var(--accent);
  margin-bottom: 1rem;
}
.success-title {
  font-family: var(--mono);
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 0.8rem;
}
.success-body {
  font-size: 0.85rem;
  color: var(--muted);
}

@media (max-width: 900px) {
  .contact-page { padding: 6rem 1.5rem 4rem; }
  .contact-grid { grid-template-columns: 1fr; gap: 3rem; }
}
</style>
