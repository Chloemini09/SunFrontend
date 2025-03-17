<template>
  <div class="admin-dashboard-container">

    <div class="dashboard-grid">
      <div class="dashboard-card" @click="navigateTo('/users')">
        <h3>Check User List</h3>
        <p>View and manage all users</p>
      </div>

      <div class="dashboard-card" @click="navigateTo('/usercomment')">
        <h3>Check User Comments</h3>
        <p>Review all user feedback</p>
      </div>

      <div class="dashboard-card" @click="navigateTo('/managedoctor')">
        <h3>Manage Doctors</h3>
        <p>Check your history and activities</p>
      </div>

      <div class="dashboard-card" @click="navigateTo('/userbooking')">
        <h3>Check User Booking List</h3>
        <p>Access other admin features</p>
      </div>

      <div class="dashboard-card" @click="navigateTo('/managecourse')">
        <h3>Manage Course</h3>
        <p>Upload and manage course videos</p>
      </div>

      <div class="dashboard-card" @click="navigateTo('/managecommunity')">
        <h3>Manage Community</h3>
        <p>Monitor and manage community activities</p>
      </div>

      <div class="dashboard-card" @click="navigateTo('/sendemail')">
        <h3>Send Email</h3>
        <p>Send Email to Users</p>
      </div>

      <div class="dashboard-card" @click="navigateTo('/traffic')">
        <h3>Manage Traffic</h3>
        <p>Traffic Charts</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAuth } from 'firebase/auth';

const router = useRouter();
const auth = getAuth();
const currentUser = auth.currentUser;

const currentDate = new Date().toLocaleDateString('en-US', {
  weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
});

const username = ref('');
onMounted(() => {
  if (currentUser) {
    username.value = currentUser.displayName || 'Admin';
  } else {
    username.value = 'Guest Admin';
  }
});

const navigateTo = (path) => {
  router.push(path);
};
</script>

<style scoped>
.admin-dashboard-container {
  max-width: 1000px;
  margin: auto;
  padding: 20px;
  text-align: center;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #ddd;
}

.header-left {
  text-align: left;
}

.header-right {
  text-align: right;
}

.logout-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
}

.logout-btn:hover {
  background-color: #c0392b;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 40px;
}

.dashboard-card {
  background-color: white;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dashboard-card:hover {
  background-color: #f0f0f0;
}

.dashboard-card h3 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.dashboard-card p {
  color: #7f8c8d;
}
</style>