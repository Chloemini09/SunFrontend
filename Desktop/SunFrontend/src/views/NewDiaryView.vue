<template>
    <div class="new-diary-container">
      <!-- Header -->
      <header class="header">
        <img src="@/assets/logo.png" alt="Logo" class="logo" />
        <div class="header-text">
          <h1>New Diary Entry</h1>
          <p>{{ currentDateFormatted }}</p>
        </div>
      </header>
  
      <!-- 返回按钮 -->
      <button class="back-btn" @click="goBack">← Back</button>
  
      <!-- Diary Entry Form -->
      <div class="diary-form">
        <label for="title">Title:</label>
        <input
          type="text"
          v-model="title"
          id="title"
          placeholder="Enter title"
        />
  
        <label for="date">Date:</label>
        <input
          type="date"
          v-model="date"
          id="date"
          :max="currentDate"
        />
  
        <label for="content">Content:</label>
        <textarea
          v-model="content"
          id="content"
          placeholder="Write your diary content..."
        ></textarea>
  
        <button @click="saveDiary" class="save-btn">Save Entry</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { getFirestore, collection, addDoc } from 'firebase/firestore'
  import { getAuth } from 'firebase/auth'
  import { useRouter } from 'vue-router'
  
  const db = getFirestore()
  const auth = getAuth()
  const user = auth.currentUser
  const router = useRouter()
  
  // Diary Entry Data
  const title = ref('')
  const content = ref('')
  
  // Set current date in YYYY-MM-DD format for default value
  const currentDate = new Date().toISOString().split('T')[0]
  const date = ref(currentDate)
  
  // Format current date for display in header
  const currentDateFormatted = new Date().toLocaleDateString()
  
  const goBack = () => {
    router.go(-1)
  }
  
  const saveDiary = async () => {
    if (title.value.trim() === '' || content.value.trim() === '') {
      alert('Please enter both title and content.')
      return
    }
  
    await addDoc(collection(db, 'diaryEntries'), {
      email: user.email,
      title: title.value,
      date: date.value,
      content: content.value,
    })
  
    // Clear fields after saving
    title.value = ''
    date.value = currentDate
    content.value = ''
  
    // Redirect to diary list view
    router.push('/diary')
  }
  </script>
  
  <style scoped>
  .new-diary-container {
    max-width: 600px;
    margin: auto;
    padding: 20px;
  }
  
  .header {
    display: flex;
    align-items: center;
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
  
  /* 返回按钮 */
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
  
  .diary-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-top: 20px;
  }
  
  label {
    font-weight: bold;
  }
  
  input[type='text'],
  input[type='date'],
  textarea {
    width: 100%;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    font-size: 16px;
  }
  
  textarea {
    min-height: 150px;
  }
  
  .save-btn {
    background-color: #4caf50; /* Green color */
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
  }
  
  .save-btn:hover {
    background-color: #45a049;
  }
  </style>
  