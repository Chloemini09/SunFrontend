<template>
  <div class="admin-feedback-view">
    <header class="header">
      <img src="@/assets/logo.png" alt="Health Test Logo" class="logo" />
      <div class="header-text">
        <h1>Manage User Feedback</h1>
        <p>{{ formattedDate }}</p>
      </div>
    </header>
    <button class="back-btn" @click="goBack">← Back</button>
    <section class="feedback-search">
      <h2>Search Feedback</h2>
      <div class="search-filters">
        <label for="filterType">Select Filter:</label>
        <select v-model="selectedFilter" id="filterType">
          <option value="username">User Name</option>
          <option value="userEmail">Email</option>
          <option value="date">Date</option>
        </select>
      </div>
      <input type="text" v-model="searchTerm" :placeholder="`Search by ${selectedFilter}`" />
      <button @click="filterFeedbacks" class="green-button">Search</button>
      <button @click="clearSearch" class="green-button">Clear</button>
    </section>

    <section class="feedback-list">
      <h2>User Feedback</h2>
      <div v-if="filteredFeedbacks.length === 0">No feedback found.</div>
      <div v-else class="feedback-cards">
        <div class="feedback-card" v-for="feedback in paginatedFeedbacks" :key="feedback.id">
          <h3>{{ feedback.username }}</h3>
          <p><strong>Email:</strong> {{ feedback.userEmail }}</p>
          <p><strong>Date:</strong> {{ new Date(feedback.timestamp.seconds * 1000).toLocaleDateString() }}</p>
          <p><strong>Advice:</strong> {{ feedback.advice }}</p>
          <p><strong>Average Rating:</strong> {{ calculateAverageRating(feedback.ratings).toFixed(2) }}</p>
          <button @click="showMore(feedback)" class="green-button">Show More</button>
        </div>
      </div>
      <div class="pagination-controls">
        <button @click="prevPage" :disabled="currentPage === 0" class="slider-button">&#8249;</button>
        <span>Page {{ currentPage + 1 }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage >= totalPages - 1" class="slider-button">&#8250;</button>
      </div>
    </section>

    <div v-if="selectedFeedback" class="modal" @click.self="closeModal">
      <div class="modal-content">
        <h2>Feedback Details</h2>
        <p><strong>User Name:</strong> {{ selectedFeedback.username }}</p>
        <p><strong>Email:</strong> {{ selectedFeedback.userEmail }}</p>
        <p><strong>Date:</strong> {{ new Date(selectedFeedback.timestamp.seconds * 1000).toLocaleDateString() }}</p>
        <p><strong>Advice:</strong> {{ selectedFeedback.advice }}</p>
        <div v-for="(rating, index) in selectedFeedback.ratings" :key="index">
          <p><strong>Question {{ index + 1 }}:</strong> {{ rating.question }}</p>
          <p><strong>Rating:</strong> {{ rating.rating }}</p>
        </div>
        <button @click="closeModal" class="green-button">Close</button>
      </div>
    </div>
    <div class="export-section">
      <button @click="exportToCSV" class="btn-export">Export CSV</button>
      <button @click="exportToPDF" class="btn-export">Export PDF</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';
import { jsPDF } from 'jspdf';
import { useRouter } from 'vue-router'

const router = useRouter();

const db = getFirestore();
const feedbacks = ref([]);
const filteredFeedbacks = ref([]);
const searchTerm = ref('');
const formattedDate = new Date().toLocaleDateString();
const selectedFilter = ref('username');
const selectedFeedback = ref(null);
const currentPage = ref(0);
const itemsPerPage = 6;

const goBack = () => {
  router.push('/admin')
}
const fetchFeedbacks = async () => {
  const querySnapshot = await getDocs(collection(db, 'feedback'));
  feedbacks.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  filteredFeedbacks.value = feedbacks.value;
};

const filterFeedbacks = () => {
  const term = searchTerm.value.toLowerCase();
  filteredFeedbacks.value = feedbacks.value.filter(feedback => {
    return feedback[selectedFilter.value].toLowerCase().includes(term);
  });
  currentPage.value = 0;
};

const clearSearch = () => {
  searchTerm.value = '';
  filteredFeedbacks.value = feedbacks.value;
  currentPage.value = 0;
};

const calculateAverageRating = (ratings) => {
  if (!ratings || ratings.length === 0) return 0;
  const total = ratings.reduce((sum, rating) => sum + rating.rating, 0);
  return total / ratings.length;
};

const showMore = (feedback) => {
  selectedFeedback.value = feedback;
};

const closeModal = () => {
  selectedFeedback.value = null;
};

const paginatedFeedbacks = computed(() => {
  const start = currentPage.value * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredFeedbacks.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredFeedbacks.value.length / itemsPerPage));

const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) currentPage.value++;
};

const prevPage = () => {
  if (currentPage.value > 0) currentPage.value--;
};
const exportToCSV = () => {
  const csvContent = [
    ['Username', 'Email', 'Date', 'Advice', 'Average Rating', ...feedbacks.value[0].ratings.map((_, index) => `Question ${index + 1} Rating`)],
    ...filteredFeedbacks.value.map(feedback => [
      feedback.username,
      feedback.userEmail,
      new Date(feedback.timestamp.seconds * 1000).toLocaleDateString(),
      `"${feedback.advice}"`,
      calculateAverageRating(feedback.ratings).toFixed(2),
      ...feedback.ratings.map(rating => rating.rating)
    ])
  ].map(e => e.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', 'user_feedback.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportToPDF = () => {
  const doc = new jsPDF();
  doc.text('User Feedback List', 10, 10);
  let y = 20;

  filteredFeedbacks.value.forEach(feedback => {
    doc.text(`Username: ${feedback.username}`, 10, y);
    doc.text(`Email: ${feedback.userEmail}`, 10, y + 10);
    doc.text(`Date: ${new Date(feedback.timestamp.seconds * 1000).toLocaleDateString()}`, 10, y + 20);
    doc.text(`Advice: ${feedback.advice}`, 10, y + 30);
    doc.text(`Average Rating: ${calculateAverageRating(feedback.ratings).toFixed(2)}`, 10, y + 40);
    
    let questionY = y + 50;
    feedback.ratings.forEach((rating, index) => {
      if (questionY > 270) {
        doc.addPage();
        questionY = 20;
      }
      doc.text(`Question ${index + 1} Rating: ${rating.rating}`, 10, questionY);
      questionY += 10;
    });
    
    y = questionY + 10;

    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save('user_feedback.pdf');
};

onMounted(fetchFeedbacks);

</script>

<style scoped>
.admin-feedback-view {
  max-width: 1000px;
  margin: auto;
  padding: 20px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.logo {
  width: 60px;
  height: auto;
}
.header-text {
  flex-grow: 1;
  text-align: right;
}
.feedback-search, .feedback-list {
  margin-bottom: 30px;
}
.search-filters {
  margin-bottom: 10px;
}
.feedback-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
.feedback-card {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}
.green-button {
  margin-top: 10px;
  padding: 8px 16px;
  border: none;
  background-color: #4caf50;
  color: white;
  cursor: pointer;
  border-radius: 4px;
}
.green-button:hover {
  background-color: #45a049;
}
input[type="text"] {
  margin-bottom: 10px;
  padding: 8px;
  width: calc(100% - 16px);
}
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
}
.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  gap: 10px;
}
.slider-button {
  background-color: #4caf50;
  color: white;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  transition: background-color 0.3s;
}
.slider-button:hover {
  background-color: #45a049;
}
.slider-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.export-section {
  text-align: center;
  margin-top: 20px;
}
.btn-export {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 1rem;
  border-radius: 5px;
}

.btn-export:hover {
  background-color: #388e3c;
}
.back-btn {
  margin-right: 5px;
  padding: 8px 16px;
  border: none;
  background-color: #4caf50;
  color: white;
  cursor: pointer;
  border-radius: 4px;
}
.back-btn:hover {
  background-color: #45a049;
}
</style>