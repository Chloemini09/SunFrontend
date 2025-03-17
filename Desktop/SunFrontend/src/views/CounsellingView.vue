<template>
  <div class="consultation-booking">
    <header class="header">
      <img src="@/assets/logo.png" alt="Health Test Logo" class="logo" />
      <div class="header-text">
        <h1>Book a Consultation</h1>
        <p>{{ formattedDate }}</p>
      </div>
    </header>

    <button class="back-btn" @click="goBack">← Back</button>

    <section class="calendar-section">
      <h2>Select a Date</h2>
      <input type="date" v-model="selectedDate" @change="fetchAvailableDoctors" />
    </section>

    <section class="doctor-search">
      <h2>Search Available Doctors</h2>
      <input type="text" v-model="searchTerm" placeholder="Search by name or specialization" />
      <button @click="filterDoctors" class="green-button">Search</button>
      <button @click="clearSearch" class="green-button">Clear</button>
    </section>

    <section class="doctor-list">
      <h2>Available Doctors</h2>
      <div v-if="filteredDoctors.length === 0">No doctors found for the selected date.</div>
      <div class="doctor-slider" v-else>
        <button @click="prevPage" :disabled="currentPage === 0" class="slider-button">&#8249;</button>
        <div class="doctor-grid-container">
          <div class="doctor-grid">
            <div class="doctor-card" v-for="doctor in paginatedDoctors" :key="doctor.id">
              <h3>{{ doctor.name }}</h3>
              <p><strong>Specialization:</strong> {{ doctor.specialization }}</p>
              <p><strong>Working Days:</strong> {{ doctor.workingDays.join(', ') }}</p>
              <div class="time-slots">
                <div v-for="slot in doctor.timeSlots" :key="slot.time" class="time-slot">
                  <p>{{ slot.time }}: <span :class="{ available: !slot.booked, booked: slot.booked }">{{ slot.booked ? 'Booked' : 'Available' }}</span></p>
                  <button v-if="!slot.booked" @click="bookConsultation(doctor, slot)" class="green-button">Book</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button @click="nextPage" :disabled="currentPage >= totalPages - 1" class="slider-button">&#8250;</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getFirestore, collection, getDocs, query, where, addDoc, updateDoc, doc , Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'vue-router'

const db = getFirestore();
const auth = getAuth();
const doctors = ref([]);
const filteredDoctors = ref([]);
const searchTerm = ref('');
const selectedDate = ref('');
const formattedDate = new Date().toLocaleDateString();
const currentPage = ref(0);
const itemsPerPage = 4;

const timeSlots = [
  { time: '10:00 - 11:00', booked: false },
  { time: '11:00 - 12:00', booked: false },
  { time: '13:00 - 14:00', booked: false },
  { time: '14:00 - 15:00', booked: false },
  { time: '16:00 - 17:00', booked: false }
];

const router = useRouter()

const goBack = () => {
    router.push('/home') // 返回上一个路由视图
  }
const fetchAvailableDoctors = async () => {
  if (!selectedDate.value) return;
  const selectedDay = new Date(selectedDate.value).toLocaleString('en-us', { weekday: 'long' });

  const q = query(collection(db, 'doctors'), where('workingDays', 'array-contains', selectedDay));
  const querySnapshot = await getDocs(q);
  doctors.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), timeSlots: JSON.parse(JSON.stringify(timeSlots)) }));

  // Fetch bookings for the selected date
  const bookingsSnapshot = await getDocs(query(collection(db, 'consultations'), where('date', '==', selectedDate.value)));
  const bookings = bookingsSnapshot.docs.map(doc => doc.data());

  // Mark booked time slots
  doctors.value.forEach(doctor => {
    bookings.forEach(booking => {
      if (booking.doctorId === doctor.id) {
        const slot = doctor.timeSlots.find(slot => slot.time === booking.timeSlot);
        if (slot) {
          slot.booked = true;
        }
      }
    });
  });

  filteredDoctors.value = doctors.value;
};

const filterDoctors = () => {
  filteredDoctors.value = doctors.value.filter(doc => {
    const term = searchTerm.value.toLowerCase();
    return (
      doc.name.toLowerCase().includes(term) ||
      doc.specialization.toLowerCase().includes(term)
    );
  });
  currentPage.value = 0;
};

const clearSearch = () => {
  searchTerm.value = '';
  filteredDoctors.value = doctors.value;
  currentPage.value = 0;
};

const bookConsultation = async (doctor, slot) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      alert('You must be logged in to book a consultation.');
      return;
    }
    const booking = {
      doctorId: doctor.id,
      doctorName: doctor.name,
      date: selectedDate.value,
      timeSlot: slot.time,
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      userEmail: user.email,
      bookingdate: Timestamp.now()
    };
    await addDoc(collection(db, 'consultations'), booking);
    alert(`Successfully booked a consultation with Dr. ${doctor.name} at ${slot.time}`);

    // Update the time slot to booked
    slot.booked = true;

    // Send confirmation email
    sendEmail(user.email, user.displayName || 'Anonymous', doctor.name, selectedDate.value, slot.time);
  } catch (error) {
    console.error('Error booking consultation or sending email:', error);
    alert('Failed to book consultation or send email. Please try again.');
  }
};

const sendEmail = (email, username, doctorName, date, timeSlot) => {
  fetch('https://us-central1-mindwell-f5a26.cloudfunctions.net/sendEmail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      subject: 'Mindwell Consultation Booking Confirmation',
      text: `Hi ${username},

Thank you for booking a consultation with Mindwell. Here are your booking details:
Date: ${date}
Time: ${timeSlot}
Doctor: Dr. ${doctorName}.

We look forward to supporting you.`,
      html: `<strong>Hi ${username},</strong><br/><br/>Thank you for booking a consultation with Mindwell. Here are your booking details:<br/>Date: ${date}<br/>Time: ${timeSlot}<br/>Doctor: Dr. ${doctorName}.<br/><br/>We look forward to supporting you.`
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Email sent successfully:', data);
  })
  .catch((error) => {
    console.error('Error sending email:', error);
  });
};

const paginatedDoctors = computed(() => {
  const start = currentPage.value * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredDoctors.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredDoctors.value.length / itemsPerPage));

const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) currentPage.value++;
};

const prevPage = () => {
  if (currentPage.value > 0) currentPage.value--;
};

onMounted(fetchAvailableDoctors);
</script>

<style scoped>
.consultation-booking {
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
.calendar-section, .doctor-search, .doctor-list {
  margin-bottom: 30px;
}
.doctor-slider {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
}
.slider-button {
  background-color: #4caf50;
  color: white;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  transition: background-color 0.3s;
}
.slider-button:hover {
  background-color: #45a049;
}
.slider-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.doctor-grid-container {
  overflow: hidden;
  flex-grow: 1;
}
.doctor-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  scroll-behavior: smooth;
}
.doctor-card {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.time-slots {
  margin-top: 10px;
}
.time-slot {
  margin-bottom: 5px;
}
.available {
  color: green;
}
.booked {
  color: red;
}
button {
  margin-top: 10px;
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
input[type="text"], input[type="date"] {
  margin-bottom: 10px;
  padding: 8px;
  width: calc(100% - 16px);
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