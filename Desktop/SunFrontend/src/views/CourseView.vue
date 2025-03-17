<template>
  <div class="user-courses" v-keyboard-navigation>
    <header class="header">
      <h1>Courses for You</h1>
    </header>
    <button class="back-btn" @click="goBack" ref="backBtnFocus">← Back</button>

    <!-- Latest Videos by Channel Section -->
    <div class="latest-videos" ref="latestVideosFocus">
      <h2>Latest Videos by Channel</h2>
      <div class="channel-grid">
        <div class="channel-card" v-for="channel in channels.slice(1)" :key="channel" ref="channelCardFocus">
          <h3>{{ channel }}</h3>
          <div class="video-grid">
            <div class="video-card" v-for="course in getLatestVideos(channel)" :key="course.id" ref="videoCardFocus">
              <a :href="course.videoUrl" target="_blank" ref="videoLinkFocus">
                <img :src="course.coverUrl" alt="Cover Image" class="video-cover" />
              </a>
              <h4>{{ course.title }}</h4>
              <p><strong>Category:</strong> {{ course.category }}</p>
              <div class="actions">
                <button @click="likeCourse(course)" class="btn-like" :disabled="course.userLiked" ref="likeBtnFocus">
                  👍 {{ course.likes }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Channel Filter Section -->
    <div class="channel-filter" ref="channelFilterFocus">
      <button v-for="channel in channels" :key="channel" @click="filterByChannel(channel)" :class="{ 'active-channel': selectedChannel === channel }" ref="filterBtnFocus">
        {{ channel }}
      </button>
    </div>

    <!-- Course List Section -->
    <div class="course-list" ref="courseListFocus">
      <h2>Courses in Selected Channel</h2>
      <div v-if="filteredCourses.length === 0">
        <p>No courses available in this category.</p>
      </div>
      <div v-else class="video-grid">
        <div class="video-card" v-for="course in filteredCourses" :key="course.id" ref="filteredVideoCardFocus">
          <a :href="course.videoUrl" target="_blank" ref="filteredVideoLinkFocus">
            <img :src="course.coverUrl" alt="Cover Image" class="video-cover" />
          </a>
          <h4>{{ course.title }}</h4>
          <p><strong>Category:</strong> {{ course.category }}</p>
          <div class="actions">
            <button @click="likeCourse(course)" class="btn-like" :disabled="course.userLiked" ref="filteredLikeBtnFocus">
              👍 {{ course.likes }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, nextTick } from "vue"
import { getFirestore, collection, getDocs, doc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'vue-router'

export default {
  setup() {
    const backBtnFocus = ref(null);
    const latestVideosFocus = ref(null);
    const channelCardFocus = ref(null);
    const videoCardFocus = ref(null);
    const videoLinkFocus = ref(null);
    const likeBtnFocus = ref(null);
    const channelFilterFocus = ref(null);
    const filterBtnFocus = ref(null);
    const courseListFocus = ref(null);
    const filteredVideoCardFocus = ref(null);
    const filteredVideoLinkFocus = ref(null);
    const filteredLikeBtnFocus = ref(null);
    
    const courses = ref([]);
    const selectedChannel = ref('All');
    const channels = ['All', 'ADHD', 'BIPOLAR DISORDER', 'GENDER', 'ANXIETY', 'TEEN', 'EATING PROBLEMS', 'PTSD', 'SOCIAL ANXIETY', 'SLEEP DISORDERS', 'Other'];
    const filteredCourses = ref([]);
    const db = getFirestore();
    const auth = getAuth();
    const user = ref(auth.currentUser);
    const router = useRouter();

    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'courses'));
        courses.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        filterCourses();
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    const filterByChannel = (channel) => {
      selectedChannel.value = channel;
      filterCourses();
    };

    const filterCourses = () => {
      if (selectedChannel.value === 'All') {
        filteredCourses.value = courses.value;
      } else {
        filteredCourses.value = courses.value.filter(course => course.category === selectedChannel.value);
      }
    };

    const getLatestVideos = (channel) => {
      return courses.value.filter(course => course.category === channel).slice(-1).reverse();
    };

    const likeCourse = async (course) => {
      if (!user.value) {
        alert('Please log in to like a course.');
        return;
      }

      if (!course.userLiked) {
        try {
          const courseRef = doc(db, 'courses', course.id);
          await updateDoc(courseRef, {
            likes: increment(1),
            likedUsers: arrayUnion(user.value.uid)
          });

          // update status
          const courseIndex = courses.value.findIndex(c => c.id === course.id);
          if (courseIndex !== -1) {
            courses.value[courseIndex].likes += 1;
            courses.value[courseIndex].userLiked = true;
          }
          filterCourses(); // filtered results
        } catch (error) {
          console.error('Error liking course:', error);
        }
      }
    };

    const goBack = () => {
      router.push('/home');
    };
    onMounted(() => {
      fetchCourses();
      backBtnFocus.value.focus()
    });

    return {
      courses,
      selectedChannel,
      channels,
      filteredCourses,
      fetchCourses,
      filterByChannel,
      filterCourses,
      getLatestVideos,
      likeCourse,
      goBack,
      backBtnFocus,
      latestVideosFocus,
      channelCardFocus,
      videoCardFocus,
      videoLinkFocus,
      likeBtnFocus,
      channelFilterFocus,
      filterBtnFocus,
      courseListFocus,
      filteredVideoCardFocus,
      filteredVideoLinkFocus,
      filteredLikeBtnFocus,
    };
  },
};
</script>

<style scoped>
.user-courses {
  max-width: 1000px;
  margin: auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.channel-filter {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.channel-filter button {
  background-color: #f0f0f0;
  color: #333;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
  font-size: 1rem;
}

.channel-filter button.active-channel {
  background-color: #4caf50;
  color: white;
}

.channel-filter button:hover {
  background-color: #d3d3d3;
}

.latest-videos {
  margin-bottom: 40px;
}

.channel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.channel-card {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
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
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.video-card {
  background-color: #fff;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  text-align: center;
}

.video-cover {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 5px;
  margin-bottom: 10px;
}

.actions {
  margin-top: 10px;
}

.btn-like {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 0.9rem;
  border-radius: 5px;
  margin-right: 5px;
}

.btn-like:hover {
  background-color: #388e3c;
}
</style>