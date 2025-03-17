<template>
  <div class="test-history-container">
    <header class="header">
      <img src="@/assets/logo.png" alt="Health Test Logo" class="logo" />
      <div class="header-text">
        <h1>Past Mental Health Test Records</h1>
        <p>{{ currentDate }}</p>
      </div>
    </header>

    <button class="back-btn" @click="goBack">← Back</button>

    <section class="filters">
      <label>Start Date: <input type="date" v-model="startDate" /></label>
      <label>End Date: <input type="date" v-model="endDate" /></label>
      <label>
        Sort by Date: 
        <select v-model="dateSortOrder" @change="sortByDate">
          <option value="recent">Most Recent</option>
          <option value="oldest">Oldest First</option>
        </select>
      </label>

      <label>
        Sort by Score: 
        <select v-model="scoreSortOrder" @change="sortByScore">
          <option value="asc">Less to More</option>
          <option value="desc">More to Less</option>
        </select>
      </label>
    </section>

    <section v-if="filteredTestRecords.length > 0" class="records">
      <div class="record-item" v-for="record in paginatedRecords" :key="record.date">
        <p><strong>Date:</strong> {{ formatDate(record.date) }}</p>
        <p><strong>Score:</strong> {{ record.score }}</p>
      </div>
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1" class="pagination-btn">Previous</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-btn">Next</button>
      </div>

    </section>

    <section v-else>
      <p>No test records found.</p>
    </section>

    <section class="average-score">
      <h3>Average Score: {{ averageScore.toFixed(2) }}</h3>
      <p>{{ recommendation }}</p>
    </section>
    <section class="export-section">
      <button @click="exportData('csv')" class="export-btn">Export CSV</button>
      <button @click="exportData('pdf')" class="export-btn">Export PDF</button>
      <button @click="emailReport" class="export-btn">Email Me Report</button>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getFirestore, collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { useRouter } from 'vue-router'

import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { getFunctions, httpsCallable } from 'firebase/functions'
onMounted(async () => {
  await getTestRecords()
})
const db = getFirestore()
const auth = getAuth()
const user = auth.currentUser
const functions = getFunctions()
const router = useRouter()
  const goBack = () => {
    router.push('/home')
  }
const testRecords = ref([])
const startDate = ref('')
const endDate = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const dateSortOrder = ref('recent') 
const scoreSortOrder = ref('asc')
const currentDate = new Date().toLocaleDateString()

const getTestRecords = async () => {
  if (!user) {
    console.error('No user logged in!')
    return
  }

  let q = query(collection(db, 'healthTestResults'), where('email', '==', user.email))

  if (startDate.value && endDate.value) {
    const startTimestamp = Timestamp.fromDate(new Date(new Date(startDate.value).setHours(0, 0, 0, 0))) 
    const endTimestamp = Timestamp.fromDate(new Date(new Date(endDate.value).setHours(23, 59, 59, 999))) 

    q = query(
      collection(db, 'healthTestResults'),
      where('email', '==', user.email),
      where('date', '>=', startTimestamp),
      where('date', '<=', endTimestamp)
    )
  }

  try {
    const querySnapshot = await getDocs(q)
    testRecords.value = querySnapshot.docs.map(doc => doc.data())

    sortByDate()
  } catch (error) {
    console.error('Error fetching test records:', error)
  }
}

getTestRecords()

const sortByDate = () => {
  if (dateSortOrder.value === 'recent') {
    testRecords.value.sort((a, b) => new Date(b.date.seconds * 1000) - new Date(a.date.seconds * 1000))
  } else {
    testRecords.value.sort((a, b) => new Date(a.date.seconds * 1000) - new Date(b.date.seconds * 1000))
  }
}

const sortByScore = () => {
  if (scoreSortOrder.value === 'asc') {
    testRecords.value.sort((a, b) => a.score - b.score)
  } else {
    testRecords.value.sort((a, b) => b.score - a.score)
  }
}

const filteredTestRecords = computed(() => {
  return testRecords.value.filter(record => {
    return (!startDate.value || record.date >= Timestamp.fromDate(new Date(startDate.value))) &&
           (!endDate.value || record.date <= Timestamp.fromDate(new Date(endDate.value)))
  });
});


const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredTestRecords.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredTestRecords.value.length / itemsPerPage))

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const averageScore = computed(() => {
  if (testRecords.value.length === 0) return 0
  const total = testRecords.value.reduce((sum, record) => sum + record.score, 0)
  return total / testRecords.value.length
})

const recommendation = computed(() => {
  if (averageScore.value <= 20) {
    return "Your mental health seems to be in a great state. Keep it up!"
  } else if (averageScore.value <= 40) {
    return "It seems like you might be facing some challenges. Consider talking to a friend or professional."
  } else {
    return "We recommend that you seek support from a mental health professional."
  }
})

const formatDate = (timestamp) => {
  const date = timestamp.toDate()
  return date.toLocaleDateString()
}


const exportData = (format) => {
  if (format === 'csv') {
    const csvContent = generateCSV()
    downloadFile(csvContent, 'test_history.csv', 'text/csv')
  } else if (format === 'pdf') {
    generatePDF()
  }
}
const generateCSV = () => {
  const headers = ['Date', 'Score']
  const rows = testRecords.value.map(record => [
    formatDate(record.date),
    record.score
  ])
  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

const generatePDF = () => {
  const doc = new jsPDF()
  doc.text('Test History Report', 14, 15)
  doc.autoTable({
    head: [['Date', 'Score']],
    body: testRecords.value.map(record => [formatDate(record.date), record.score]),
    startY: 20
  })
  doc.save('test_history.pdf')
}

const downloadFile = (content, fileName, contentType) => {
  const a = document.createElement('a')
  const file = new Blob([content], { type: contentType })
  a.href = URL.createObjectURL(file)
  a.download = fileName
  a.click()
}

const emailReport = async () => {
  const csvContent = generateCSV();
  try {
    const response = await fetch("https://us-central1-mindwell-f5a26.cloudfunctions.net/sendCSVReport", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        csvContent,
      }),
    });
    const result = await response.json();
    if (response.ok) {
      alert("Report sent successfully!");
    } else {
      throw new Error(result.error || "Failed to send report.");
    }
  } catch (error) {
    console.error("Error sending report:", error);
    alert(`Failed to send report. Error: ${error.message}`);
  }
};


</script>

<style scoped>
.test-history-container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
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
.records {
  margin-top: 20px;
}
.record-item {
  padding: 10px;
  border-bottom: 1px solid #ddd;
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

.filters {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}
.filters label {
  display: flex;
  align-items: center;
  gap: 10px;
}
.filters button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 1rem;
  border-radius: 5px;
}
.filters button:hover {
  background-color: #45a049;
}
.average-score {
  margin-top: 20px;
  text-align: center;
}
.export-section {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.export-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 1rem;
  border-radius: 5px;
}

.export-btn:hover {
  background-color: #45a049;
}
</style>
