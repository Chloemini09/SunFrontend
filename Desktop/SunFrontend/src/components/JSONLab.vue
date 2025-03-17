<script setup>
import { ref } from 'vue'

const showMessage = ref(false)

// Activity 13: Toggle the message visibility when the button is clicked.
const toggleMessage = () => {
  showMessage.value = !showMessage.value
}
</script>

<!-- JSONLab.vue -->
<template>
  <div class="json-lab">
    <h1>🗄️ W2. JSON Data & Vue Directives Lab</h1>

    <section class="lab-section">
      <h2>v-if & v-else</h2>
      <p>Toggle visibility based on a condition.</p>
      <!-- Activity 13: Toggle the message visibility when the button is clicked. -->
      <button @click="showMessage = !showMessage">Toggle Message</button>
      <p class="message success" v-if="showMessage">✨ You're a Vue superstar! ✨</p>
      <p>Click the button to see a message.</p>
    </section>
  </div>
</template>

<style scoped>
.json-lab {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 80vw;
  margin: 0 auto;
  padding: 20px;
  background-color: #f4f4f4;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h1,
h2 {
  color: #333;
}
h1 {
  text-align: center;
}

.lab-section {
  background-color: white;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.message {
  padding: 10px;
  border-radius: 5px;
  margin-top: 10px;
}

.success {
  background-color: #e7faf3;
  color: #42b883;
  border: 1px solid #42b883;
}
</style>
