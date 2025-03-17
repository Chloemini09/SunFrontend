<template>
  <div class="login-container" v-keyboard-navigation>
    <button ref="backBtn" class="back-btn" @click="goBack">← Back</button>
    <h1>Sign in</h1>
    <p><input ref="emailInput" type="text" placeholder="Email" v-model="email" class="form-input" /></p>
    <p><input ref="passwordInput" type="password" placeholder="Password" v-model="password" class="form-input" /></p>
    <p><button ref="signinBtn" @click="signin" class="form-button">Sign in</button></p>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    <p><a ref="forgotPasswordLink" href="#" @click.prevent="forgotPassword">Forgot your password?</a></p>
    <p><button ref="googleSigninBtn" @click="googleSignin" class="google-button">Sign in with Google</button></p>
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <p>Account does not exist. Would you like to register a new account?</p>
        <button ref="registerBtn" @click="registerUser">Yes, register</button>
        <button ref="goHomeBtn" @click="goHome">No, go home</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, watch, nextTick } from "vue"
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "firebase/auth"
import { useRouter } from "vue-router"
import { auth, db } from "@/firebase/init"
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, increment, Timestamp } from 'firebase/firestore';

const email = ref("")
const password = ref("")
const errorMessage = ref("") 
const router = useRouter()
const showModal = ref(false)
// 添加 refs 用于聚焦
const backBtn = ref(null)
const emailInput = ref(null)
const passwordInput = ref(null)
const signinBtn = ref(null)
const forgotPasswordLink = ref(null)
const googleSigninBtn = ref(null)
const registerBtn = ref(null)
const goHomeBtn = ref(null)

onMounted(() => {
  emailInput.value.focus()
})

watch(showModal, (newValue) => {
  if (newValue) {
    nextTick(() => {
      registerBtn.value.focus()
    })
  }
})

const goBack = () => {
  router.push('/')
}

const signin = () => {
  errorMessage.value = ""; 
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      return signInWithEmailAndPassword(auth, email.value, password.value);
    })
    .then(async (data) => {
      console.log("Login Successful!");
      
      const user = data.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists()) {
        const userRole = userDoc.data().role;

        if (userRole === "admin") {
          router.push("/admin");
        } else if (userRole === "user") {
          updateTraffic();
          router.push("/home");
        } else {
          console.log("Unknown role: " + userRole);
          errorMessage.value = "Unauthorized role.";
        }
      } else {
        console.log("No such user in Firestore!");
        showModal.value = true;
        errorMessage.value = "User not found in database.";
      }
    })
    .catch((error) => {
      console.log(error.code);
      if (error.code === 'auth/user-not-found') {
        showModal.value = true;
      } else if (error.code === 'auth/wrong-password') {
        errorMessage.value = "Incorrect password. Please try again.";
      } else {
        errorMessage.value = "Error: " + error.message;
      }
    });
};
// Function to update login count
const updateTraffic = async () => {
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  const trafficDocRef = doc(db, 'traffic', formattedDate);

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
//google signin
const googleSignin = () => {
  const provider = new GoogleAuthProvider();
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      return signInWithPopup(auth, provider);
    })
    .then(async (result) => {
      const user = result.user;
      console.log("Google Login Successful!", user);

      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists()) {
        const userRole = userDoc.data().role;

        if (userRole === "admin") {
          router.push("/admin");
        } else if (userRole === "user") {
          updateTraffic();
          router.push("/home");
        } else {
          console.log("Unknown role: " + userRole);
          errorMessage.value = "Unauthorized role.";
        }
      } else {
        await setDoc(doc(db, "users", user.uid), {
          username: user.displayName || "Google User",
          email: user.email,
          role: "user"
        });
        router.push("/home");
      }
    })
    .catch((error) => {
      console.error("Google Sign-In Error: ", error);
      errorMessage.value = "Error: " + error.message;
    });
};


// forget password
const forgotPassword = () => {
  if (!email.value) {
    errorMessage.value = "Please enter your email to reset your password."
    return
  }
  
  sendPasswordResetEmail(auth, email.value)
    .then(() => {
      alert("Password reset email sent! Please check your inbox.")
    })
    .catch((error) => {
      console.error("Error sending password reset email:", error)
      errorMessage.value = "Error: " + error.message
    })
}

const registerUser = () => {
  showModal.value = false
  router.push("/register")
}

const goHome = () => {
  showModal.value = false
  router.push("/")
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: #f9f9f9;
}

h1 {
  text-align: center;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
}

.form-button {
  width: 100%;
  padding: 10px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.form-button:hover {
  background-color: #218838;
}

.google-button {
  background-color: #4285F4;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  font-size: 16px;
}

.google-button:hover {
  background-color: #357ae8;
}

.error-message {
  color: red;
  text-align: center;
  margin-top: 10px;
}
.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
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
