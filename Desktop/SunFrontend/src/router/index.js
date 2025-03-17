import { createRouter, createWebHistory } from 'vue-router';
import { getAuth} from 'firebase/auth';


import RegisterView from '../views/RegisterView.vue';
import AboutView from '../views/AboutView.vue';
import LoginView from '../views/LoginView.vue'; 
import WelcomeView from '../views/WelcomeView.vue';
import HomeView from '../views/HomeView.vue';
import EvaluateView from '../views/EvaluateView.vue';
import AdminView from '../views/AdminView.vue';
import CourseView from '../views/CourseView.vue';
import ClinicView from '../views/ClinicView.vue';
import DiaryView from '../views/DiaryView.vue';
import CommunityView from '../views/CommunityView.vue';
import MyView from '../views/MyView.vue';
import CounsellingView from '../views/CounsellingView.vue';
import HealthTestView from '../views/HealthTestView.vue';
import TestHistoryView from '../views/TestHistoryView.vue';
import NewDiaryView from '../views/NewDiaryView.vue';
import UserComment from '../views/UserComment.vue';
import UserListView from '../views/UserListView.vue';
import ManageDoctorView from '@/views/ManageDoctorView.vue';
import UserBooking from '@/views/UserBooking.vue';
import PostView from '@/views/PostView.vue';
import ManageCourse from '@/views/ManageCourse.vue';
import ManageCommunityView from '@/views/ManageCommunityView.vue';
import SendEmailView from '@/views/SendEmailView.vue';
import ManageTrafficView from '@/views/ManageTrafficView.vue';
import Recommendation from '@/views/Recommendation.vue';
import Visualisation from '@/views/Visualisation.vue';
const routes = [
  {
    path: '/',
    name: 'Recommendation',
    component: Recommendation,
    meta: { requiresAuth: false },
  },
  {
    path: '/visualisation',
    name: 'Visualisation',
    component: Visualisation,
    meta: { requiresAuth: false },
  },
  {
    path: '/sendemail',
    name: 'SendEmail',
    component: SendEmailView,
    meta: { requiresAuth: true },
  },
  {
    path: '/traffic',
    name: 'traffic',
    component: ManageTrafficView,
    meta: { requiresAuth: true },
  },
  {
    path: '/managedoctor',
    name: 'ManageDoctor',
    component: ManageDoctorView,
    meta: { requiresAuth: true },
  },
  {
    path: '/managecommunity',
    name: 'ManageCommunityu',
    component: ManageCommunityView,
    meta: { requiresAuth: true },
  },
  {
    path: '/managecourse',
    name: 'ManageCourse',
    component: ManageCourse,
    meta: { requiresAuth: true },
  },
  {
    path: '/post',
    name: 'Post',
    component: PostView,
    meta: { requiresAuth: true },
  },
  {
    path: '/userbooking',
    name: 'UserbBooking',
    component: UserBooking,
  },
  {
    path: '/usercomment',
    name: 'UserComment',
    component: UserComment,
    meta: { requiresAuth: true },
  },
  {
    path: '/users',
    name: 'Users',
    component: UserListView,
    meta: { requiresAuth: true },
  },
  {
    path: '/newdiary',
    name: 'NewDiary',
    component: NewDiaryView,
    meta: { requiresAuth: true },
  },
  {
    path: '/healthtest',
    name: 'HealthTest',
    component: HealthTestView,
  },
  {
    path: '/testhistory',
    name: 'TestHistory',
    component: TestHistoryView,
    meta: { requiresAuth: true },
  },
  {
    path: '/evaluate',
    name: 'Evaluate',
    component: EvaluateView,
    meta: { requiresAuth: true },
  },
  {
    path: '/counselling',
    name: 'Counselling',
    component: CounsellingView,
  },
  {
    path: '/course',
    name: 'Course',
    component: CourseView,
  },
  {
    path: '/clinic',
    name: 'Clinic',
    component: ClinicView,
  },
  {
    path: '/diary',
    name: 'Diary',
    component: DiaryView,
    meta: { requiresAuth: true },
  },
  {
    path: '/community',
    name: 'Community',
    component: CommunityView,
  },
  {
    path: '/my',
    name: 'My',
    component: MyView,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminView,
    meta: { requiresAuth: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView
  },
  {
    path: '/home',
    name: 'Home',
    component: HomeView,
    meta: { requiresAuth: false },
  },
  {
    path: '/about',
    name: 'About',
    component: AboutView
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView 
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const auth = getAuth();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  const currentUser = auth.currentUser;

  if (requiresAuth && !currentUser) {
    alert('Please log in to access this page.');
    next('/login');
  } else {
    next();
  }
});

export default router;
