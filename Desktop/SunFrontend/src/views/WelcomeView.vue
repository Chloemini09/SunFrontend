<template>
  <div class="info-collection-container">

    <h1 class="main-title">Please tell us your information</h1>

    <div class="content-container">
      <div class="image-section">
        <img src="@/assets/info.png" alt="Sunscreen Protection" class="info-image" />
      </div>

      <div class="form-section">
        <div class="form-group">
          <label for="age" class="form-label">AGE</label>
          <input ref="ageInput" type="number" id="age" v-model="userInfo.age" class="form-input"
            @keydown.enter="focusSexInput" />
        </div>

        <div class="form-group">
          <label for="sex" class="form-label">SEX</label>
          <select ref="sexInput" id="sex" v-model="userInfo.sex" class="form-input"
            @keydown.enter="focusSkinColorInput">
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div class="form-group">
          <label for="skinColor" class="form-label">SKIN COLOR</label>
          <div class="skin-color-selector">
            <div v-for="(color, index) in skinColors" :key="index"
              :class="['skin-color-option', { 'selected': userInfo.skinColor === color }]"
              :style="{ backgroundColor: color }" @click="selectSkinColor(color)" tabindex="0" ref="skinColorInput"
              @keydown.enter="selectSkinColor(color)" @keydown.space.prevent="selectSkinColor(color)"></div>
          </div>
        </div>

        <div class="form-group">
          <label for="skinType" class="form-label">SKIN TYPE</label>
          <select ref="skinTypeInput" id="skinType" v-model="userInfo.skinType" class="form-input"
            @keydown.enter="focusLocationInput">
            <option value="normal">Normal</option>
            <option value="dry">Dry</option>
            <option value="oily">Oily</option>
            <option value="combination">Combination</option>
            <option value="sensitive">Sensitive</option>
          </select>
        </div>

        <div class="form-group">
          <label for="location" class="form-label">LOCATION</label>
          <select ref="locationInput" id="location" v-model="userInfo.location" class="form-input"
            @keydown.enter="submitInfo">
            <option v-for="city in australianCities" :key="city" :value="city">
              {{ city }}
            </option>
          </select>
        </div>

        <div class="timer-box">
          <h2>Set Reminder Timer</h2>
          <div class="timer-controls">
            <input v-model.number="timerDuration" type="number" min="1" class="form-input"
              placeholder="Enter seconds" />
            <button @click="startTimer" class="btn-submit">Start Timer</button>
            <button @click="stopTimer" class="btn-cancel">Cancel Timer</button>
          </div>
          <p class="timer-status" :class="{ 'running': isTimerRunning }">Timer: {{ countdown }}</p>
          <p v-if="showReminder" class="reminder-message">Hello, you should apply sunscreen!</p>
        </div>

        <div class="submit-container">
          <button ref="submitBtn" @click="submitInfo" class="btn-submit">
            SUBMIT TO GET ADVICE
          </button>
        </div>
      </div>
    </div>

    <footer class="page-footer">
      <p>Take care of your skin from sunshine.</p>
    </footer>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'InfoCollection',
  setup() {
    const router = useRouter();

    // Refs for form elements
    const ageInput = ref(null);
    const sexInput = ref(null);
    const skinColorInput = ref(null);
    const skinTypeInput = ref(null);
    const locationInput = ref(null);
    const submitBtn = ref(null);
    const timerDuration = ref(10); // 默认10秒
    const countdown = ref(0);
    const isTimerRunning = ref(false);
    const showReminder = ref(false);
    let timer = null;

    // Available skin colors
    const skinColors = [
      '#8B4513', // SaddleBrown
      '#CD853F', // Peru
      '#DEB887', // BurlyWood
      '#F5DEB3', // Wheat
      '#FFE4C4'  // Bisque
    ];

    // Australian cities
    const australianCities = [
      'Melbourne', 'Sydney', 'Brisbane', 'Perth', 'Adelaide',
      'Canberra', 'Hobart', 'Darwin', 'Gold Coast', 'Newcastle',
      'Cairns', 'Wollongong', 'Geelong', 'Townsville', 'Ballarat',
      'Bendigo', 'Albury', 'Launceston', 'Mackay', 'Rockhampton',
      'Bunbury', 'Bundaberg', 'Toowoomba', 'Wagga Wagga', 'Hervey Bay'
    ];

    // User information object with default values
    const userInfo = reactive({
      age: 25,                    // Default: 25 years old
      sex: 'female',              // Default: Female
      skinColor: skinColors[2],   // Default: Medium shade
      skinType: 'normal',         // Default: Normal skin
      location: 'Melbourne'       // Default: Melbourne
    });

    function startTimer() {
      if (timer) clearInterval(timer);
      countdown.value = timerDuration.value;
      isTimerRunning.value = true;
      timer = setInterval(() => {
        if (countdown.value > 0) {
          countdown.value--;
        } else {
          showReminder.value = true;
          setTimeout(() => {
            showReminder.value = false;
            startTimer();
          }, 3000);
        }
      }, 1000);
    }

    function stopTimer() {
      clearInterval(timer);
      isTimerRunning.value = false;
      countdown.value = 0;
      showReminder.value = false;
    }

    // Select skin color
    function selectSkinColor(color) {
      userInfo.skinColor = color;
    }

    // Focus functions for keyboard navigation
    function focusSexInput() {
      sexInput.value.focus();
    }

    function focusSkinColorInput() {
      if (skinColorInput.value && skinColorInput.value.length > 0) {
        skinColorInput.value[0].focus();
      }
    }

    function focusSkinTypeInput() {
      skinTypeInput.value.focus();
    }

    function focusLocationInput() {
      locationInput.value.focus();
    }

    // Submit user information
    function submitInfo() {
      // Save to localStorage
      localStorage.setItem('uvUserInfo', JSON.stringify(userInfo));

      // Navigate to advice page
      router.push('/recommendation');
    }

    onMounted(() => {
      // Check if user data exists in localStorage
      const savedUserInfo = localStorage.getItem('uvUserInfo');
      if (savedUserInfo) {
        Object.assign(userInfo, JSON.parse(savedUserInfo));
      }

      // Set initial focus
      ageInput.value.focus();
    });

    return {
      userInfo,
      skinColors,
      australianCities,
      selectSkinColor,
      submitInfo,
      // Return refs for template
      ageInput,
      sexInput,
      skinColorInput,
      skinTypeInput,
      locationInput,
      submitBtn,
      // Return focus functions
      focusSexInput,
      focusSkinColorInput,
      focusSkinTypeInput,
      focusLocationInput,
      timerDuration,
      countdown,
      isTimerRunning,
      showReminder,
      startTimer,
      stopTimer
    };
  }
}
</script>

<style scoped>
.timer-box {
  padding: 1rem;
  border: 2px solid #a67c52;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 1rem;
}

.timer-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.timer-status {
  font-size: 1.2rem;
  font-weight: bold;
}

.running {
  color: green;
}

.reminder-message {
  font-size: 1.2rem;
  color: red;
  font-weight: bold;
}

.btn-cancel {
  background-color: #d9534f;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

.btn-cancel:hover {
  background-color: #c9302c;
}

.info-collection-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #ffffff;
  font-family: Arial, sans-serif;
}

.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e0e0e0;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  height: 45px;
  object-fit: contain;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-item {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 0.5rem 0;
}

.nav-item:hover {
  color: #a67c52;
}

.main-title {
  font-size: 2rem;
  color: #333;
  text-align: center;
  margin: 3rem 0;
}

.content-container {
  display: flex;
  justify-content: center;
  gap: 5rem;
  padding: 0 2rem;
  margin-bottom: 3rem;
  flex: 1;
}

.image-section {
  flex: 1;
  max-width: 50%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.info-image {
  max-width: 100%;
  max-height: 600px;
  object-fit: cover;
}

.form-section {
  flex: 1;
  max-width: 50%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 1.2rem;
  color: #a67c52;
  font-weight: 500;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
}

select.form-input {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="%23a67c52" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>');
  background-repeat: no-repeat;
  background-position: right 0.7em top 50%;
  background-size: 0.65em auto;
  padding-right: 1.5rem;
}

.skin-color-selector {
  display: flex;
  gap: 0.5rem;
}

.skin-color-option {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.skin-color-option:hover,
.skin-color-option.selected {
  transform: scale(1.1);
  box-shadow: 0 0 0 2px #a67c52;
}

.submit-container {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
}

.btn-submit {
  background-color: #a67c52;
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-submit:hover {
  background-color: #8b6b43;
}

.page-footer {
  text-align: center;
  padding: 2rem;
  border-top: 1px solid #e0e0e0;
  font-size: 1rem;
  color: #666;
  margin-top: auto;
}

@media (max-width: 768px) {
  .content-container {
    flex-direction: column;
    gap: 2rem;
  }

  .image-section,
  .form-section {
    max-width: 100%;
  }

  .image-section {
    margin-bottom: 2rem;
  }
}
</style>