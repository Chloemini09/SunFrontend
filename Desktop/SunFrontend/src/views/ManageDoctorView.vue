<template>
    <div class="consultation-management">
      <header class="header">
        <img src="@/assets/logo.png" alt="Health Test Logo" class="logo" />
        <div class="header-text">
          <h1>Manage Consultation</h1>
          <p>{{ formattedDate }}</p>
        </div>
      </header>

      <button class="back-btn" @click="goBack">← Back</button>
  
      <section class="doctor-form">
        <h2>{{ isEditing ? 'Edit Doctor' : 'Add New Doctor' }}</h2>
        <form @submit.prevent="isEditing ? updateDoctor() : addDoctor()">
          <label>Name:</label>
          <input type="text" v-model="doctor.name" required />
  
          <label>ID:</label>
          <input type="text" v-model="doctor.id" required />
  
          <label>Working Days:</label>
          <div class="working-days">
            <label v-for="day in days" :key="day">
              <input type="checkbox" :value="day" v-model="doctor.workingDays" /> {{ day }}
            </label>
          </div>
  
          <label>Specialization:</label>
          <input type="text" v-model="doctor.specialization" required />
  
          <button type="submit" class="green-button">{{ isEditing ? 'Update' : 'Add' }}</button>
          <button v-if="isEditing" @click="cancelEdit" class="green-button">Cancel</button>
        </form>
      </section>
  
      <section class="doctor-list">
        <h2>Doctor List</h2>
        <div class="search-section">
          <select v-model="searchCategory">
            <option value="name">Name</option>
            <option value="id">ID</option>
            <option value="workingDays">Working Days</option>
            <option value="specialization">Specialization</option>
          </select>
          <input type="text" v-model="searchTerm" placeholder="Search..." />
          <button @click="filterDoctors" class="green-button">Search</button>
          <button @click="clearSearch" class="green-button">Clear</button>
        </div>
        <div v-if="filteredDoctors.length === 0">No doctors found.</div>
        <table v-else>
          <thead>
            <tr>
              <th>Name</th>
              <th>ID</th>
              <th>Working Days</th>
              <th>Specialization</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="doctor in paginatedDoctors" :key="doctor.id">
              <td>{{ doctor.name }}</td>
              <td>{{ doctor.id }}</td>
              <td>{{ Array.isArray(doctor.workingDays) ? doctor.workingDays.join(', ') : doctor.workingDays }}</td>
              <td>{{ doctor.specialization }}</td>
              <td>
                <button @click="editDoctor(doctor)" class="green-button">Edit</button>
                <button @click="deleteDoctor(doctor.id)" class="green-button">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="pagination">
          <button @click="prevPage" :disabled="currentPage === 1" class="green-button">Previous</button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage === totalPages" class="green-button">Next</button>
        </div>
      </section>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue';
  import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
  import { useRouter } from 'vue-router'

  const db = getFirestore();
  const doctors = ref([]);
  const filteredDoctors = ref([]);
  const doctor = ref({ name: '', id: '', workingDays: [], specialization: '' });
  const isEditing = ref(false);
  const searchTerm = ref('');
  const searchCategory = ref('name');
  const currentPage = ref(1);
  const itemsPerPage = 10;
  const router = useRouter()
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  let editingDocRef = null;
  
  const formattedDate = new Date().toLocaleDateString();
  const goBack = () => {
    router.push('/admin')
  }
  const fetchDoctors = async () => {
    const querySnapshot = await getDocs(collection(db, 'doctors'));
    doctors.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    filteredDoctors.value = doctors.value;
  };
  
  const addDoctor = async () => {
    try {
      if (!Array.isArray(doctor.value.workingDays)) {
        doctor.value.workingDays = [doctor.value.workingDays];
      }
      await addDoc(collection(db, 'doctors'), { ...doctor.value });
      await fetchDoctors();
      clearForm();
    } catch (error) {
      console.error('Error adding doctor:', error);
    }
  };
  
  const editDoctor = (doc) => {
    doctor.value = { ...doc };
    isEditing.value = true;
    editingDocRef = doc.id;
  };
  
  const updateDoctor = async () => {
    try {
      if (!Array.isArray(doctor.value.workingDays)) {
        doctor.value.workingDays = [doctor.value.workingDays];
      }
      const docRef = doc(db, 'doctors', editingDocRef);
      await updateDoc(docRef, { ...doctor.value });
      await fetchDoctors();
      clearForm();
    } catch (error) {
      console.error('Error updating doctor:', error);
    }
  };
  
  const deleteDoctor = async (id) => {
    try {
      await deleteDoc(doc(db, 'doctors', id));
      await fetchDoctors();
    } catch (error) {
      console.error('Error deleting doctor:', error);
    }
  };
  
  const cancelEdit = () => {
    clearForm();
  };
  
  const clearForm = () => {
    doctor.value = { name: '', id: '', workingDays: [], specialization: '' };
    isEditing.value = false;
    editingDocRef = null;
  };
  
  const filterDoctors = () => {
    filteredDoctors.value = doctors.value.filter(doc => {
      const term = searchTerm.value.toLowerCase();
      if (searchCategory.value === 'name') {
        return doc.name.toLowerCase().includes(term);
      } else if (searchCategory.value === 'id') {
        return doc.id.toLowerCase().includes(term);
      } else if (searchCategory.value === 'workingDays') {
        return doc.workingDays.some(day => day.toLowerCase() === term);
      } else if (searchCategory.value === 'specialization') {
        return doc.specialization.toLowerCase().includes(term);
      }
      return false;
    });
    currentPage.value = 1;
  };
  
  const clearSearch = () => {
    searchTerm.value = '';
    filteredDoctors.value = doctors.value;
    currentPage.value = 1;
  };
  
  const paginatedDoctors = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredDoctors.value.slice(start, end);
  });
  
  const totalPages = computed(() => Math.ceil(filteredDoctors.value.length / itemsPerPage));
  
  const nextPage = () => {
    if (currentPage.value < totalPages.value) currentPage.value++;
  };
  
  const prevPage = () => {
    if (currentPage.value > 1) currentPage.value--;
  };
  
  onMounted(fetchDoctors);
  </script>
  
  <style scoped>
  .consultation-management {
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
  .doctor-form, .doctor-list {
    margin-bottom: 30px;
  }
  .working-days {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  th {
    background-color: #f2f2f2;
  }
  button {
    margin-right: 5px;
    padding: 8px 16px;
    border: none;
    background-color: #4caf50;
    color: white;
    cursor: pointer;
    border-radius: 4px;
  }
  button:hover {
    background-color: #45a049;
  }
  input[type="text"] {
    margin-bottom: 10px;
    padding: 8px;
    width: calc(100% - 16px);
  }
  .search-section {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
  }
  .pagination {
    text-align: center;
    margin-top: 20px;
  }
  .pagination button {
    margin: 0 5px;
  }
  </style>