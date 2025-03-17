<template>
    <div class="cancer-rate-container">
      <h1>Cancer Rate Analysis</h1>
      
      <div v-if="loading" class="loading">
        Loading chart data...
      </div>
      
      <div v-else-if="error" class="error">
        {{ error }}
      </div>
      
      <div v-else-if="cancerData" class="chart-container">
        <div class="chart-wrapper">
          <canvas ref="cancerRateChart"></canvas>
        </div>
        
        <div class="data-table">
          <table>
            <thead>
              <tr>
                <th>Year</th>
                <th>Cancer Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in cancerData" :key="item.year">
                <td>{{ item.year }}</td>
                <td>{{ item.cancerrate }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="action-buttons">
          <button @click="fetchData" :disabled="loading">
            {{ loading ? 'Refreshing...' : 'Refresh Data' }}
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import Chart from 'chart.js/auto';
  import { apiService } from '@/services/apiService';
  
  export default {
    name: 'CancerRateChart',
    data() {
      return {
        cancerData: null,
        loading: true,
        error: null,
        chart: null
      }
    },
    methods: {
      async fetchData() {
        this.loading = true;
        this.error = null;
        try {
          this.cancerData = await apiService.getCancerData1();
          this.$nextTick(() => {
            this.renderChart();
          });
        } catch (error) {
          this.error = 'Failed to fetch cancer rate data';
          console.error(error);
        } finally {
          this.loading = false;
        }
      },
      renderChart() {
        // 如果已经有图表，先销毁
        if (this.chart) {
          this.chart.destroy();
        }
  
        const ctx = this.$refs.cancerRateChart.getContext('2d');
        this.chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: this.cancerData.map(item => item.year),
            datasets: [{
              label: '癌症发病率',
              data: this.cancerData.map(item => item.cancerrate),
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
              fill: false
            }]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: '癌症发病率趋势 (2015-2024)'
              },
              tooltip: {
                mode: 'index',
                intersect: false
              }
            },
            scales: {
              y: {
                title: {
                  display: true,
                  text: '癌症发病率'
                }
              }
            }
          }
        });
      }
    },
    mounted() {
      this.fetchData();
    }
  }
  </script>
  
  <style scoped>
  .cancer-rate-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .chart-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .chart-wrapper {
    width: 100%;
    max-width: 800px;
    height: 400px; /* 固定高度 */
    margin-bottom: 20px;
  }
  
  .data-table {
    width: 100%;
    max-width: 400px;
    margin-bottom: 20px;
  }
  
  .data-table table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .data-table th, 
  .data-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: center;
  }
  
  .data-table th {
    background-color: #f2f2f2;
  }
  
  .action-buttons {
    margin-top: 20px;
  }
  
  button {
    padding: 10px 15px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  .loading, .error {
    text-align: center;
    padding: 20px;
  }
  
  .error {
    color: red;
  }
  </style>