<template>
    <div class="admin-community-container">
      <header class="header">
        <h1>Manage Community Posts</h1>
      </header>
      <button class="back-btn" @click="goBack">← Back</button>

      <!-- Search and Filter Section -->
      <div class="filter-section">
        <label>
          Search by:
          <select v-model="searchCategory">
            <option value="username">User</option>
            <option value="content">Content</option>
            <option value="channel">Channel</option>
          </select>
        </label>
        <input type="text" v-model="searchText" placeholder="Enter search term" class="search-input" />
        <label>
          Sort by Date:
          <select v-model="sortOrder" @change="sortByDate">
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </label>
      </div>
  
      <!-- Posts Table -->
      <div class="posts-table">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Channel</th>
              <th>Title</th>
              <th>Content</th>
              <th>Image</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="post in paginatedPosts" :key="post.id">
              <td>{{ post.username }}</td>
              <td>{{ post.channel }}</td>
              <td>{{ post.title }}</td>
              <td>{{ post.content }}</td>
              <td v-if="post.imageUrl">
                <img :src="post.imageUrl" alt="Post Image" class="post-image" />
              </td>
              <td v-else>-</td>
              <td>{{ formatDate(post.timestamp) }}</td>
              <td>
                <button @click="deletePost(post.id)" class="btn-delete">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="pagination-controls">
          <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, computed } from 'vue';
  import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
  import { useRouter } from 'vue-router'

  export default {
    setup() {
      const db = getFirestore();
      const posts = ref([]);
      const searchText = ref('');
      const searchCategory = ref('username');
      const sortOrder = ref('desc');
      const currentPage = ref(1);
      const postsPerPage = 10;
      const router = useRouter();
  
      const fetchPosts = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'posts'));
          posts.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          sortByDate();
        } catch (error) {
          console.error('Error fetching posts:', error);
        }
      };

      const goBack = () => {
        router.push('/admin')
      }
  
      const deletePost = async (postId) => {
        if (confirm('Are you sure you want to delete this post?')) {
          try {
            await deleteDoc(doc(db, 'posts', postId));
            posts.value = posts.value.filter(post => post.id !== postId);
            alert('Post deleted successfully');
          } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post');
          }
        }
      };
  
      const sortByDate = () => {
        posts.value.sort((a, b) => {
          if (sortOrder.value === 'desc') {
            return new Date(b.timestamp.seconds * 1000) - new Date(a.timestamp.seconds * 1000);
          } else {
            return new Date(a.timestamp.seconds * 1000) - new Date(b.timestamp.seconds * 1000);
          }
        });
      };
  
      const filteredPosts = computed(() => {
        return posts.value.filter(post => {
          if (searchCategory.value === 'username') {
            return post.username.toLowerCase().includes(searchText.value.toLowerCase());
          } else if (searchCategory.value === 'content') {
            return post.content.toLowerCase().includes(searchText.value.toLowerCase());
          } else if (searchCategory.value === 'channel') {
            return post.channel.toLowerCase().includes(searchText.value.toLowerCase());
          }
          return false;
        });
      });
  
      const totalPages = computed(() => {
        return Math.ceil(filteredPosts.value.length / postsPerPage);
      });
  
      const paginatedPosts = computed(() => {
        const start = (currentPage.value - 1) * postsPerPage;
        const end = start + postsPerPage;
        return filteredPosts.value.slice(start, end);
      });
  
      const nextPage = () => {
        if (currentPage.value < totalPages.value) {
          currentPage.value++;
        }
      };
  
      const prevPage = () => {
        if (currentPage.value > 1) {
          currentPage.value--;
        }
      };
  
      const formatDate = (timestamp) => {
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      };
  
      onMounted(() => {
        fetchPosts();
      });
  
      return {
        posts,
        searchText,
        searchCategory,
        sortOrder,
        currentPage,
        totalPages,
        nextPage,
        prevPage,
        deletePost,
        sortByDate,
        filteredPosts,
        paginatedPosts,
        formatDate,
        goBack,
      };
    },
  };
  </script>
  
  <style scoped>
  .admin-community-container {
    max-width: 1200px;
    margin: auto;
    padding: 20px;
  }
  
  .header {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .filter-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .search-input {
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    width: 300px;
  }
  
  .posts-table table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .posts-table th, .posts-table td {
    padding: 15px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  .post-image {
    width: 100px;
    height: auto;
    border-radius: 5px;
  }
  
  .btn-delete {
    background-color: #e74c3c;
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    border-radius: 5px;
  }
  
  .btn-delete:hover {
    background-color: #c0392b;
  }
  
  .pagination-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    gap: 10px;
  }
  
  .pagination-controls button {
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    background-color: #4caf50;
    color: white;
    cursor: pointer;
  }
  
  .pagination-controls button:disabled {
    background-color: #ddd;
    cursor: not-allowed;
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