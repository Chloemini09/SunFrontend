<template>
  <div class="community-feed-view" v-keyboard-navigation>
     <header class="header">
       <img src="@/assets/logo.png" alt="Community Logo" class="logo" />
       <div class="header-text">
         <h1>Community Feed</h1>
         <p>{{ formattedDate }}</p>
       </div>
     </header>
     <button ref="backBtn" class="back-btn" @click="goBack">← Back</button>
     <section class="latest-posts">
       <h2 ref="latestPostsHeader">Latest Posts</h2>
       <div v-if="latestPosts.length === 0">No posts available.</div>
       <div v-else class="post-card" v-for="(post, index) in latestPosts" :key="post.id">
         <div class="post-content">
           <div class="post-image" v-if="post.imageUrl">
             <img :src="post.imageUrl" alt="Post Image" />
           </div>
           <div class="post-details">
             <h3 :ref="el => { if (el) postTitles[index] = el }">{{ post.title }}</h3>
             <p><strong>Channel:</strong> {{ post.channel }}</p>
             <p><strong>Posted by:</strong> {{ post.username }}</p>
             <p>{{ post.content }}</p>
             <p class="post-date">Posted on: {{ new Date(post.timestamp.seconds * 1000).toLocaleDateString() }}</p>
           </div>
         </div>
       </div>
     </section>
     <section class="channel-filter">
       <h2>Channels</h2>
       <div class="channel-buttons">
         <button
           v-for="(ch, index) in channels"
           :key="ch"
           :ref="el => { if (el) channelBtns[index] = el }"
           @click="filterByChannel(ch)"
           :class="{'selected-channel': selectedChannel === ch, 'channel-button': true}">
           {{ ch }}
         </button>
       </div>
     </section>
     <section class="filtered-posts" v-if="selectedChannel">
       <h2 ref="filteredPostsHeader">Posts in {{ selectedChannel }} Channel</h2>
       <div v-if="filteredPosts.length === 0">No posts available in this channel.</div>
       <div v-else class="post-card" v-for="(post, index) in filteredPosts" :key="post.id">
         <div class="post-content">
           <div class="post-image" v-if="post.imageUrl">
             <img :src="post.imageUrl" alt="Post Image" />
           </div>
           <div class="post-details">
             <h3 :ref="el => { if (el) filteredPostTitles[index] = el }">{{ post.title }}</h3>
             <p>{{ post.content }}</p>
             <p class="post-date">Posted on: {{ new Date(post.timestamp.seconds * 1000).toLocaleDateString() }}</p>
           </div>
         </div>
       </div>
     </section>
     <button ref="postBtn" @click="goToPostPage" class="floating-post-button">Post</button>
   </div>
 </template>

<script setup>
import { ref, onMounted, watch, nextTick } from "vue"
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'vue-router';
import { getAuth } from 'firebase/auth';

const db = getFirestore();
const router = useRouter();
const formattedDate = new Date().toLocaleDateString();
const auth = getAuth()
const user = auth.currentUser
const latestPosts = ref([]);
const filteredPosts = ref([]);
const selectedChannel = ref('');
const channels = ['Life', 'Treatment', 'Education', 'Entertainment', 'Help', 'Other'];

// Ref initializations
const backBtn = ref(null)
const latestPostsHeader = ref(null)
const postTitles = ref([])
const channelBtns = ref([])
const filteredPostsHeader = ref(null)
const filteredPostTitles = ref([])
const postBtn = ref(null)

// Set initial focus
onMounted(() => {
  backBtn.value.focus()
})

const fetchLatestPosts = async () => {
  const querySnapshot = await getDocs(collection(db, 'posts'));
  const allPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  latestPosts.value = allPosts.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds).slice(0, 3);
};
const goBack = () => {
  router.push('/home');
}
const filterByChannel = (channel) => {
  selectedChannel.value = channel;
  fetchFilteredPosts(channel);
};

const fetchFilteredPosts = async (channel) => {
  const querySnapshot = await getDocs(collection(db, 'posts'));
  const allPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  filteredPosts.value = allPosts.filter(post => post.channel === channel);
};

const goToPostPage = () => {
  if (!user) {
      console.error('No user logged in!');
      alert('Please log in to like a course.');
      return
    }
  router.push('/post');
};

onMounted(() => {
  fetchLatestPosts();
});
</script>

<style scoped>
.community-feed-view {
  max-width: 800px;
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
.latest-posts, .channel-filter, .filtered-posts {
  margin-bottom: 30px;
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
.post-card {
  display: flex;
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 15px;
  background-color: #fff;
}
.post-content {
  display: flex;
  gap: 20px;
}
.post-image img {
  max-width: 150px;
  max-height: 150px;
  object-fit: cover;
  border-radius: 8px;
}
.post-details {
  flex-grow: 1;
}
.post-date {
  font-size: 0.9em;
  color: #555;
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
.floating-post-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 15px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s;
}
.floating-post-button:hover {
  background-color: #45a049;
}
</style>