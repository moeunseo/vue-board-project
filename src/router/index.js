// 라우터 사용 시 필요한 라이브러리
import { createRouter, createWebHistory } from 'vue-router';

// 페이지 컴포넌트 import
import PostListPage from '@/pages/PostListPage.vue';
import PostForm from '@/components/PostForm.vue';
import PostDetail from '@/components/PostDetail.vue';

// 라우터 생성
const router = createRouter({
  history: createWebHistory(), // URL 처리 방식 (HTML5 히스토리 모드)
  routes: [
    { path: '/', name: 'Home', component: PostListPage },
    { path: '/write', name: 'PostForm', component: PostForm },
    { path: '/detail/:id', name:'PostDetail', component: PostDetail} // 동적 라우트 설정
  ],
});

// 만든 라우터 외부로 내보내기
export default router;