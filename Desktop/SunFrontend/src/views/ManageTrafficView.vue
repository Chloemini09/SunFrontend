<template>
    <div class="admin-dashboard">
      <button class="back-btn" @click="goBack">← Back</button>
      <div class="chart-container">
        <div class="chart">
          <h2>User Login Statistics</h2>
          <canvas id="loginChart"></canvas>
        </div>
        <div class="chart">
          <h2>User Registration Statistics</h2>
          <canvas id="registrationChart"></canvas>
        </div>
      </div>
  
      <div class="chart-container">
        <div class="chart">
          <h2>Daily Posts Count</h2>
          <canvas id="postsChart"></canvas>
        </div>
        <div class="chart">
          <h2>Daily Bookings Count</h2>
          <canvas id="bookingsChart"></canvas>
        </div>
      </div>
  
      <div class="chart-container">
        <div class="chart">
          <h2>Daily Feedback Count</h2>
          <canvas id="feedbackChart"></canvas>
        </div>
        <div class="chart">
          <h2>Daily Health Tests Count</h2>
          <canvas id="healthTestsChart"></canvas>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { onMounted, ref } from 'vue';
  import { getFirestore, collection, getDocs } from 'firebase/firestore';
  import Chart from 'chart.js/auto';
  import { format } from 'date-fns';
  import 'chartjs-adapter-date-fns';
  import { useRouter } from 'vue-router'

  export default {
    name: 'AdminDashboardTrafficChart',
    setup() {
      const db = getFirestore();
      const postsLabels = ref([]);
      const postsPoints = ref([]);
      const bookingsLabels = ref([]);
      const bookingsPoints = ref([]);
      const feedbackLabels = ref([]);
      const feedbackPoints = ref([]);
      const feedbackAverageRatings = ref([]);
      const healthTestsLabels = ref([]);
      const healthTestsPoints = ref([]);
      const healthTestsAverageScores = ref([]);
      const loginLabels = ref([]);
      const loginPoints = ref([]);
      const registrationLabels = ref([]);
      const registrationPoints = ref([]);
      const router = useRouter();

      const goBack = () => {
        router.push('/admin')
      }
      const getDailyCounts = (documents, dateField) => {
        const counts = {};
        documents.forEach(doc => {
          const dateValue = doc.data()[dateField];
          const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue.toDate();
          const formattedDate = format(date, 'yyyy-MM-dd');
          counts[formattedDate] = (counts[formattedDate] || 0) + 1;
        });
        return counts;
      };
  
      const getPostsData = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'posts'));
          const counts = getDailyCounts(querySnapshot.docs, 'timestamp');
          postsLabels.value = Object.keys(counts);
          postsPoints.value = Object.values(counts);
        } catch (error) {
          console.error('Error getting posts data:', error);
        }
      };
  
      const getBookingsData = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'consultations'));
          const counts = getDailyCounts(querySnapshot.docs, 'date');
          bookingsLabels.value = Object.keys(counts);
          bookingsPoints.value = Object.values(counts);
        } catch (error) {
          console.error('Error getting bookings data:', error);
        }
      };
  
      const getFeedbackData = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'feedback'));
          const counts = getDailyCounts(querySnapshot.docs, 'timestamp');
          const ratingsSum = {};
          const ratingsCount = {};
  
          querySnapshot.docs.forEach(doc => {
            const feedback = doc.data();
            const formattedDate = format(feedback.timestamp.toDate(), 'yyyy-MM-dd');
            counts[formattedDate] = (counts[formattedDate] || 0) + 1;
  
            feedback.ratings.forEach((ratingObj, index) => {
              if (!ratingsSum[index]) {
                ratingsSum[index] = 0;
                ratingsCount[index] = 0;
              }
              ratingsSum[index] += ratingObj.rating;
              ratingsCount[index]++;
            });
          });
  
          feedbackLabels.value = Object.keys(counts);
          feedbackPoints.value = Object.values(counts);
          feedbackAverageRatings.value = Object.keys(ratingsSum).map(index => (ratingsSum[index] / ratingsCount[index]).toFixed(2));
        } catch (error) {
          console.error('Error getting feedback data:', error);
        }
      };
  
      const getHealthTestsData = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'healthTestResults'));
          const counts = getDailyCounts(querySnapshot.docs, 'date');
          const scoresSum = {};
          const scoresCount = {};
  
          querySnapshot.docs.forEach(doc => {
            const healthTest = doc.data();
            const formattedDate = format(healthTest.date.toDate(), 'yyyy-MM-dd');
            counts[formattedDate] = (counts[formattedDate] || 0) + 1;
  
            if (!scoresSum[formattedDate]) {
              scoresSum[formattedDate] = 0;
              scoresCount[formattedDate] = 0;
            }
            scoresSum[formattedDate] += healthTest.score;
            scoresCount[formattedDate]++;
          });
  
          healthTestsLabels.value = Object.keys(counts);
          healthTestsPoints.value = Object.values(counts);
          healthTestsAverageScores.value = Object.keys(scoresSum).map(date => (scoresSum[date] / scoresCount[date]).toFixed(2));
        } catch (error) {
          console.error('Error getting health tests data:', error);
        }
      };
  
      const getTrafficData = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'traffic'));
          const loginCounts = {};
  
          querySnapshot.docs.forEach(doc => {
            const traffic = doc.data();
            const formattedDate = format(traffic.date.toDate(), 'yyyy-MM-dd');
            loginCounts[formattedDate] = (loginCounts[formattedDate] || 0) + traffic.views;
          });
  
          loginLabels.value = Object.keys(loginCounts);
          loginPoints.value = Object.values(loginCounts);
        } catch (error) {
          console.error('Error getting login traffic data:', error);
        }
      };
  
      const getRegisterTrafficData = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'RegisterAmount'));
          const registrationCounts = {};
  
          querySnapshot.docs.forEach(doc => {
            const registration = doc.data();
            const formattedDate = format(registration.date.toDate(), 'yyyy-MM-dd');
            registrationCounts[formattedDate] = (registrationCounts[formattedDate] || 0) + registration.views;
          });
  
          registrationLabels.value = Object.keys(registrationCounts);
          registrationPoints.value = Object.values(registrationCounts);
        } catch (error) {
          console.error('Error getting registration traffic data:', error);
        }
      };
  
      const createChart = (ctx, labels, data, label, type, borderColor, backgroundColor) => {
        new Chart(ctx, {
          type: type,
          data: {
            labels: labels,
            datasets: [{
              label: label,
              data: data,
              borderColor: borderColor,
              backgroundColor: backgroundColor,
              borderWidth: 2,
            }]
          },
          options: {
            responsive: true,
            scales: {
              x: {
                type: 'time',
                time: {
                  unit: 'day'
                },
                title: {
                  display: true,
                  text: 'Date',
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Count',
                },
                beginAtZero: true,
              }
            }
          }
        });
      };
  
      onMounted(async () => {
        await getPostsData();
        await getBookingsData();
        await getFeedbackData();
        await getHealthTestsData();
        await getTrafficData();
        await getRegisterTrafficData();
  
        createChart(document.getElementById('postsChart').getContext('2d'), postsLabels.value, postsPoints.value, 'Daily Posts Count', 'bar', 'rgba(255, 99, 132, 1)', 'rgba(255, 99, 132, 0.2)');
        createChart(document.getElementById('bookingsChart').getContext('2d'), bookingsLabels.value, bookingsPoints.value, 'Daily Bookings Count', 'bar', 'rgba(255, 206, 86, 1)', 'rgba(255, 206, 86, 0.2)');
        createChart(document.getElementById('feedbackChart').getContext('2d'), feedbackLabels.value, feedbackPoints.value, 'Daily Feedback Count', 'bar', 'rgba(75, 192, 192, 1)', 'rgba(75, 192, 192, 0.2)');
        createChart(document.getElementById('healthTestsChart').getContext('2d'), healthTestsLabels.value, healthTestsPoints.value, 'Daily Health Tests Count', 'bar', 'rgba(153, 102, 255, 1)', 'rgba(153, 102, 255, 0.2)');
        createChart(document.getElementById('loginChart').getContext('2d'), loginLabels.value, loginPoints.value, 'Daily Login Count', 'line', 'rgba(54, 162, 235, 1)', 'rgba(54, 162, 235, 0.2)');
        createChart(document.getElementById('registrationChart').getContext('2d'), registrationLabels.value, registrationPoints.value, 'Daily Registration Count', 'line', 'rgba(255, 159, 64, 1)', 'rgba(255, 159, 64, 0.2)');
      });
  
      return {goBack};
    }
  };
  </script>
  
  <style scoped>
  .admin-dashboard {
    padding: 20px;
  }
  
  .chart-container {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 30px;
  }
  
  .chart {
    flex: 1;
  }
  
  canvas {
    max-width: 100%;
    height: 400px;
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