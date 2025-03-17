<template>
  <div class="home-container">
    <!-- Banner Image -->
    <div class="banner-container">
      <div class="banner-image">
        <img src="@/assets/recommendpage.png" alt="Sunscreen recommendation banner" class="full-width-banner" />
        <div class="banner-text-overlay">
          <h1>Protect Your Skin Today For A Healthier Tomorrow - Because The Sun Never Forgets.</h1>
        </div>
      </div>
    </div>

    <!-- Left Section -->
    <!-- 左侧区域 -->
    <div class="left-section">
      <!-- 位置搜索 -->
      <div class="location-area">
        <h2 class="section-title">LOCATION:</h2>
        <div class="mapbox-search">
          <input ref="mapboxInput" type="text" v-model="locationInput" @input="handleLocationInput"
            @keydown.enter="selectSuggestion(0)" placeholder="Enter your location" />
          <div v-if="suggestions.length > 0" class="suggestions-dropdown">
            <div v-for="(suggestion, index) in suggestions" :key="index" class="suggestion-item"
              @click="selectSuggestion(index)">
              {{ suggestion.place_name }}
            </div>
          </div>
        </div>
      </div>

      <!-- UV指数仪表盘 -->
      <div class="uv-meter">
        <div class="gauge-container">
          <!-- 使用提供的仪表盘图片 -->
          <img src="@/assets/Indexlevel.png" alt="UV Index Gauge" class="uv-gauge-image" />

          <!-- 指针和数值叠加层 -->
          <div class="gauge-overlay">
            <!-- 动态旋转的指针 -->
            <div class="pointer-container" :style="{ transform: `rotate(${getPointerRotation()}deg)` }">
              <div class="pointer"></div>
            </div>

            <!-- 右侧的UV数值显示 -->
            <div class="uv-value">{{ uvIndex.toFixed(1) }}</div>
          </div>
        </div>

        <div class="uv-info">
          <h3 class="uv-level">{{ getUVLevelText() }}</h3>
          <p class="last-updated" v-if="lastUpdated">Last updated: {{ lastUpdated }}</p>
        </div>
      </div>

      <!-- 防护装备推荐 -->
      <div class="clothing-recommendations">
        <h3 class="clothing-title">CLOTHINGS</h3>
        <div class="clothing-icons">
          <!-- 太阳镜 -->
          <div class="clothing-item" :class="{ active: shouldShowSunglasses }">
            <img src="@/assets/sunglass.png" alt="Sunglasses" />
          </div>
          <!-- 口罩 -->
          <div class="clothing-item" :class="{ active: shouldShowMask }">
            <img src="@/assets/mask.png" alt="Mask" />
          </div>
          <!-- 帽子 -->
          <div class="clothing-item" :class="{ active: shouldShowHat }">
            <img src="@/assets/hat.png" alt="Hat" />
          </div>
          <!-- 遮阳伞 -->
          <div class="clothing-item" :class="{ active: shouldShowUmbrella }">
            <img src="@/assets/umbrella.png" alt="Umbrella" />
          </div>
          <!-- 防晒服 -->
          <div class="clothing-item" :class="{ active: shouldShowSunproof }">
            <img src="@/assets/sunproof.png" alt="Sun-proof Clothing" />
          </div>
        </div>
        <div class="home-container">
          <!-- Reminder Button -->
          <div class="reminder-button-container">
            <button @click="openReminderModal" class="btn-reminder">Set Reminder</button>
          </div>

          <!-- Reminder Modal -->
          <div v-if="isModalOpen" class="modal-overlay">
            <div class="modal-container">
              <h2>Reminder Yourself</h2>
              <div class="modal-content">
                <!-- 用户输入倒计时时长，格式：1s, 2m, 3h -->
                <input v-model="timeInput" type="text" class="form-input" placeholder="Enter time (e.g., 1s, 2m, 3h)" />
                <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
                <button @click="startTimer" class="btn-submit">Start Timer</button>
                <button @click="stopTimer" class="btn-cancel">Cancel Timer</button>
              </div>
              <button @click="closeReminderModal" class="btn-close"></button>
            </div>
          </div>
        </div>
      </div>
      <!-- 主页面上的计时状态显示 -->
      <div v-if="isTimerRunning" class="main-timer-status">
        <p>Time Remaining: {{ countdown }}s</p>
      </div>
      <p v-if="showReminder" class="main-reminder-message">Hello, you should apply sunscreen!</p>
    </div>



    <!-- 右侧区域 -->
    <div class="right-section">
      <!-- 肤质选择 -->
      <div class="skin-type-selector">
        <h2 class="section-title">YOUR SKIN TYPE:</h2>
        <select v-model="selectedSkinType">
          <option value="" disabled>Select your skin type</option> <!-- 默认占位选项 -->
          <option value="dry">Dry</option>
          <option value="combination">Combination</option>
          <option value="normal">Normal</option>
          <option value="oily">Oily</option>
        </select>
      </div>

      <!-- 肤色选择 -->
      <div class="skin-color-selector">
        <h2 class="section-title">YOUR SKIN COLOR:</h2>
        <div class="skin-color-options">
          <div v-for="(color, index) in skinColors" :key="index" class="skin-color-item"
            :style="{ backgroundColor: color.hex }" :class="{ active: selectedSkinColorType === index + 1 }"
            @click="selectedSkinColorType = index + 1"></div>
        </div>
      </div>

      <!-- 防晒建议 -->
      <div class="sunscreen-recommendations">
        <div class="sunscreen-image">
          <img src="@/assets/suncream.png" alt="Sunscreen" />
        </div>
        <div class="sunscreen-info">
          <h2 class="spf-recommendation">{{ getSPFRecommendation() }}</h2>
          <h3 class="reapplication-time">{{ getReapplicationTime() }}</h3>
        </div>
      </div>

      <!-- 额外防护建议 -->
      <div class="extra-protection-advice">
        <p>{{ getExtraProtectionAdvice() }}</p>
      </div>
      <!-- 底部导航 -->
      <div class="footer">
        <h2 class="footer-title">More Data About Sun Damage:</h2>
        <router-link to="/visualisation" class="more-link">Click to SEE MORE</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
// 注意：需要安装mapbox-gl包
// npm install mapbox-gl
// 如果只使用geocoding API可能不需要完整的mapbox-gl
// import mapboxgl from 'mapbox-gl';
// import 'mapbox-gl/dist/mapbox-gl.css';

export default {
  name: 'HomeView',
  setup() {
    // Mapbox配置
    const mapboxToken = 'pk.eyJ1IjoiY2hsb2V5dWUiLCJhIjoiY204YTdyNXA3MTloZjJqcHNhYjZ1c2thbCJ9.X4D17rgTFDpXuC8KUfvKLQ';

    // 响应式状态
    const locationInput = ref('Melbourne');
    const selectedLocation = ref({ lat: -37.8136, lng: 144.9631 }); // 默认墨尔本
    const suggestions = ref([]);
    const uvIndex = ref(5); // 默认UV指数为5
    const lastUpdated = ref('');
    const selectedSkinType = ref(null); // 默认干性
    const selectedSkinColorType = ref(null); // 默认1型
    const mapboxInput = ref(null);
    const isModalOpen = ref(false);
    const timeInput = ref("");
    const countdown = ref(0);
    const isTimerRunning = ref(false);
    const showReminder = ref(false);
    const errorMessage = ref("");
    const timer = ref(null);

    // 肤色选项
    const skinColors = [
      { type: 1, hex: '#422E22' }, // I型
      { type: 2, hex: '#9C6D51' }, // II型
      { type: 3, hex: '#BE8A67' }, // III型
      { type: 4, hex: '#D7B195' }, // IV型
      { type: 5, hex: '#E5CDAF' }, // V型
      { type: 6, hex: '#F4E6D4' }  // VI型
    ];

    // 计算属性：基于UV指数决定显示哪些防护装备
    const shouldShowSunglasses = computed(() => uvIndex.value >= 5);
    const shouldShowUmbrella = computed(() => uvIndex.value >= 7);
    const shouldShowSunproof = computed(() => uvIndex.value >= 10);
    const shouldShowMask = computed(() => uvIndex.value >= 10);
    const shouldShowHat = computed(() => uvIndex.value >= 10);

    // 获取UV等级文本
    const getUVLevelText = () => {
      const index = uvIndex.value;

      if (index <= 2) return 'EXTREMELY LOW';
      if (index <= 4) return 'LOW';
      if (index <= 6) return 'MEDIUM';
      if (index <= 9) return 'EXTREMELY HIGH';
      return 'EXTREME';
    };

    // 获取SPF推荐
    const getSPFRecommendation = () => {
      const index = uvIndex.value;
      const skinType = selectedSkinColorType.value;

      // 根据UV指数和肤色类型返回SPF推荐
      if (index <= 2) { // UV指数1级(0-2)
        if (skinType <= 2) return 'SPF 15+';
        return 'MOISTURIZER';
      } else if (index <= 4) { // UV指数2级(3-4)
        if (skinType === 1) return 'SPF 30+';
        if (skinType === 2) return 'SPF 15-30';
        if (skinType === 3) return 'SPF 15+';
        return 'SPF 15';
      } else if (index <= 6) { // UV指数3级(5-6)
        if (skinType === 1) return 'SPF 50+';
        if (skinType === 2) return 'SPF 30-50';
        if (skinType === 3) return 'SPF 30+';
        if (skinType === 4) return 'SPF 15-30';
        return 'SPF 15+';
      } else if (index <= 9) { // UV指数4级(7-9)
        if (skinType === 1) return 'WATER-PROOF SPF 50+';
        if (skinType === 2) return 'SPF 50+';
        if (skinType === 3) return 'SPF 30-50';
        if (skinType === 4) return 'SPF 30+';
        if (skinType === 5) return 'SPF 15-30';
        return 'SPF 15+';
      } else { // UV指数5级(≥10)
        if (skinType === 1) return 'SPF 50+ PA++++';
        if (skinType === 2) return 'SPF 50+ PA++++';
        if (skinType === 3) return 'SPF 50+';
        if (skinType === 4) return 'SPF 30-50';
        if (skinType === 5) return 'SPF 30+';
        return 'SPF 15-30';
      }
    };

    // 获取重新涂抹时间
    const getReapplicationTime = () => {
      const index = uvIndex.value;
      const skinType = selectedSkinColorType.value;

      // 根据UV指数和肤色类型返回重新涂抹时间
      if (index <= 2) { // UV指数1级(0-2)
        return '';
      } else if (index <= 4) { // UV指数2级(3-4)
        return 'EVERY SIX HOURS';
      } else if (index <= 6) { // UV指数3级(5-6)
        if (skinType === 1) return 'EVERY TWO HOURS';
        if (skinType === 2) return 'EVERY THREE HOURS';
        if (skinType === 3 || skinType === 4) return 'EVERY FOUR HOURS';
        return 'EVERY SIX HOURS';
      } else if (index <= 9) { // UV指数4级(7-9)
        if (skinType === 1) return 'EVERY 1-2 HOURS';
        if (skinType === 2) return 'EVERY TWO HOURS';
        if (skinType === 3) return 'EVERY THREE HOURS';
        if (skinType === 4) return 'EVERY FOUR HOURS';
        if (skinType === 5) return 'EVERY 4-6 HOURS';
        return 'EVERY SIX HOURS';
      } else { // UV指数5级(≥10)
        if (skinType === 1) return 'EVERY HOUR';
        if (skinType === 2) return 'EVERY 1-2 HOURS';
        if (skinType === 3) return 'EVERY TWO HOURS';
        if (skinType === 4) return 'EVERY THREE HOURS';
        if (skinType === 5) return 'EVERY FOUR HOURS';
        return 'EVERY 4-6 HOURS';
      }
    };

    // 获取额外防护建议
    const getExtraProtectionAdvice = () => {
      const index = uvIndex.value;
      const skinType = selectedSkinColorType.value;
      const skinTextureType = selectedSkinType.value;

      let advice = '';

      // 根据肤质给出防晒霜类型建议 (英文版)
      if (skinTextureType === 'dry') {
        advice += 'Use hydrating sunscreen to prevent dryness';
      } else if (skinTextureType === 'oily') {
        advice += 'Use oil-control sunscreen to reduce shine';
      } else if (skinTextureType === 'combination') {
        advice += 'Use oil-control sunscreen for T-zone, hydrating formula for other areas';
      } else if (skinTextureType === 'normal') {
        advice += 'Any type of sunscreen suits well for your skin';
      }

      // 添加额外防护建议 (英文版)
      if (index >= 5 && skinType <= 3) {
        advice += advice ? ', wear sunglasses' : 'Wear sunglasses';
      }

      if (index >= 7) {
        if (skinType <= 2) {
          advice += advice ? ', use umbrella and hat' : 'Use umbrella and hat';
        } else if (skinType <= 4 && index >= 8) {
          advice += advice ? ', wear a hat' : 'Wear a hat';
        }
      }

      if (index >= 10 && skinType === 1) {
        advice += advice ? ', avoid outdoor activities' : 'Avoid outdoor activities';
      }

      return advice;
    };

    // 获取指针旋转角度
    const getPointerRotation = () => {
      // 限制UV指数范围在1到11+之间
      const index = Math.min(Math.max(uvIndex.value, 1), 11);

      // 计算角度：
      // -90度是指针起始位置（指向左侧最低值）
      // 180度是指针覆盖的总角度范围
      // (index - 1) / 10 计算当前UV在范围内的比例
      const startAngle = -90;
      const angleRange = 180;
      const portion = (index - 1) / 10; // 0到1之间的比例

      return startAngle + (portion * angleRange);
    };

    // 处理位置输入
    const handleLocationInput = async () => {
      if (locationInput.value.length < 3) {
        suggestions.value = [];
        return;
      }

      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationInput.value)}.json?access_token=${mapboxToken}&types=place,locality,neighborhood,address`
        );

        if (!response.ok) throw new Error('Failed to fetch suggestions');

        const data = await response.json();
        suggestions.value = data.features;
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        suggestions.value = [];
      }
    };

    // 选择建议
    const selectSuggestion = async (index) => {
      if (suggestions.value.length <= index) return;

      const selected = suggestions.value[index];
      locationInput.value = selected.place_name;
      suggestions.value = [];

      // 更新位置坐标
      selectedLocation.value = {
        lng: selected.center[0],
        lat: selected.center[1]
      };

      // fetchUVData将由selectedLocation的watch处理
      // 数据将在fetchUVData中保存
    };

    // 获取UV数据
    const fetchUVData = async () => {
      try {
        const { lat, lng } = selectedLocation.value;
        console.log('Request URL:', `http://localhost:3000/api/uv?lat=${lat}&lng=${lng}`);

        let dataSource = 'API'; // 跟踪数据来源

        try {
          // 尝试获取实际UV数据
          const response = await fetch(`http://localhost:3000/api/uv?lat=${lat}&lng=${lng}`);

          if (!response.ok) {
            throw new Error(`Request failed with status: ${response.status}`);
          }

          const data = await response.json();
          console.log('API response:', data);

          if (data.success && data.data && data.data.result) {
            uvIndex.value = parseFloat(data.data.result.uv);
            const uvTime = new Date(data.data.result.uv_time);
            lastUpdated.value = uvTime.toLocaleString();
          } else {
            throw new Error('Invalid API data format');
          }
        } catch (error) {
          console.error('Error fetching UV data, trying mock data:', error);
          dataSource = 'Mock'; // 更新数据来源

          // 尝试使用模拟数据
          console.log('Trying mock data URL:', `http://localhost:3000/api/uv/mock/coords?lat=${lat}&lng=${lng}`);

          try {
            const mockResponse = await fetch(`http://localhost:3000/api/uv/mock/coords?lat=${lat}&lng=${lng}`);

            if (!mockResponse.ok) {
              throw new Error(`Mock data request failed with status: ${mockResponse.status}`);
            }

            const mockData = await mockResponse.json();
            console.log('Mock API response:', mockData);

            if (mockData.success && mockData.data && mockData.data.result) {
              uvIndex.value = parseFloat(mockData.data.result.uv);
              const uvTime = new Date(mockData.data.result.uv_time);
              lastUpdated.value = uvTime.toLocaleString() + ' (Mock data)';
            } else {
              throw new Error('Invalid mock API data format');
            }
          } catch (mockError) {
            console.error('Error fetching mock data:', mockError);
            dataSource = 'Default'; // 更新数据来源

            // 如果模拟数据也失败，使用默认UV值
            console.log('Real API and mock API both unavailable, using default UV value');
            uvIndex.value = 5;
            lastUpdated.value = new Date().toLocaleString() + ' (Default value)';
          }
        }

        // 保存到localStorage，包括数据来源信息
        const currentTime = Date.now();
        const locationName = locationInput.value;
        saveToLocalStorage(locationName, uvIndex.value, lastUpdated.value, currentTime, dataSource);
      } catch (error) {
        console.error('Overall processing error:', error);
        uvIndex.value = 5;
        lastUpdated.value = new Date().toLocaleString() + ' (Default value)';

        // 即使发生错误，仍保存默认值
        const currentTime = Date.now();
        const locationName = locationInput.value;
        saveToLocalStorage(locationName, uvIndex.value, lastUpdated.value, currentTime, 'Default');
      }
    };

    // 保存到localStorage，使用统一的格式
    const saveToLocalStorage = (location, index, updated, timestamp, source = 'API') => {
      // 确保清理所有旧键
      cleanupLocalStorage();

      // 创建统一的数据结构
      const data = {
        location: location,
        coordinates: selectedLocation.value,
        lastUpdated: updated,
        skinColorType: selectedSkinColorType.value,
        skinType: selectedSkinType.value,
        uvIndex: index,
        timestamp: timestamp,
        source: source
      };

      // 使用单一键存储所有数据
      localStorage.setItem('sunscreenApp_data', JSON.stringify(data));
      console.log('Saved to localStorage:', data);
    };

    // 从localStorage加载
    const loadFromLocalStorage = () => {
      try {
        // 加载数据
        const dataString = localStorage.getItem('sunscreenApp_data');
        if (dataString) {
          const data = JSON.parse(dataString);
          console.log('Loaded data from localStorage:', data);

          // 设置所有数据
          locationInput.value = data.location || 'Melbourne';
          selectedLocation.value = data.coordinates || { lat: -37.8136, lng: 144.9631 };
          uvIndex.value = parseFloat(data.uvIndex) || 5;
          lastUpdated.value = data.lastUpdated || new Date().toLocaleString();
          selectedSkinType.value = data.skinType || 'dry';
          selectedSkinColorType.value = data.skinColorType || 1;
        } else {
          // 设置并保存默认值
          console.log('No data found, setting defaults');
          locationInput.value = 'Melbourne';
          selectedLocation.value = { lat: -37.8136, lng: 144.9631 };
          selectedSkinType.value = 'dry';
          selectedSkinColorType.value = 1;

          // 初始保存默认值到localStorage
          saveToLocalStorage(
            'Melbourne',
            5,
            new Date().toLocaleString(),
            Date.now(),
            'Default'
          );
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);

        // 出错时设置默认值
        locationInput.value = 'Melbourne';
        selectedLocation.value = { lat: -37.8136, lng: 144.9631 };
        selectedSkinType.value = 'dry';
        selectedSkinColorType.value = 1;
      }
    };

    // 监听肤色和肤质选择变化，保存首选项
    watch([selectedSkinType, selectedSkinColorType], () => {
      // 当用户更改肤色/肤质设置时保存
      saveToLocalStorage(
        locationInput.value,
        uvIndex.value,
        lastUpdated.value,
        Date.now(),
        'User preference update'
      );
    }, { deep: true });

    // 监听位置变化，重新获取UV数据
    watch(selectedLocation, () => {
      // 当用户选择新位置时获取新数据
      // 数据将通过fetchUVData保存
      fetchUVData();
    }, { deep: true });

    // 组件挂载和卸载
    onMounted(() => {
      // 清理所有旧键
      cleanupLocalStorage();

      // 从localStorage加载数据
      loadFromLocalStorage();

      // 如果没有有效的UV数据或位置信息已更改，获取新数据
      if (!lastUpdated.value) {
        console.log('No valid UV data in localStorage, fetching new data');
        fetchUVData();
      } else {
        console.log('Using UV data from localStorage:', {
          location: locationInput.value,
          index: uvIndex.value,
          lastUpdated: lastUpdated.value
        });
      }
    });

    // 清理localStorage中的旧键
    const cleanupLocalStorage = () => {
      const keysToRemove = [
        'sunscreenApp',
        'sunscreenApp_uvData',
        'sunscreenApp_preferences',
        'uvData',
        'uvUserInfo'
      ];

      keysToRemove.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          console.log(`Removed old localStorage key: ${key}`);
        }
      });
    };

    const openReminderModal = () => {
      isModalOpen.value = true;
      errorMessage.value = "";
    };

    const closeReminderModal = () => {
      isModalOpen.value = false;
    };

    // 解析用户输入的时间 (1s, 2m, 3h)
    const parseTimeInput = (input) => {
      const regex = /^(\d+h)?(\d+m)?(\d+s)?$/;
      if (!regex.test(input)) return null;

      let totalSeconds = 0;
      const match = input.match(/(\d+)h/);
      if (match) totalSeconds += parseInt(match[1]) * 3600;

      const matchMinutes = input.match(/(\d+)m/);
      if (matchMinutes) totalSeconds += parseInt(matchMinutes[1]) * 60;

      const matchSeconds = input.match(/(\d+)s/);
      if (matchSeconds) totalSeconds += parseInt(matchSeconds[1]);

      return totalSeconds;
    };

    const startTimer = () => {
      if (isTimerRunning.value) return; // 防止重复启动

      const totalSeconds = parseTimeInput(timeInput.value);
      if (!totalSeconds || totalSeconds <= 0) {
        errorMessage.value = "Invalid time format. Use 1s, 2m, 3h, etc.";
        return;
      }
      countdown.value = totalSeconds;
      isTimerRunning.value = true;
      showReminder.value = false;
      isModalOpen.value = false;

      timer.value = setInterval(() => {
        if (countdown.value > 1) {
          countdown.value--;
        } else {
          showReminder.value = true;
          // 播放提示音
          const audio = new Audio('/assets/reminder.mp3'); // 确保路径正确
          audio.play();
          countdown.value = totalSeconds; // 重新开始循环计时
        }
      }, 1000);
    };

    const stopTimer = () => {
      if (timer.value) {
        clearInterval(timer.value);
        timer.value = null;
      }
      isTimerRunning.value = false;
      countdown.value = 0;
      showReminder.value = false;
    };

    // 组件卸载时，清理计时器
    onUnmounted(() => {
      stopTimer();
    });

    return {
      // 状态
      locationInput,
      selectedLocation,
      suggestions,
      uvIndex,
      lastUpdated,
      selectedSkinType,
      selectedSkinColorType,
      skinColors,
      mapboxInput,

      // 计算属性
      shouldShowSunglasses,
      shouldShowUmbrella,
      shouldShowSunproof,
      shouldShowMask,
      shouldShowHat,

      // 方法
      handleLocationInput,
      selectSuggestion,
      getUVLevelText,
      getSPFRecommendation,
      getReapplicationTime,
      getExtraProtectionAdvice,
      getPointerRotation,
      // 提醒功能
      isModalOpen,
      openReminderModal,
      closeReminderModal,
      timeInput,
      countdown,
      isTimerRunning,
      showReminder,
      errorMessage,
      startTimer,
      stopTimer,
    };
  }
};
</script>

<style scoped>
.home-container {
  display: flex;
  flex-wrap: wrap;
  max-width: 1400px;
  margin: 0 auto;
  padding: 10px;
  font-family: 'Arial', sans-serif;
  color: #5A4132;
}

/* Banner Image */
.banner-container {
  position: relative;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  margin-bottom: 30px;
}

.banner-image {
  width: 100%;
  position: relative;
}

.full-width-banner {
  width: 100%;
  height: 500px;
  object-fit: cover;
  object-position: center 50%;
  display: block;
}

.banner-text-overlay {
  position: absolute;
  top: 80%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 20px;
  border-radius: 10px;
  max-width: 100%;
}

.banner-text-overlay h1 {
  margin: 0;
  color: #5A4132;
  font-size: 28px;
  font-weight: bold;
}

/* 左右区域 */
.left-section,
.right-section {
  padding: 20px;
}

.left-section {
  flex: 1;
  min-width: 400px;
}

.right-section {
  flex: 1;
  min-width: 400px;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #5A4132;
}

.mapbox-search {
  position: relative;
  margin-bottom: 20px;
}

.mapbox-search input {
  width: 100%;
  padding: 10px 15px;
  border: 2px solid #5A4132;
  border-radius: 25px;
  font-size: 16px;
}

.suggestions-dropdown {
  position: absolute;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 5px 5px;
  background-color: white;
  z-index: 10;
}

.suggestion-item {
  padding: 10px 15px;
  cursor: pointer;
}

.suggestion-item:hover {
  background-color: #f5f5f5;
}

/* UV仪表盘 */
.uv-meter {
  margin: 10px 0;
  text-align: center;
}

.gauge-container {
  position: relative;
  width: 180%;
  max-width: 400px;
  margin: 0 auto;
}

.uv-gauge-image {
  margin-top: 10px;
  width: 100%;
  height: auto;
  display: block;
}

.gauge-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.pointer-container {
  position: absolute;
  bottom: 28%;
  left: 50%;
  width: 0;
  height: 0;
  transform-origin: center bottom;
  transition: transform 0.5s ease-out;
}

.pointer {
  position: absolute;
  bottom: 0;
  left: -2px;
  width: 4px;
  height: 50px;
  /* 缩短指针长度 */
  background-color: #5A4132;
  transform: translateX(-50%);
}

.pointer::after {
  content: '';
  position: absolute;
  top: -5px;
  left: -1px;
  width: 6px;
  height: 6px;
  background-color: #5A4132;
  border-radius: 50%;
}

.uv-value {
  position: absolute;
  top: 15%;
  left: 50%;
  /* 把UV值移到右侧 */
  transform: translate(-50%, -50%);
  font-size: 45px;
  font-weight: bold;
  color: #5A4132;
}

.uv-info {
  margin-top: 10px;
  text-align: center;
}

.uv-info .uv-level {
  font-size: 22px;
  font-weight: bold;
  margin: 5px 0;
  color: #5A4132;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.uv-info .last-updated {
  font-size: 14px;
  color: #777;
  font-style: italic;
}

/* 防护装备推荐 */
.clothing-recommendations {
  margin: 20px 0;
}

.clothing-title {
  text-align: center;
  font-size: 20px;
  margin-bottom: 15px;
}

.clothing-icons {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}

.clothing-item {
  width: 60px;
  height: 60px;
  margin: 10px;
  opacity: 0.2;
  /* 降低非活动图标的透明度 */
  filter: grayscale(80%);
  /* 添加灰度滤镜增加对比 */
  transition: all 0.3s ease;
  background-color: #f5f5f5;
  /* 添加背景色 */
  border-radius: 8px;
  padding: 8px;
}

.clothing-item.active {
  opacity: 1;
  filter: grayscale(0%);
  /* 移除灰度滤镜 */
  background-color: #fffbea;
  /* 更亮的背景色 */
  box-shadow: 0 0 8px rgba(90, 65, 50, 0.3);
  /* 添加阴影 */
  transform: scale(1.05);
  /* 放大效果 */
}

.clothing-item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 肤质选择 */
.skin-type-selector select {
  width: 100%;
  padding: 10px 15px;
  border: 2px solid #5A4132;
  border-radius: 25px;
  font-size: 16px;
  background-color: white;
  margin-bottom: 20px;
}

/* 肤色选择 */
.skin-color-options {
  display: flex;
  justify-content: space-between;
  margin: 15px 0 30px;
}

.skin-color-item {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.skin-color-item:hover {
  transform: scale(1.1);
}

.skin-color-item.active {
  transform: scale(1.2);
  box-shadow: 0 0 0 3px #5A4132;
}

/* 防晒建议 */
.sunscreen-recommendations {
  display: flex;
  align-items: center;
  margin: 20px 0;
}

.sunscreen-image {
  flex: 0 0 120px;
}

.sunscreen-image img {
  width: 100%;
  height: auto;
}

.sunscreen-info {
  flex: 1;
  padding-left: 20px;
}

.spf-recommendation {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.reapplication-time {
  font-size: 18px;
}

/* 额外防护建议 */
.extra-protection-advice {
  margin: 20px 0;
  padding: 15px;
  background-color: #f8f4e9;
  border-radius: 10px;
  border-left: 4px solid #5A4132;
  font-size: 16px;
  line-height: 1.5;
}

.extra-protection-advice p {
  margin: 0;
  color: #5A4132;
}

.footer {
  width: 100%;
  text-align: center;
  margin-top: 40px;
  padding: 10px 0;
}

.footer-title {
  width: 100%;
  text-align: center;
  margin-top: 0px;
  padding: 10px 0;
  color: #5A4132;
}

.more-link {
  display: inline-block;
  padding: 24px 60px;
  background-color: #5A4132;
  color: white;
  text-decoration: none;
  border-radius: 45px;
  font-weight: bold;
  transition: background-color 0.3s;
}

/* 各类按钮 */
.btn-submit,
.btn-cancel,
.btn-close {
  background-color: #5A3E2B;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin: 5px;
}

.btn-submit:disabled {
  background-color: #bbb;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  /* 确保弹窗在最上层 */
}

.more-link:hover {
  background-color: #7a6152;
}

.btn-reminder {
  display: inline-block;
  padding: 24px 60px;
  background-color: #5A4132;
  color: white;
  text-decoration: none;
  border-radius: 45px;
  font-weight: bold;
  transition: background-color 0.3s;
}

.btn-reminder:hover {
  background-color: #5A4132;
}

.reminder-button-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.modal-container {
  background: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  width: 300px;
}

/* 计时状态显示 */
.main-timer-status {
  margin-top: 20px;
  font-size: 18px;
  font-weight: bold;
  color: #5A3E2B;
  text-align: center;
}

/* 计时结束提醒信息 */
.main-reminder-message {
  font-size: 20px;
  color: red;
  font-weight: bold;
  margin-top: 10px;
  text-align: center;
}

/* 错误信息样式 */
.error-message {
  color: red;
  font-size: 14px;
  margin-top: 5px;
}
</style>