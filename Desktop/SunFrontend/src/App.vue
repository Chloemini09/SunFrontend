<script setup>
import { computed } from 'vue'; // Import computed from vue
import { useRoute } from 'vue-router'; // Import useRoute from vue-router
//import JSONLab from './components/JSONLab.vue';
import BHeader from './components/BHeader.vue';

const route = useRoute();

// Computed property to control the visibility of the header
const showHeader = computed(() => route.name !== 'CountBookAPI');
</script>

<template>
  <div class="main-container">
    <header v-if="showHeader">
      <BHeader />
    </header>

    <main class="main-box">
      <router-view></router-view>
    </main>
  </div>
</template>

<style scoped>
/* header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
} */
</style>
