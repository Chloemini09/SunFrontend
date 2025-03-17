<template>
  <div class="post-creation-view" v-keyboard-navigation>
     <header class="header">
       <img src="@/assets/logo.png" alt="Post Logo" class="logo" />
       <div class="header-text">
         <h1>Create Post</h1>
         <p>{{ formattedDate }}</p>
       </div>
     </header>
     <button ref="backBtn" class="back-btn" @click="goBack">← Back</button>
     <section class="post-form">
       <h2>New Post</h2>
       <div>
         <label for="title">Title:</label>
         <input ref="titleInput" type="text" v-model="title" id="title" />
       </div>
       <div class="channels">
         <label>Channel:</label>
         <div class="channel-buttons">
           <button
             v-for="(ch, index) in channels"
             :key="ch"
             :ref="el => { if (el) channelBtns[index] = el }"
             @click="selectChannel(ch)"
             :class="{'selected-channel': selectedChannel === ch, 'channel-button': true}">
             {{ ch }}
           </button>
         </div>
       </div>
       <div>
         <label for="content">Content:</label>
         <textarea ref="contentTextarea" v-model="content" id="content"></textarea>
       </div>
       <div class="upload-image">
         <label for="imageUpload">Upload Image:</label>
         <input ref="imageUploadInput" type="file" @change="handleImageUpload" id="imageUpload" />
       </div>
       <div class="anonymity-toggle">
         <label>
           <input ref="anonymousCheckbox" type="checkbox" v-model="isAnonymous" /> Post Anonymously
         </label>
       </div>
       <button ref="submitBtn" @click="createPost" class="green-button">Submit Post</button>
     </section>
   </div>
 </template>

<script setup>
import { ref, onMounted } from 'vue';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'vue-router';

// Ref initializations
const backBtn = ref(null)
const titleInput = ref(null)
const channelBtns = ref([])
const contentTextarea = ref(null)
const imageUploadInput = ref(null)
const anonymousCheckbox = ref(null)
const submitBtn = ref(null)

// Set initial focus
onMounted(() => {
  titleInput.value.focus()
})

const router = useRouter()
const db = getFirestore();
const auth = getAuth();
const storage = getStorage();
const formattedDate = new Date().toLocaleDateString();

const title = ref('');
const content = ref('');
const channels = ['Life', 'Treatment', 'Education', 'Entertainment', 'Help', 'Other'];
const selectedChannel = ref('');
const isAnonymous = ref(false);
const imageFile = ref(null);
const imageUrl = ref('');

const goBack = () => {
  router.push('/home')
}
const selectChannel = (channel) => {
  selectedChannel.value = channel;
};

const handleImageUpload = (event) => {
  imageFile.value = event.target.files[0];
};

const createPost = async () => {
  const user = auth.currentUser;
  if (user && title.value.trim() && content.value.trim() && selectedChannel.value) {
    try {
      // If an image is selected, upload it to Firebase Storage
      if (imageFile.value) {
        const imageRef = storageRef(storage, `posts/${imageFile.value.name}`);
        await uploadBytes(imageRef, imageFile.value);
        imageUrl.value = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, 'posts'), {
        userId: user.uid,
        username: isAnonymous.value ? 'Anonymous' : user.displayName || 'Anonymous',
        title: title.value,
        channel: selectedChannel.value,
        content: content.value,
        imageUrl: imageUrl.value,
        timestamp: serverTimestamp(),
      });
      alert('Post created successfully!');
      title.value = '';
      content.value = '';
      selectedChannel.value = '';
      isAnonymous.value = false;
      imageFile.value = null;
      imageUrl.value = '';
      router.push("/community");
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  } else {
    alert('Please fill in all fields and select a channel.');
  }
};
</script>

<style scoped>
.post-creation-view {
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
.post-form {
  margin-bottom: 30px;
}
.post-form label {
  display: block;
  margin-top: 10px;
}
.post-form input[type="text"], .post-form textarea {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
}
textarea {
  resize: vertical;
  height: 150px;
}
.channel-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}
.channel-button {
  padding: 10px;
  border: none;
  background-color: #4caf50;
  color: white;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
}
.channel-button:hover {
  background-color: #45a049;
}
.selected-channel {
  background-color: white;
  color: #4caf50;
  border: 2px solid #4caf50;
}
.anonymity-toggle {
  margin-top: 20px;
}
.upload-image {
  margin-top: 20px;
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