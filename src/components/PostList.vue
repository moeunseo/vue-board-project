<template>
  <div class="post-list-container">
    <div class="userPage" v-if="!isLoggedIn">
      <router-link :to="{name: 'PostSignup'}" class="user-btn">회원가입</router-link>
      <router-link :to="{name: 'PostLogin'}" class="user-btn">로그인</router-link>
    </div>
    <div class="userPage" v-else>
      <button type="button" @click="logout" class="user-btn">로그아웃</button>
    </div>

    <h1>게시글 목록</h1>
    <!-- 작성하기 버튼을 누르면 작성 폼으로 이동하는 라우터 등록 -->
     <!-- 로그인한 상태에만 보이게 -->
    <router-link v-if="isLoggedIn" :to="{ name: 'PostForm' }" class="write-btn">작성하기</router-link>
    
    <!-- 검색하기 -->
    <!-- 자식에서 보내온 에미터를 받음
         자식 컴포넌트의 메소드를 사용할 땐, ref 선언 -->
    <PostSearch ref="postSearch" @searchWord="search"/>

    <ul class="post-list">
      <li v-for="post in paginatedPosts" :key="post.board_id" class="post-item">
        <router-link :to="{ name: 'PostDetail', params: { id: post.board_id } }" class="post-title">
          {{ post.board_title }}
        </router-link>
        작성자: {{post.userName}}
      </li>
    </ul>

    <!-- 검색 결과가 없을 경우 메시지 출력 -->
    <p v-if="searchWord && paginatedPosts.length === 0">검색 결과가 없습니다.
      <router-link :to="{ name: 'Home' }" class="list-btn" @click="resetSearch">목록</router-link>
    </p>

    <!-- 페이지네이션 버튼 -->
    <div class="pagination">
      <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
        이전
      </button>
      <span class="page-number">{{ currentPage }} / {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
        다음
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import PostSearch from './PostSearch.vue';

export default {
  name: 'PostList',
  components:{
    PostSearch
  },
  mounted() {
    this.boardAll()
  },
  data() {
    return {
      posts:[],
      itemsPerPage: 10, // 한 페이지에 표시할 데이터 개수
      currentPage: 1,  // 현재 페이지 번호
      searchWord: '',
      isLoggedIn: localStorage.getItem('token') // 로그인 여부
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.posts.length / this.itemsPerPage)
    },
    paginatedPosts() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage
      const endIndex = startIndex + this.itemsPerPage
      return this.posts.slice(startIndex, endIndex)
    }
  },
  methods: {
    resetSearch(){
      this.searchWord = ''
      this.$refs.postSearch.clearSearch() // 자식 컴포넌트 검색어 초기화
      this.boardAll()
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },
    search(word){
      console.log(word)
      this.searchWord = word
      this.boardAll()
    },
    boardAll() {
      const url = this.searchWord ?
      `https://localhost:3000/main/${this.searchWord}`
      : `https://localhost:3000/main`
      
      console.log('검색된 url', url)
      axios.get(url)
        .then(response => {
          console.log('받아온 데이터:', response.data)
          this.posts = response.data
        })
        .catch(error => {
          console.error('데이터 가져오기 오류', error)
        })
    },
    //로그아웃
    logout(){
      localStorage.removeItem('token'); // 로컬스토리지에서 토큰 삭제
      this.isLoggedIn = false; // 로그인 상태 변경
      this.$router.push({ name: 'Home' }); // 로그인 페이지로 리다이렉트
    }
  }
}
</script>

<style scoped>
.post-list-container {
  width: 80%;
  margin: 0 auto;
  font-family: 'Roboto', sans-serif;
  padding: 20px;
}

h1 {
  text-align: center;
  font-size: 2rem;
  color: #333;
  margin-bottom: 20px;
}

.write-btn {
  display: block;
  width: 150px;
  margin: 20px auto;
  padding: 10px;
  background-color: #007bff;
  color: white;
  font-weight: bold;
  text-align: center;
  border-radius: 5px;
  text-decoration: none;
  transition: background-color 0.3s;
}

.write-btn:hover {
  background-color: #0056b3;
}

.post-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.post-item {
  padding: 15px;
  margin: 10px 0;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.post-item:hover {
  transform: translateY(-5px);
}

.post-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  text-decoration: none;
  display: block;
}

.post-title:hover {
  color: #007bff;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
}

.pagination button {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  margin: 0 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pagination button:hover {
  background-color: #0056b3;
}

.pagination button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.page-number {
  font-size: 1rem;
  margin: 0 10px;
}

/* 반응형 레이아웃 */
@media (max-width: 600px) {
  .write-btn {
    width: 100px;
  }

  .post-item {
    padding: 12px;
  }

  .pagination {
    flex-direction: column;
  }
}


/* 로그인 회원가입 */
.userPage {
    position: absolute;
    top: 10px;
    right: 20px;
}

.user-btn {
display: inline-block;
margin: 0 10px;
padding: 10px 20px;
border: 1px solid #007bff;
border-radius: 5px;
background-color: #007bff;
color: white;
text-decoration: none;
font-size: 14px;
font-weight: bold;
cursor: pointer;
transition: background-color 0.3s ease;
}

.user-btn:hover {
background-color: #0056b3;
border-color: #0056b3;
}

.list-btn {
  display: flex;
  padding: 10px 20px;
  font-size: 16px;
  background-color: #007BFF;
  color: white;
  border: none;
  box-sizing: border-box;
  border-radius: 5px;
  cursor: pointer;
  text-align: center;
  font-weight: bold;
  text-decoration: none; /* 링크 기본 스타일 제거 */
}

.list-btn:hover{
  background-color: #0056b3;
}
</style>