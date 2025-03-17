<template>
    <div class="health-test">
      <header class="header">
        <img src="@/assets/logo.png" alt="Health Test Logo" class="logo" />
        <div class="header-text">
          <h1>Health Test</h1>
          <p>{{ currentDate }}</p>
        </div>
      </header>
      
      <button class="back-btn" @click="goBack">← Back</button>

      <form @submit.prevent="submitTest">
        <div v-for="(question, index) in questionList" :key="index" class="question-block">
          <h2>{{ index + 1 }}. {{ question.text }}</h2>
          <div class="options">
            <label v-for="(option, idx) in question.options" :key="idx">
              <input type="radio" :name="'question-' + index" :value="option.score" v-model="answers[index]" />
              {{ option.text }}
            </label>
          </div>
        </div>
        
        <button type="submit" class="submit-btn">Submit</button>
      </form>
  
      <button @click="goHome" class="back-btn">Return to Home</button>
  
      <div v-if="showWarning" class="warning-modal">
        <div class="warning-content">
          <h2>Try harder! Believe yourself!</h2>
          <p>unfinished questions:</p>
          <ul>
            <li v-for="(q, idx) in incompleteQuestions" :key="idx">Question {{ q + 1 }}</li>
          </ul>
          <button @click="closeWarning" class="close-btn">Close</button>
        </div>
      </div>
  
      <div v-if="showModal" class="modal">
        <div class="modal-content">
          <h2>Your Test Score: {{ score }}/100</h2>
          <p>{{ recommendation }}</p>
          <button @click="closeModal" class="close-btn">Close</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore'
  import questions from '@/assets/Questions.js'
  import { useRouter } from 'vue-router'
  import { getAuth } from 'firebase/auth'
  
  const db = getFirestore()
  const auth = getAuth()
  const user = auth.currentUser
  const router = useRouter()
  
  const questionList = ref(questions)
  const answers = ref(Array(questionList.value.length).fill(null))
  const score = ref(0)
  const showModal = ref(false)
  const showWarning = ref(false)
  const incompleteQuestions = ref([])
  const recommendation = ref("")
  const currentDate = new Date().toLocaleDateString()

  const goBack = () => {
    router.push('/home')
  }

  const calculateScore = () => {
    return answers.value.reduce((total, score) => total + (score ? parseInt(score) : 0), 0)
  }
  
  const generateRecommendation = (score) => {
    if (score <= 20) {
      return "Your mental health seems to be in a great state. Keep it up!"
    } else if (score <= 40) {
      return "It seems like you might be facing some challenges. Consider talking to a friend or professional."
    } else {
      return "We recommend that you seek support from a mental health professional."
    }
  }
  
  const checkCompletion = () => {
    incompleteQuestions.value = answers.value.map((answer, index) => answer === null ? index: null).filter(index => index !== null)
    return incompleteQuestions.value.length === 0
  }
  
  const submitTest = async () => {
    if (!user) {
      console.error('No user logged in!');
      alert('Please log in to like a course.');
      return
    }

    if (!checkCompletion()) {
      showWarning.value = true
      return
    }
  
    score.value = calculateScore()
  
    try {
      await addDoc(collection(db, 'healthTestResults'), {
        username: user.displayName || 'Anonymous',
        email: user.email,
        score: score.value,
        date: Timestamp.now()
      })
      
      recommendation.value = generateRecommendation(score.value)
      
      showModal.value = true
  
    } catch (error) {
      console.error('Error submitting the test:', error)
    }
  }
  
  // 关闭弹窗
  const closeModal = () => {
    showModal.value = false,
    router.push('/home')
  }
  
  // 关闭未完成提示
  const closeWarning = () => {
    showWarning.value = false
  }
  
  // 返回主页
  const goHome = () => {
    router.push('/home')
  }
  </script>
  
  
  <style scoped>
  .health-test {
    max-width: 600px;
    margin: auto;
    text-align: center;
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
  .question-block {
    margin-bottom: 20px;
  }
  .options label {
    display: block;
    margin: 5px 0;
  }
  .submit-btn {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
  }
  .back-btn {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    margin-top: 20px;
  }
  
  .modal, .warning-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .modal-content, .warning-content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
  }
  
  .close-btn {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
  }
  </style>
  