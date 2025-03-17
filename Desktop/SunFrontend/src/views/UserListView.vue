<template>
  <div class="admin-user-view">
    <header class="header">
      <h1>User List</h1>
      <div class="search-section">
        <input v-model="searchQuery" placeholder="Search..." class="search-input" />
        <select v-model="searchColumn" class="search-select">
          <option value="username">Username</option>
          <option value="email">Email</option>
          <option value="country">Country</option>
          <option value="gender">Gender</option>
        </select>
        <button @click="searchUsers" class="btn-search">Search</button>
        <button @click="resetSearch" class="btn-reset">Clear</button>
      </div>
    </header>
    <button class="back-btn" @click="goBack">← Back</button>
    <div class="user-list">
      <div class="user-card" v-for="user in paginatedUsers" :key="user.id">
        <img :src="user.avatarUrl" alt="User Avatar" class="avatar" />
        <div class="user-info">
          <p><strong>Username:</strong> {{ user.username }}</p>
          <p><strong>Email:</strong> {{ user.email }}</p>
          <p><strong>Country:</strong> {{ user.country }}</p>
          <p><strong>Gender:</strong> {{ user.gender }}</p>
        </div>
      </div>
    </div>
    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
    </div>
    <div class="export-section">
      <button @click="exportToCSV" class="btn-export">Export CSV</button>
      <button @click="exportToPDF" class="btn-export">Export PDF</button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';
import { jsPDF } from 'jspdf';
import { useRouter } from 'vue-router'

export default {
  setup() {
    const db = getFirestore();
    const storage = getStorage();
    const users = ref([]);
    const searchQuery = ref('');
    const searchColumn = ref('username');
    const currentPage = ref(1);
    const itemsPerPage = 10;
    const router = useRouter();

    const goBack = () => {
      router.push('/admin')
    }
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const userData = await Promise.all(querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          let avatarUrl = '';
          if (data.avatarUrl) {
            avatarUrl = data.avatarUrl;
          } else {
            const defaultAvatarRef = storageRef(storage, 'avatars/defaultuserphoto.jpeg');
            avatarUrl = await getDownloadURL(defaultAvatarRef);
          }
          return {
            id: doc.id,
            username: data.username || 'N/A',
            email: data.email || 'N/A',
            country: data.country || 'N/A',
            gender: data.gender || 'N/A',
            avatarUrl
          };
        }));
        users.value = userData;
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    const filteredUsers = computed(() => {
      if (!searchQuery.value) {
        return users.value;
      }
      return users.value.filter(user => {
        return user[searchColumn.value].toLowerCase().includes(searchQuery.value.toLowerCase());
      });
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredUsers.value.length / itemsPerPage);
    });

    const paginatedUsers = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return filteredUsers.value.slice(start, end);
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

    const searchUsers = () => {
      currentPage.value = 1;
    };

    const resetSearch = () => {
      searchQuery.value = '';
      currentPage.value = 1;
    };

    const exportToCSV = () => {
      const csvContent = [
        ['Username', 'Email', 'Country', 'Gender'],
        ...users.value.map(user => [user.username, user.email, user.country, user.gender])
      ].map(e => e.join(",")).join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'user_list.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    // Export PDF 的方法
    const exportToPDF = () => {
      const doc = new jsPDF();
      doc.text('User List', 10, 10);
      let y = 20;
      users.value.forEach(user => {
        doc.text(`Username: ${user.username}`, 10, y);
        doc.text(`Email: ${user.email}`, 10, y + 10);
        doc.text(`Country: ${user.country}`, 10, y + 20);
        doc.text(`Gender: ${user.gender}`, 10, y + 30);
        y += 40;
      });
      doc.save('user_list.pdf');
    };

    onMounted(fetchUsers);

    return {
      users,
      searchQuery,
      searchColumn,
      currentPage,
      totalPages,
      paginatedUsers,
      nextPage,
      prevPage,
      searchUsers,
      resetSearch,
      exportToCSV,
      exportToPDF,
      goBack
    };
  }
}
</script>

<style scoped>
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
.admin-user-view {
  max-width: 800px;
  margin: auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.search-section {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  padding: 0.5rem;
  font-size: 1rem;
}

.search-select {
  padding: 0.5rem;
  font-size: 1rem;
}

.btn-search, .btn-reset {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 1rem;
  border-radius: 5px;
}

.btn-search:hover, .btn-reset:hover {
  background-color: #388e3c;
}

.user-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.user-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  width: 200px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 10px;
}

.user-info p {
  margin: 5px 0;
  font-size: 0.9rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.pagination button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 1rem;
  border-radius: 5px;
}

.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination span {
  font-size: 1rem;
}
.export-section {
  text-align: center;
  margin-top: 20px;
}

.btn-export {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 1rem;
  border-radius: 5px;
}

.btn-export:hover {
  background-color: #388e3c;
}
</style>