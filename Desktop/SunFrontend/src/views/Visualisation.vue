<template>
  <div class="page-container">
    <!-- 背景图片与标题部分 -->
    <header class="header-section">
      <div class="background-images">
        <img src="@/assets/image2.png" alt="Sun Protection" />
        <img src="@/assets/image1.jpg" alt="Sunbathing" />
        <img src="@/assets/image3.png" alt="Healthy Skin" />
      </div>
      <div class="title-overlay">
        <h1>“BRIGHTER DAYS, BIGGER RISKS - STAY PROTECTED !!”</h1>
      </div>
    </header>

    <!-- 图表内容部分，放置在背景图片的上方 -->
    <main class="charts-section">
      <div class="chart-container">
        <div class="chart-section">
          <h2> Incidence of skin cancer</h2>
          <div class="data1-button">
            <button @click="fetchData1" :disabled="loading1">
              {{ loading1 ? 'Loading...' : 'Click to SEE' }}
            </button>
          </div>
          <div v-if="loading1" class="loading">Loading...</div>
          <div v-else-if="error1" class="error">{{ error1 }}</div>
          <div v-if="cancerData1" class="chart-wrapper">
            <canvas ref="cancerChart1" :id="'cancerChart1Canvas'"></canvas>
          </div>
        </div>

        <div class="footer-section">
          <h2>“STAY SAFE KEEP ENJOYING !!”</h2>
        </div>

        <div class="chart-section">
          <h2>Mortality from skin cancer</h2>
          <div class="data2-button">
            <button @click="fetchData2" :disabled="loading2">
              {{ loading2 ? 'Loading...' : 'Click to SEE' }}
            </button>
          </div>
          <div v-if="loading2" class="loading">Loading...</div>
          <div v-else-if="error2" class="error">{{ error2 }}</div>
          <div v-if="cancerData2" class="chart-wrapper">
            <canvas ref="cancerChart2" :id="'cancerChart2Canvas'"></canvas>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';
import { apiService } from '@/services/apiService';
import { nextTick } from 'vue';

export default {
  name: 'Visualisation',
  data() {
    return {
      cancerData1: null,
      cancerData2: null,
      loading1: false,
      loading2: false,
      error1: null,
      error2: null,
      chart1: null,
      chart2: null
    }
  },
  methods: {
    async fetchData1() {
      this.loading1 = true;
      this.error1 = null;
      try {
        // 转换 Proxy 对象为普通数组
        const rawData = await apiService.getCancerData1();
        this.cancerData1 = rawData.map(item => ({ ...item }));

        // 使用 nextTick 确保 DOM 更新
        await nextTick();

        this.renderChart1();
      } catch (error) {
        this.error1 = 'Failed 1';
        console.error('Fetch data 1 error:', error);
      } finally {
        this.loading1 = false;
      }
    },
    async fetchData2() {
      this.loading2 = true;
      this.error2 = null;
      try {
        // 转换 Proxy 对象为普通数组
        const rawData = await apiService.getCancerData2();

        // 处理可能的重复年份问题（例如两个2023年的数据）
        const uniqueData = rawData.reduce((acc, current) => {
          const x = acc.find(item => item.year === current.year);
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);

        this.cancerData2 = uniqueData.map(item => ({ ...item }));

        // 使用 nextTick 确保 DOM 更新
        await nextTick();

        this.renderChart2();
      } catch (error) {
        this.error2 = 'Failed 2';
        console.error('Fetch data 2 error:', error);
      } finally {
        this.loading2 = false;
      }
    },
    renderChart1() {
      // 多重引用检查方法
      let canvasRef = this.$refs.cancerChart1;

      // 如果 ref 不存在，尝试通过 ID 获取
      if (!canvasRef) {
        canvasRef = document.getElementById('cancerChart1Canvas');
      }

      console.log('Canvas ref for chart 1:', canvasRef);

      if (!canvasRef) {
        console.error('Canvas reference for chart 1 is null or undefined');
        return;
      }

      // 销毁已存在的图表
      if (this.chart1) {
        this.chart1.destroy();
      }

      try {
        const ctx = canvasRef.getContext('2d');
        if (!ctx) {
          console.error('Could not get 2D context for chart 1');
          return;
        }

        this.chart1 = new Chart(ctx, {
          type: 'line',
          data: {
            labels: this.cancerData1.map(item => item.year),
            datasets: [{
              label: 'Cancer incidence rate',
              data: this.cancerData1.map(item => item.cancerrate),
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
              fill: false
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Trends in cancer incidence rates'
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
                  text: 'Incidence rate'
                }
              }
            }
          }
        });
      } catch (error) {
        console.error('Error rendering chart 1:', error);
      }
    },
    renderChart2() {
      // 多重引用检查方法
      let canvasRef = this.$refs.cancerChart2;

      // 如果 ref 不存在，尝试通过 ID 获取
      if (!canvasRef) {
        canvasRef = document.getElementById('cancerChart2Canvas');
      }

      console.log('Canvas ref for chart 2:', canvasRef);

      if (!canvasRef) {
        console.error('Canvas reference for chart 2 is null or undefined');
        return;
      }

      // 销毁已存在的图表
      if (this.chart2) {
        this.chart2.destroy();
      }

      try {
        const ctx = canvasRef.getContext('2d');
        if (!ctx) {
          console.error('Could not get 2D context for chart 2');
          return;
        }

        this.chart2 = new Chart(ctx, {
          type: 'line',
          data: {
            labels: this.cancerData2.map(item => item.year),
            datasets: [{
              label: 'Cancer Mortality Rate Trend (per 100k people)',
              data: this.cancerData2.map(item => item.cancer_mortality_rate),
              borderColor: 'rgb(192, 75, 192)',
              tension: 0.1,
              fill: false
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Cancer Mortality Rate Trend (per 100k people)'
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
                  text: 'Mortality Rate(per 100k people)'
                }
              }
            }
          }
        });
      } catch (error) {
        console.error('Error rendering chart 2:', error);
      }
    }
  },
  mounted() {
    // 自动加载数据
    this.fetchData1();
    this.fetchData2();
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Tomorrow:wght@400;700&display=swap');

.page-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* 背景图片和标题 */
.header-section {
  position: relative;
  width: 100%;
}

.background-images {
  display: flex;
  justify-content: center;
  width: 100%;
  position: absolute;
  top: 0;
  z-index: -1;
}

.background-images img {
  width: 33%;
  height: auto;
}

.title-overlay h1,
.footer-section h2 {
  font-family: 'Tomorrow', sans-serif;
}

.title-overlay {
  margin-top: 30px;
  position: relative;
  background-color: rgba(255, 255, 255, 0.5);
  padding: 80px;
  border-radius: 10px;
  font-size: 2rem;
  font-weight: bold;
  display: inline-block;
  /* 让背景仅适应内容 */
  max-width: 80%;
  /* 限制最大宽度 */
  width: fit-content;
  /* 使宽度自动适应内容 */
  text-align: center;
  /* 文本居中 */
}


/* 图表部分居中，控制顶部距离 */
.charts-section {
  position: relative;
  margin-top: 100px;
  /* 调整此值以控制图表距离顶部的距离 */
  width: 80%;
  z-index: 2;
}

.chart-container {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.chart-section {
  width: 45%;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

/* 页脚部分固定在背景图片的下方 */
.footer-section {
  background-color: rgba(255, 255, 255, 0.5);
  padding: 20px;
  border-radius: 10px;
  font-size: 2rem;
  font-weight: bold;
  display: flex;
  /* 使用flexbox布局 */
  justify-content: center;
  /* 水平居中 */
  align-items: center;
  /* 垂直居中 */
  text-align: center;
  /* 让文本居中 */
  width: 15%;
  /* 让宽度适应内容 */
  height: 400px;
  /* 固定高度 */
}

.chart-wrapper {
  width: 100%;
  /* 设置宽度为100%，以适应父容器 */
  height: 400px;
  /* 设置固定高度为400px */
}

.loading {
  color: #666;
  /* 设置加载文本的颜色为深灰色 */
  text-align: center;
  /* 文本居中对齐 */
  padding: 20px;
  /* 设置内边距为20px */
}

.error {
  color: red;
  /* 设置错误消息的颜色为红色，以突出错误信息 */
  text-align: center;
  /* 文本居中对齐 */
  padding: 20px;
  /* 设置内边距为20px */
}

button {
  margin: 0 auto;
  /* 让按钮水平居中 */
  padding: 10px 15px;
  /* 设置上下边距为10px，左右边距为15px */
  background-color: #5A4132;
  /* 设置按钮背景颜色为深棕色 */
  color: white;
  /* 文字颜色设置为白色 */
  border: none;
  /* 移除默认边框 */
  border-radius: 5px;
  /* 设置圆角，使按钮更美观 */
  cursor: pointer;
  /* 设置鼠标指针为手型，表示可点击 */
}

button:disabled {
  background-color: #cccccc;
  /* 设置禁用状态按钮的背景颜色为浅灰色 */
  cursor: not-allowed;
  /* 设置鼠标样式为禁用状态 */
}

button:hover:not(:disabled) {
  background-color: #808080;
  /* 设置鼠标悬停时的按钮背景颜色为灰色 */
}
</style>