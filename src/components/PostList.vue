<template>
    <div>
        <h1>게시글 목록</h1><br>
         <!-- 작성하기 버튼을 누르면 작성 폼으로 이동하는 라우터 등록 -->
         <!-- <button><router-link to="/write">작성하기</router-link></button> -->
         <router-link :to="{name: 'PostForm'}" class="write-btn">작성하기</router-link>
      <ul>
        <li v-for="post in paginatedPosts" :key="post.board_id">{{post.board_id}}.
          <router-link :to="{name: 'PostDetail',  params: { id: post.board_id }}">{{ post.board_title }}</router-link>
        </li>
      </ul>
  
      <!-- 페이지네이션 버튼 -->
      <div class="pagination">
        <button 
          :disabled="currentPage === 1" 
          @click="changePage(currentPage - 1)">
          이전
        </button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <button 
          :disabled="currentPage === totalPages" 
          @click="changePage(currentPage + 1)">
          다음
        </button>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios'
  export default {
    // 컴포넌트의 이름 지정
    // 주로 디버깅, 재귀적, 라우터 연동 시 유용하게 사용
    name: 'PostList',
    // 화면이 렌더링 되기 전에 먼저 시작되는 속성으로 주로 데이터나 api호출 시 사용
    // 현재 코드는 리스트 화면에 로컬 스토리지에 저장되어 있는 데이터들을 가져와서 화면에 뿌려준다.
    mounted(){
      // API 호출로 backend.js 안에서 데이터 가져오기
      this.boardAll()
     
    },
    data() {
      return {
        postId: 1,
        posts: [],
        itemsPerPage: 5, // 한 페이지에 표시할 데이터 개수
        currentPage: 1  // 현재 페이지 번호
      }
    },
    computed: {
      totalPages() {
        return Math.ceil(this.posts.length / this.itemsPerPage);
      },

      paginatedPosts() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.posts.slice(startIndex, endIndex);
      }
    },
    methods: {
      changePage(page) {
        if (page >= 1 && page <= this.totalPages) {
          this.currentPage = page;
        }
      },

      // 리스트를 뿌려줄 메소드
      boardAll(){
        axios.get("http://localhost:3000/main")
        .then(response =>{
          this.posts = response.data
        })
        .catch (error =>{
          console.error('데이터 가져오기 오류', error)
        })
      }
    }
  };
  </script>
  
<style scoped>
h1 {
  display: inline-block; /* 제목과 버튼을 한 줄로 정렬 */
  margin-right: 10px; /* 제목과 버튼 간격 조정 */
}

/* 버튼 스타일 */
button {
  padding: 5px 10px;
  margin: 0 5px;
  cursor: pointer;
  background-color: #004A99; /* 파란물결 색상 */
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #0074D9; /* 호버 시 더 밝은 파란색 */
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.write-btn {
  display: inline-block; /* 버튼처럼 보이도록 변경 */
  padding: 10px 15px;
  background-color: #004A99;
  color: white;
  text-decoration: none; /* 링크 스타일 제거 */
  text-align: center; /* 텍스트 가운데 정렬 */
  border: none;
  border-radius: 5px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  margin-left: 300px;
}


/* 게시글 목록 스타일 */
ul {
  list-style-type: none; /* li 태그 점 제거 */
  padding: 0;
  margin: 10px 0;
}

li {
  padding: 5px 0;
  font-size: 16px;
}

/* 페이지네이션 버튼 스타일 */
.pagination {
  margin-top: 20px;
}

.pagination button {
  margin: 0 5px;
}

/* 반응형 레이아웃 */
@media (max-width: 600px) {
  h1, button {
    display: block; /* 작은 화면에서 제목과 버튼을 위아래로 정렬 */
    margin-bottom: 10px;
  }
}
</style>