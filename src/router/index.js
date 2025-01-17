// 라우터 사용 시 필요한 라이브러리
import { createRouter, createWebHistory } from 'vue-router';
import axios from 'axios';

// 페이지 컴포넌트 import
import PostListPage from '@/pages/PostListPage.vue';
import PostForm from '@/components/PostForm.vue';
import PostDetail from '@/components/PostDetail.vue';
import PostComment from '@/components/PostComment.vue';
import PostSearch from '@/components/PostSearch.vue';
import PostSignup from '@/pages/PostSignup.vue';
import PostLogin from '@/pages/PostLogin.vue';

// 라우터 생성
const router = createRouter({
  history: createWebHistory(), // URL 처리 방식 (HTML5 히스토리 모드)
  routes: [
    { path: '/', name: 'Home', component: PostListPage },
    { path: '/write', name: 'PostForm', component: PostForm },
    { path: '/detail/:id', name:'PostDetail', component: PostDetail}, // 동적 라우트 설정
    { path: '/comments/:id', name: 'PostComment', component: PostComment},
    { path: '/serach', name:'PostSerach', component: PostSearch},
    { path: '/signup', name: 'PostSignup', component: PostSignup},
    { path: '/login', name: 'PostLogin', component: PostLogin}
  ],
});

// 라우터에 beforeEach 훅 추가 (토큰 검사)
router.beforeEach(async (to, from, next) => {
  console.log('라우터 이동 전:', to.name)
  const token = localStorage.getItem('token');
  console.log('라우터 이동함Token:', token); // 토큰 확인

  if (token) {
    try {
      // 토큰 유효성 검사 요청
      const response = await axios.get('/auth/check-token', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('라우터 이동함 토큰 유효:', response.data);
      next(); // 정상적인 라우팅 진행
    } catch (error) {
      // 토큰 만료나 에러가 발생했을 때
      console.log('토큰 만료 또는 에러 발생', error);
      localStorage.removeItem('token'); // 토큰 삭제
      alert('로그인 세션이 만료되었습니다.')
      next({name:'PostLogin'}); // 로그인 페이지로 이동
    }
  } else {
    next(); // 토큰이 없으면 그냥 넘어감
  }
});

// 만든 라우터 외부로 내보내기
export default router;