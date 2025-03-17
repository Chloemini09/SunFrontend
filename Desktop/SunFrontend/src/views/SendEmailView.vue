<template>
  <div class="admin-email">
    <h1>Mass Email</h1>
    <button class="back-btn" @click="goBack">← Back</button>
    <div>
      <label for="subject">Email Subject:</label>
      <input type="text" v-model="subject" id="subject" />
    </div>
    <div>
      <label for="html">Email Content (HTML):</label>
      <textarea v-model="html" id="html"></textarea>
    </div>
    <div>
      <label for="image">Upload Image:</label>
      <input type="file" @change="handleImageUpload" />
    </div>
    <div>
      <label for="recipients">Select Recipients:</label>
      <div class="recipient-controls">
        <div class="recipient-controls-row">
          <input type="checkbox" value="ALL" v-model="selectAll" @change="toggleSelectAll" />
          <label>Select All Users</label>
        </div>
        <input type="text" v-model="searchQuery" placeholder="Search by name or email" @input="filterUsers" class="search-box" />
      </div>
      <div v-if="paginatedUsers.length > 0" class="user-list">
        <div v-for="user in paginatedUsers" :key="user.email" class="recipient-option">
          <input type="checkbox" :value="user" v-model="selectedRecipients" />
          <label>{{ user.username }} ({{ user.email }})</label>
        </div>
        <div class="pagination">
          <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
        </div>
      </div>
      <div v-else>
        <p>No users found.</p>
      </div>
    </div>
    <button @click="sendMassEmail">Send Email</button>
  </div>
</template>

<script>
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default {
  data() {
    return {
      subject: '',
      html: '',
      users: [],
      filteredUsers: [],
      selectedRecipients: [],
      selectAll: false,
      uploadedImageUrl: '',
      searchQuery: '',
      currentPage: 1,
      itemsPerPage: 3,
    };
  },
  computed: {
    paginatedUsers() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredUsers.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    },
  },
  async created() {
    try {
      const db = getFirestore();
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => {
        const userData = doc.data();
        return {
          email: userData.email,
          username: userData.username,
          role: userData.role,
        };
      }).filter(user => user.email && user.username && user.role === 'user');

      this.users = users;
      this.filteredUsers = users;
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  },
  methods: {
    goBack() {
      this.$router.push('/admin');
    },
    toggleSelectAll() {
      this.selectedRecipients = this.selectAll ? [...this.filteredUsers] : [];
    },
    async handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        try {
          const storage = getStorage();
          const storageRef = ref(storage, `images/${file.name}`);
          await uploadBytes(storageRef, file);
          this.uploadedImageUrl = await getDownloadURL(storageRef);
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }
    },
    filterUsers() {
      const query = this.searchQuery.toLowerCase();
      this.filteredUsers = this.users.filter(user =>
        user.username.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
      );
      this.currentPage = 1;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    async sendMassEmail() {
      try {
        const recipients = this.selectAll ? this.filteredUsers : this.selectedRecipients;

        const emailPromises = recipients.map(user => this.sendEmail(user.email));
        await Promise.all(emailPromises);

        alert('Emails sent successfully!');
      } catch (error) {
        console.error('Error sending emails:', error);
        alert('Failed to send emails, please try again later.');
      }
    },
    sendEmail(email) {
      const emailData = {
        email,
        subject: this.subject,
        html: this.uploadedImageUrl ? `${this.html}<br/><img src="${this.uploadedImageUrl}" alt="Uploaded Image" />` : this.html,
      };

      return fetch('https://us-central1-mindwell-f5a26.cloudfunctions.net/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      }).then(response => {
        if (!response.ok) {
          throw new Error('Failed to send email');
        }
      });
    },
  },
};
</script>

<style scoped>
.admin-email {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}
.admin-email h1 {
  text-align: center;
  color: #333;
}
.admin-email label {
  display: block;
  margin-top: 10px;
  font-weight: bold;
  color: #555;
}
.admin-email input,
.admin-email textarea {
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}
.search-box {
  margin-top: 10px;
  padding: 8px;
  width: calc(100% - 20px);
  font-size: 16px;
  border-radius: 4px;
  border: 1px solid #ddd;
}
.recipient-controls {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 10px;
}
.recipient-controls-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.user-list {
  margin-top: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #ffffff;
  padding: 15px;
}
.recipient-option {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 5px;
  border-bottom: 1px solid #f0f0f0;
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}
.pagination button {
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  margin: 0 5px;
  cursor: pointer;
}
.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.pagination span {
  font-size: 16px;
  color: #333;
}
.admin-email button {
  display: block;
  width: 100%;
  padding: 15px;
  margin-top: 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 18px;
  cursor: pointer;
}
.admin-email button:hover {
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