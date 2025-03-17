<template>
  <div class="diary-list-container">
    <header class="header">
      <img src="@/assets/logo.png" alt="Logo" class="logo" />
      <div class="header-text">
        <h1>Diary Entries</h1>
        <p>{{ currentDate }}</p>
      </div>
    </header>
    <button class="back-btn" @click="goBack">← Back</button>
    <section class="filters">
      <label>
        Sort by Date: 
        <select v-model="dateSortOrder" @change="sortByDate">
          <option value="recent">Most Recent</option>
          <option value="oldest">Oldest First</option>
        </select>
      </label>
    </section>

    <div class="diary-grid">
      <div class="diary-item" v-for="(diary, index) in paginatedDiaries" :key="diary.date">
        <p><strong>Title:</strong> {{ diary.title }}</p>
        <p><strong>Date:</strong> {{ formatDate(new Date(diary.date)) }}</p>

        <p><strong>Content:</strong> 
          <span>{{ diary.content.slice(0, 0) }}...</span>
          <button @click="openModal(diary)" class="toggle-btn">Show More</button>
        </p>
      </div>
    </div>

    <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1" class="pagination-btn">Previous</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-btn">Next</button>
    </div>

    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h2>{{ selectedDiary.title }}</h2>
        <p><strong>Date:</strong> {{ formatDate(new Date(selectedDiary.date)) }}</p>
        <p><strong>Content:</strong> {{ selectedDiary.content }}</p>
        <button @click="closeModal" class="close-btn">Close</button>
      </div>
    </div>

    <div class="new-diary-button" @click="goToNewDiary">
      <span class="plus-icon">+</span>
      <p>Create new diary</p>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const db = getFirestore()
const auth = getAuth()
const user = auth.currentUser
const router = useRouter()

const goBack = () => {
  router.push('/home')
}

const goToNewDiary = () => {
  router.push('/newdiary')
}

const currentDate = new Date().toLocaleDateString()

const diaries = ref([])
const currentPage = ref(1)
const itemsPerPage = 10
const dateSortOrder = ref('recent')

const isModalOpen = ref(false)
const selectedDiary = ref({})

const openModal = (diary) => {
  selectedDiary.value = diary
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const getDiaries = async () => {
  const q = query(collection(db, 'diaryEntries'), where('email', '==', user.email))
  const querySnapshot = await getDocs(q)
  diaries.value = querySnapshot.docs.map(doc => doc.data())
}

getDiaries()

const sortByDate = () => {
  if (dateSortOrder.value === 'recent') {
    diaries.value.sort((a, b) => new Date(b.date) - new Date(a.date))
  } else {
    diaries.value.sort((a, b) => new Date(a.date) - new Date(b.date))
  }
}

const paginatedDiaries = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return diaries.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(diaries.value.length / itemsPerPage))

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const formatDate = (date) => {
  return date.toLocaleDateString()
}
</script>
<style scoped>
.diary-list-container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
  position: relative;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #ddd;
}
.logo {
  width: 60px;
  height: auto;
}
.header-text {
  flex-grow: 1;
  text-align: right;
}
.back-btn {
  background-color: transparent;
  border: none;
  font-size: 1.2rem;
  color: #4caf50;
  cursor: pointer;
  margin-top: 20px;
  margin-bottom: 20px;
}
.back-btn:hover {
  text-decoration: underline;
}
.filters {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}
.diary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}
.diary-item {
  border-radius: 10px;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  min-height: 150px;
  width: 100%;
  max-width: 350px;
  height: auto;
}
.toggle-btn {
  background: none;
  border: none;
  color: #4CAF50;
  cursor: pointer;
  margin-left: 5px;
}
.toggle-btn:hover {
  text-decoration: underline;
}
.pagination {
  margin-top: 20px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.pagination-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 1rem;
  border-radius: 50px;
  transition: background-color 0.3s, box-shadow 0.3s;
}

.pagination-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #388e3c;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.new-diary-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  text-align: center;
}
.plus-icon {
  font-size: 40px;
  background-color: #4CAF50;
  color: white;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.new-diary-button p {
  margin-top: 10px;
  color: #4CAF50;
  font-size: 16px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 500px;
  width: 100%;
}
.close-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  margin-top: 20px;
  border-radius: 5px;
}
</style>
