<template>
  <div class="create-account-container">
    <h1>Create an Account</h1>
    <form @submit.prevent="register" class="create-account-form">
      <div class="form-group">
        <input type="text" placeholder="Username" v-model="username" required />
      </div>
      <div class="form-group">
        <input type="email" placeholder="Email" v-model="email" required />
      </div>
      <div class="form-group">
        <input type="password" placeholder="Password" v-model="password" required />
        <small v-if="passwordError" class="error-message">{{ passwordError }}</small>
      </div>
      <div class="form-group">
        <select v-model="gender" required>
          <option value="" disabled>Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div class="form-group">
        <input type="text" placeholder="Country" v-model="country" required />
      </div>
      <button type="submit" class="submit-button">Register</button>
    </form>
    <button @click="googleRegister" class="google-button">
      Sign up/Login with Google
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { useRouter } from "vue-router"
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, increment, Timestamp } from 'firebase/firestore';

const username = ref("")
const email = ref("")
const password = ref("")
const gender = ref("")
const country = ref("")
const passwordError = ref("")
const router = useRouter()
const auth = getAuth()
const db = getFirestore()

// Validate password
const validatePassword = (password) => {
  const lengthCheck = password.length >= 8
  const letterCheck = /[a-zA-Z]/.test(password)
  const numberCheck = /\d/.test(password)
  const specialCharCheck = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  if (!lengthCheck) return "Password must be at least 8 characters long."
  if (!letterCheck) return "Password must contain at least one letter."
  if (!numberCheck) return "Password must contain at least one number."
  if (!specialCharCheck) return "Password must contain at least one special character."
  
  return ""
}

// Register user
const register = () => {
  passwordError.value = validatePassword(password.value)
  
  if (passwordError.value) return

  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then(async (data) => {
      console.log("Firebase registration successful!")
      const user = data.user

      // Save user information to Firestore
      await setDoc(doc(db, "users", user.uid), {
        username: username.value,
        email: user.email,
        gender: gender.value,
        country: country.value,
        role: "user"
      })
      updateTraffic();
      sendWelcomeEmail(user.email, username.value)

      router.push("/login")
    })
    .catch((error) => {
      console.log(error.code)
    })
}

const updateTraffic = async () => {
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  const trafficDocRef = doc(db, 'RegisterAmount', formattedDate);

  try {
    const trafficDoc = await getDoc(trafficDocRef);
    if (trafficDoc.exists()) {
      // If today's document exists, increment the login count
      await updateDoc(trafficDocRef, {
        views: increment(1),
        lastUpdated: Timestamp.now() // Update the last updated time
      });
    } else {
      // If today's document does not exist, create a new document with initial login count of 1
      await setDoc(trafficDocRef, {
        date: Timestamp.now(),
        views: 1,
        lastUpdated: Timestamp.now() // Set creation and last updated time
      });
    }
  } catch (error) {
    console.error('Error updating traffic:', error);
  }
};
// Send welcome email
const sendWelcomeEmail = (email, username) => {
  fetch('https://us-central1-mindwell-f5a26.cloudfunctions.net/sendWelcomeEmail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, username })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Email sent successfully:', data)
  })
  .catch((error) => {
    console.error('Error sending email:', error)
  })
}

// Google register/login
const googleRegister = () => {
  const provider = new GoogleAuthProvider()

  signInWithPopup(auth, provider)
    .then(async (result) => {
      const user = result.user
      console.log("Google registration/login successful!", user)

      const userRef = doc(db, "users", user.uid)
      await setDoc(userRef, {
        username: user.displayName || "Google User",
        email: user.email,
        gender: "unknown", 
        country: "unknown", 
        role: "user"
      }, { merge: true })
      updateTraffic();
      sendWelcomeEmail(user.email, username.value)
      router.push("/home")
    })
    .catch((error) => {
      console.log("Google Sign-In Error: ", error)
    })
}
</script>

<style scoped>
.create-account-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

.create-account-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 15px;
}

input,
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.error-message {
  color: red;
  font-size: 0.85em;
}

.submit-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-button:hover {
  background-color: #45a049;
}

.google-button {
  background-color: #4285F4;
  color: white;
  border: none;
  padding: 12px;
  margin-top: 20px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
}

.google-button:hover {
  background-color: #357ae8;
}
</style>
