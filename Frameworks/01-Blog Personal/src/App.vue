<template>
  <div id="app">
    <AppNav :current-page="currentPage" @navigate="goTo" />
    <main>
      <HomeView   v-if="currentPage === 'home'"     @navigate="goTo" />
      <ArticlesView v-if="currentPage === 'articles'" />
      <AboutView  v-if="currentPage === 'about'" />
      <ContactView v-if="currentPage === 'contact'" />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppNav      from './components/AppNav.vue'
import AppFooter   from './components/AppFooter.vue'
import HomeView    from './views/HomeView.vue'
import ArticlesView from './views/ArticlesView.vue'
import AboutView   from './views/AboutView.vue'
import ContactView from './views/ContactView.vue'

const currentPage = ref('home')

const goTo = (page) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
