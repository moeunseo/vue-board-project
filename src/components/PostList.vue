<template>
  <div class="post-list-container">
    <h1>게시글 목록</h1><br>
    <!-- 작성하기 버튼을 누르면 작성 폼으로 이동하는 라우터 등록 -->
    <router-link :to="{ name: 'PostForm' }" class="write-btn">작성하기</router-link>
    
    <!-- 검색하기 -->
     <!-- 자식에서 보내온 에미터를 받음 -->
    <PostSearch @searchWord="search"/>

    <ul class="post-list">
      <li v-for="post in paginatedPosts" :key="post.board_id" class="post-item">
        <router-link :to="{ name: 'PostDetail', params: { id: post.board_id } }" class="post-title">
          {{ post.board_title }}
        </router-link>
      </li>
    </ul>

    <!-- 검색 결과가 없을 경우 메시지 출력 -->
    <p v-if="searchWord && paginatedPosts.length === 0">검색 결과가 없습니다.</p>

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
      searchWord: ''
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
      `http://localhost:3000/main/${this.searchWord}`
      : `http://localhost:3000/main`
      
      console.log('검색된 url', url)
      axios.get(url)
        .then(response => {
          console.log('받아온 데이터:', response.data)
          this.posts = response.data
        })
        .catch(error => {
          console.error('데이터 가져오기 오류', error)
        })
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
</style>