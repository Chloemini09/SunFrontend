<template>
  <div class="assess-container">
    <h2>Rate Your Experience</h2>
    <button class="back-btn" @click="goBack">← Back</button>
    <!-- Iterate over the problem and render -->
    <div v-for="(question, index) in questions" :key="index" class="question-container">
      <p>{{ question.text }}</p>
      <div class="rating-options">
        <label v-for="rating in ratings" :key="rating">
          <input
            type="radio"
            :name="'question' + index"
            :value="rating"
            v-model="question.rating"
            required
          />
          {{ rating }}
        </label>
      </div>
      <p v-if="validationErrors[index]" class="error">{{ validationErrors[index] }}</p>
    </div>

    <!-- Add optional advice input box -->
    <div class="advice-container">
      <p>Give Us Advice (Optional):</p>
      <textarea v-model="advice" placeholder="Your advice here..."></textarea>
    </div>

    <button @click="submitRatings">Submit</button>
    <p v-if="successMessage" class="success-message">{{ successMessage }}</p>

    <!-- return -->
    <button @click="goBack" class="btn-back">Back to Home</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { getFirestore, collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Initialize Firestore and Auth instances
const db = getFirestore();
const auth = getAuth();
const user = auth.currentUser;
const router = useRouter();

// Initialize variables
const questions = ref([
  { text: 'How do you rate the usability of the interface?', rating: null },
  { text: 'How satisfied are you with the features?', rating: null },
  { text: 'How was the overall performance?', rating: null },
]);

const ratings = [1, 2, 3, 4, 5];
const successMessage = ref('');
const validationErrors = ref([]);
const advice = ref(''); // Optional advice

// Form validation
function validateForm() {
  validationErrors.value = [];
  let isValid = true;

  questions.value.forEach((question, index) => {
    if (question.rating === null) {
      validationErrors.value[index] = 'This question is required.';
      isValid = false;
    }
  });

  return isValid;
}

// Submit ratings and store them in Firestore
async function submitRatings() {
  if (!validateForm()) {
    return;
  }

  // Fetch the user's username from Firestore
  let username = 'Anonymous'; // Default value
  if (user) {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        username = userDoc.data().username; // Get the username from Firestore
      }
    } catch (error) {
      console.error("Error fetching username: ", error);
    }
  }

  // Prepare ratings data
  const ratingsData = questions.value.map((question) => ({
    question: question.text,
    rating: question.rating,
  }));

  const formData = {
    username: username, // Include the username
    userEmail: user ? user.email : 'anonymous',
    ratings: ratingsData,
    advice: advice.value || 'No advice provided',
    timestamp: new Date(),
  };

  try {
    // Add the feedback data to Firestore's 'feedback' collection
    await addDoc(collection(db, 'feedback'), formData);
    successMessage.value = 'Thank you for your feedback!';
  } catch (error) {
    console.error('Error adding feedback: ', error);
    successMessage.value = 'Failed to submit feedback. Please try again.';
  }
}

// Go back to the home view
function goBack() {
  router.push('/home'); // Return to HomeView
}
</script>

<style scoped>
.assess-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  text-align: center;
}

.question-container {
  margin-bottom: 20px;
}

.rating-options {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

label {
  cursor: pointer;
}

input[type="radio"] {
  margin-right: 5px;
}

.advice-container {
  margin-top: 20px;
  text-align: left;
}

textarea {
  width: 100%;
  height: 100px;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  margin-top: 10px;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
}

button:hover {
  background-color: #0056b3;
}

.btn-back {
  background-color: #4caf50;
  margin-top: 10px;
}

.btn-back:hover {
  background-color: #388e3c;
}

.error {
  color: red;
  font-size: 0.9rem;
}

.success-message {
  margin-top: 20px;
  color: green;
  font-weight: bold;
}
</style>
