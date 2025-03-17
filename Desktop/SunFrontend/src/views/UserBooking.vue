<template>
    <div class="admin-booking-view">
      <header class="header">
        <img src="@/assets/logo.png" alt="Health Test Logo" class="logo" />
        <div class="header-text">
          <h1>Manage Bookings</h1>
          <p>{{ formattedDate }}</p>
        </div>
      </header>
      <button class="back-btn" @click="goBack">← Back</button>
      <section class="booking-search">
        <h2>Search Bookings</h2>
        <div class="search-filters">
          <label for="filterType">Select Filter:</label>
          <select v-model="selectedFilter" id="filterType">
            <option value="userName">User Name</option>
            <option value="userEmail">Email</option>
            <option value="doctorName">Doctor</option>
            <option value="date">Date</option>
          </select>
        </div>
        <input type="text" v-model="searchTerm" :placeholder="`Search by ${selectedFilter}`" />
        <button @click="filterBookings" class="green-button">Search</button>
        <button @click="clearSearch" class="green-button">Clear</button>
      </section>
  
      <section class="booking-list">
        <h2>User Bookings</h2>
        <div v-if="filteredBookings.length === 0">No bookings found.</div>
        <div v-else>
          <table class="booking-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time Slot</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="booking in filteredBookings" :key="booking.id">
                <td>{{ booking.userName }}</td>
                <td>{{ booking.userEmail }}</td>
                <td>{{ booking.doctorName }}</td>
                <td>{{ booking.date }}</td>
                <td>{{ booking.timeSlot }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <div class="export-section">
        <button @click="exportToCSV" class="btn-export">Export CSV</button>
        <button @click="exportToPDF" class="btn-export">Export PDF</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { getFirestore, collection, getDocs, query } from 'firebase/firestore';
  import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';
  import { jsPDF } from 'jspdf';
  import { useRouter } from 'vue-router'
  const router = useRouter()
  const goBack = () => {
    router.push('/admin')
  }

  const db = getFirestore();
  const bookings = ref([]);
  const filteredBookings = ref([]);
  const searchTerm = ref('');
  const formattedDate = new Date().toLocaleDateString();
  const selectedFilter = ref('userName');
  
  const fetchBookings = async () => {
    const querySnapshot = await getDocs(collection(db, 'consultations'));
    bookings.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    filteredBookings.value = bookings.value;
  };
  
  const filterBookings = () => {
    const term = searchTerm.value.toLowerCase();
    filteredBookings.value = bookings.value.filter(booking => {
      return booking[selectedFilter.value].toLowerCase().includes(term);
    });
  };
  
  const clearSearch = () => {
    searchTerm.value = '';
    filteredBookings.value = bookings.value;
  };

  const exportToCSV = () => {
    if (!filteredBookings.value.length) {
      alert('No data to export.');
      return;
    }

    const csvContent = [
      [
        'Booking ID',
        'User Name',
        'User Email',
        'User ID',
        'Date',
        'Time Slot',
        'Doctor ID',
        'Doctor Name',
        'Timestamp'
      ],
      ...filteredBookings.value.map(booking => [
        booking.id,
        booking.userName || 'N/A',
        booking.userEmail || 'N/A',
        booking.userId || 'N/A',
        booking.date || 'N/A',
        booking.timeSlot || 'N/A',
        booking.doctorId || 'N/A',
        booking.doctorName || 'N/A',
        booking.timestamp ? new Date(booking.timestamp).toLocaleString() : 'N/A'
      ])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'consultations_bookings.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (!filteredBookings.value.length) {
      alert('No data to export.');
      return;
    }

    const doc = new jsPDF();
    doc.text('Consultations Bookings List', 10, 10);
    let y = 20;

    filteredBookings.value.forEach(booking => {
      doc.text(`Booking ID: ${booking.id}`, 10, y);
      doc.text(`User Name: ${booking.userName || 'N/A'}`, 10, y + 10);
      doc.text(`User Email: ${booking.userEmail || 'N/A'}`, 10, y + 20);
      doc.text(`User ID: ${booking.userId || 'N/A'}`, 10, y + 30);
      doc.text(`Date: ${booking.date || 'N/A'}`, 10, y + 40);
      doc.text(`Time Slot: ${booking.timeSlot || 'N/A'}`, 10, y + 50);
      doc.text(`Doctor ID: ${booking.doctorId || 'N/A'}`, 10, y + 60);
      doc.text(`Doctor Name: ${booking.doctorName || 'N/A'}`, 10, y + 70);
      doc.text(`Timestamp: ${booking.timestamp ? new Date(booking.timestamp).toLocaleString() : 'N/A'}`, 10, y + 80);
      
      y += 90;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save('consultations_bookings.pdf');
  };

  onMounted(fetchBookings);
  </script>
  
  <style scoped>
  .admin-booking-view {
    max-width: 1000px;
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
  .booking-search, .booking-list {
    margin-bottom: 30px;
  }
  .search-filters {
    margin-bottom: 10px;
  }
  .booking-table {
    width: 100%;
    border-collapse: collapse;
  }
  .booking-table th, .booking-table td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: left;
  }
  .booking-table th {
    background-color: #f4f4f4;
  }
  .green-button {
    margin-top: 10px;
    padding: 8px 16px;
    border: none;
    background-color: #4caf50;
    color: white;
    cursor: pointer;
    border-radius: 4px;
  }
  .green-button:hover {
    background-color: #45a049;
  }
  input[type="text"] {
    margin-bottom: 10px;
    padding: 8px;
    width: calc(100% - 16px);
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
  </style>