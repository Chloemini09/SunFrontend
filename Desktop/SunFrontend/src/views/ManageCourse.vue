<template>
    <div class="manage-courses">
      <header class="header">
        <h1>Manage Courses</h1>
      </header>
      <button class="back-btn" @click="goBack">← Back</button>

      <!-- Upload Video Section -->
      <form @submit.prevent="uploadVideo" class="upload-form">
        <div class="form-group">
          <label for="title">Title</label>
          <input type="text" id="title" v-model="title" required />
        </div>
  
        <div class="form-group">
          <label for="introduction">Introduction</label>
          <textarea id="introduction" v-model="introduction" required></textarea>
        </div>
  
        <div class="form-group">
          <label for="category">Category</label>
          <select id="category" v-model="category" required>
            <option value="ADHD">ADHD</option>
            <option value="BIPOLAR DISORDER">BIPOLAR DISORDER</option>
            <option value="GENDER">GENDER</option>
            <option value="ANXIETY">ANXIETY</option>
            <option value="TEEN">TEEN</option>
            <option value="EATING PROBLEMS">EATING PROBLEMS</option>
            <option value="PTSD">PTSD</option>
            <option value="SOCIAL ANXIETY">SOCIAL ANXIETY</option>
            <option value="SLEEP DISORDERS">SLEEP DISORDERS</option>
            <option value="Other">Other</option>
          </select>
        </div>
  
        <div class="form-group">
          <label for="video">Upload Video</label>
          <input type="file" id="video" @change="handleFileUpload" accept="video/*" required />
        </div>
  
        <div class="form-group">
          <label for="cover">Upload Cover Image</label>
          <input type="file" id="cover" @change="handleCoverUpload" accept="image/*" required />
        </div>
  
        <div v-if="uploadProgress > 0" class="progress-bar">
          <div class="progress" :style="{ width: `${uploadProgress}%` }"></div>
        </div>
  
        <button type="submit" class="btn-upload">Upload Video</button>
      </form>
  
      <!-- Channel Filter Section -->
      <div class="channel-filter">
        <button v-for="channel in channels" :key="channel" @click="filterByChannel(channel)" :class="{ 'active-channel': selectedChannel === channel }">
          {{ channel }}
        </button>
      </div>
  
      <!-- Course List Section -->
      <div class="course-list">
        <h2>Uploaded Courses</h2>
        <div v-if="filteredCourses.length === 0">
          <p>No courses available in this category.</p>
        </div>
        <div v-else class="course-card" v-for="course in filteredCourses" :key="course.id">
          <video controls :poster="course.coverUrl" :src="course.videoUrl" class="course-video"></video>
          <h3>{{ course.title }}</h3>
          <p>{{ course.introduction }}</p>
          <p><strong>Category:</strong> {{ course.category }}</p>
          <button @click="editCourse(course)" class="btn-edit">Edit</button>
          <button @click="deleteCourse(course.id)" class="btn-delete">Delete</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
  import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
  import { useRouter } from 'vue-router'

  export default {
    setup() {
      const title = ref('');
      const introduction = ref('');
      const category = ref('ADHD');
      const videoFile = ref(null);
      const coverFile = ref(null);
      const courses = ref([]);
      const uploadProgress = ref(0);
      const selectedChannel = ref('All');
      const channels = ['All', 'ADHD', 'BIPOLAR DISORDER', 'GENDER', 'ANXIETY', 'TEEN', 'EATING PROBLEMS', 'PTSD', 'SOCIAL ANXIETY', 'SLEEP DISORDERS', 'Other'];
      const filteredCourses = ref([]);
      const storage = getStorage();
      const db = getFirestore();
      const router = useRouter();

      const handleFileUpload = (event) => {
        videoFile.value = event.target.files[0];
      };

      const goBack = () => {
        router.push('/admin')
      }
      const handleCoverUpload = (event) => {
        coverFile.value = event.target.files[0];
      };
  
      const uploadVideo = async () => {
        if (!videoFile.value || !coverFile.value) {
          alert('Please select both a video file and a cover image to upload.');
          return;
        }
  
        try {
          // Upload cover image
          const coverRef = storageRef(storage, `covers/${coverFile.value.name}`);
          const coverUploadTask = uploadBytesResumable(coverRef, coverFile.value);
  
          await new Promise((resolve, reject) => {
            coverUploadTask.on('state_changed', null, reject, async () => {
              coverFile.value = await getDownloadURL(coverUploadTask.snapshot.ref);
              resolve();
            });
          });
  
          // Upload video
          const videoRef = storageRef(storage, `courses/${videoFile.value.name}`);
          const uploadTask = uploadBytesResumable(videoRef, videoFile.value);
  
          uploadTask.on('state_changed', 
            (snapshot) => {
              uploadProgress.value = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            }, 
            (error) => {
              console.error('Error uploading video:', error);
              alert('Error uploading video. Please try again.');
            }, 
            async () => {
              const videoUrl = await getDownloadURL(uploadTask.snapshot.ref);
              await addDoc(collection(db, 'courses'), {
                title: title.value,
                introduction: introduction.value,
                category: category.value,
                videoUrl,
                coverUrl: coverFile.value,
                timestamp: new Date(),
              });
  
              alert('Video uploaded successfully!');
              title.value = '';
              introduction.value = '';
              category.value = 'ADHD';
              videoFile.value = null;
              coverFile.value = null;
              uploadProgress.value = 0;
              fetchCourses();
            }
          );
        } catch (error) {
          console.error('Error uploading video:', error);
          alert('Error uploading video. Please try again.');
        }
      };
  
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
  
      const deleteCourse = async (courseId) => {
        try {
          await deleteDoc(doc(db, 'courses', courseId));
          alert('Course deleted successfully!');
          fetchCourses();
        } catch (error) {
          console.error('Error deleting course:', error);
          alert('Error deleting course. Please try again.');
        }
      };
  
      const editCourse = (course) => {
        const newTitle = prompt('Enter new title', course.title);
        const newIntroduction = prompt('Enter new introduction', course.introduction);
        if (newTitle && newIntroduction) {
          const coverFileInput = document.createElement('input');
          coverFileInput.type = 'file';
          coverFileInput.accept = 'image/*';
          coverFileInput.onchange = async () => {
            const newCoverFile = coverFileInput.files[0];
            if (newCoverFile) {
              const coverRef = storageRef(storage, `covers/${newCoverFile.name}`);
              const coverUploadTask = uploadBytesResumable(coverRef, newCoverFile);
  
              await new Promise((resolve, reject) => {
                coverUploadTask.on('state_changed', null, reject, async () => {
                  const coverUrl = await getDownloadURL(coverUploadTask.snapshot.ref);
                  await updateDoc(doc(db, 'courses', course.id), {
                    title: newTitle,
                    introduction: newIntroduction,
                    coverUrl,
                  });
                  resolve();
                });
              });
  
              alert('Course updated successfully!');
              fetchCourses();
            }
          };
          coverFileInput.click();
        }
      };
  
      onMounted(() => {
        fetchCourses();
      });
  
      return {
        title,
        introduction,
        category,
        videoFile,
        coverFile,
        courses,
        uploadProgress,
        selectedChannel,
        channels,
        filteredCourses,
        handleFileUpload,
        handleCoverUpload,
        uploadVideo,
        fetchCourses,
        filterByChannel,
        deleteCourse,
        editCourse,
        goBack,
      };
    },
  };
  </script>
  
  <style scoped>
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
  .manage-courses {
    max-width: 800px;
    margin: auto;
    padding: 20px;
  }
  
  .header {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .upload-form {
    margin-bottom: 40px;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 10px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  
  input[type="text"],
  textarea,
  select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  input[type="file"] {
    margin-top: 10px;
  }
  
  .btn-upload {
    background-color: #4caf50;
    color: white;
    border: none;
    padding: 10px 20px;
    cursor: pointer;
    font-size: 1rem;
    border-radius: 5px;
  }
  
  .btn-upload:hover {
    background-color: #388e3c;
  }
  
  .progress-bar {
    width: 100%;
    background-color: #f3f3f3;
    border-radius: 5px;
    margin: 15px 0;
  }
  
  .progress {
    height: 20px;
    background-color: #4caf50;
    border-radius: 5px;
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
  
  .course-list {
    margin-top: 40px;
  }
  
  .course-card {
    background-color: #fff;
    padding: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    margin-bottom: 20px;
  }
  
  .course-card h3 {
    margin-top: 0;
  }
  
  .course-cover {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 5px;
    margin-bottom: 10px;
  }
  
  .course-video {
    width: 100%;
    height: 200px;
    margin-top: 10px;
    margin-bottom: 10px;
  }
  
  .btn-edit, .btn-delete {
    background-color: #4caf50;
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    font-size: 0.9rem;
    border-radius: 5px;
    margin-right: 10px;
  }
  
  .btn-delete {
    background-color: #e74c3c;
  }
  
  .btn-edit:hover {
    background-color: #388e3c;
  }
  
  .btn-delete:hover {
    background-color: #c0392b;
  }
  </style>