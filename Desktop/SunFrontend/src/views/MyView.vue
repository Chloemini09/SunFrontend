<template>
  <div class="user-my-view" v-keyboard-navigation>
     <header class="header">
       <img src="@/assets/logo.png" alt="User Profile Logo" class="logo" />
       <div class="header-text">
         <h1>My Profile</h1>
         <p>{{ formattedDate }}</p>
       </div>
     </header>
     <button ref="backBtn" class="back-btn" @click="goBack">← Back</button>
     <section class="user-info">
       <h2>User Information</h2>
       <div class="avatar-section">
         <label for="avatarUpload">Avatar:</label>
         <input ref="avatarUpload" type="file" @change="handleAvatarUpload" id="avatarUpload" />
         <div class="avatar-preview" v-if="avatarUrl">
           <img :src="avatarUrl" alt="Avatar Preview" />
         </div>
       </div>
       <div>
         <label for="username">User Name:</label>
         <input ref="usernameInput" type="text" v-model="userData.username" id="username" />
       </div>
       <div>
         <label for="gender">Gender:</label>
         <select ref="genderSelect" v-model="userData.gender" id="gender">
           <option value="Male">Male</option>
           <option value="Female">Female</option>
           <option value="Other">Other</option>
         </select>
       </div>
       <div>
         <label for="country">Country:</label>
         <select ref="countrySelect" v-model="userData.country" id="country">
           <option value="">Select your country</option>
           <option value="USA">USA</option>
           <option value="Canada">Canada</option>
           <option value="UK">UK</option>
           <option value="Australia">Australia</option>
           <option value="China">China</option>
           <option value="India">India</option>
           <option value="Other">Other</option>
         </select>
       </div>
       <div>
         <label for="introduction">Self Introduction:</label>
         <textarea ref="introTextarea" v-model="userData.introduction" id="introduction"></textarea>
       </div>
       <button ref="saveBtn" @click="updateUserInfo" class="green-button">Save Changes</button>
     </section>
   </div>
 </template>
 

<script setup>
import { ref, onMounted } from 'vue';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'vue-router'

const router = useRouter()
const db = getFirestore();
const auth = getAuth();
const storage = getStorage();
const userData = ref({
  username: '',
  gender: '',
  country: '',
  introduction: '',
  avatarUrl: ''
});
const backBtn = ref(null)
const avatarUpload = ref(null)
const usernameInput = ref(null)
const genderSelect = ref(null)
const countrySelect = ref(null)
const introTextarea = ref(null)
const saveBtn = ref(null)
const avatarUrl = ref('');
const formattedDate = new Date().toLocaleDateString();
onMounted(() => {
  backBtn.value.focus()
})
const goBack = () => {
  router.push('/home')
}
const fetchUserInfo = async () => {
  const user = auth.currentUser;
  if (user) {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      userData.value = userDoc.data();
      avatarUrl.value = userData.value.avatarUrl || '';
    }
  }
};

const handleAvatarUpload = async (event) => {
  const user = auth.currentUser;
  if (user) {
    const file = event.target.files[0];
    if (file) {
      const avatarRef = storageRef(storage, `avatars/${user.uid}`);
      await uploadBytes(avatarRef, file);
      avatarUrl.value = await getDownloadURL(avatarRef);
    }
  }
};

const updateUserInfo = async () => {
  const user = auth.currentUser;
  if (user) {
    try {
      const updatedData = {
        username: userData.value.username || '',
        gender: userData.value.gender || 'Other',
        country: userData.value.country || '',
        introduction: userData.value.introduction || '',
        avatarUrl: avatarUrl.value || ''
      };

      await updateDoc(doc(db, 'users', user.uid), updatedData);
      alert('User information updated successfully!');
    } catch (error) {
      console.error('Error updating user information:', error);
      alert('Failed to update user information. Please try again.');
    }
  }
};


onMounted(fetchUserInfo);
</script>

<style scoped>
.user-my-view {
  max-width: 600px;
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
.user-info {
  margin-bottom: 30px;
}
.user-info label {
  display: block;
  margin-top: 10px;
}
.user-info input[type="text"], .user-info textarea, .user-info select {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
}
textarea {
  resize: vertical;
  height: 100px;
}
.avatar-section {
  margin-top: 20px;
}
.avatar-preview img {
  max-width: 150px;
  max-height: 150px;
  object-fit: cover;
  border-radius: 50%;
  margin-top: 10px;
}
.green-button {
  margin-top: 20px;
  padding: 10px 20px;
  border: none;
  background-color: #4caf50;
  color: white;
  cursor: pointer;
  border-radius: 4px;
}
.green-button:hover {
  background-color: #45a049;
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
</style>