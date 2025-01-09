<template>
    <div class="post-write">
      <h1>게시글 작성해보자</h1>

      <label v-if="errorMsg && showError" class="errorMsg">{{errorMsg}}</label>
      
      <div class="input-group">
        <label for="title">제목</label>
        <input type="text" id="title" placeholder="제목을 입력하세요" v-model.trim="title">
      </div>

      <div class="input-group">
        <label for="content">내용</label>
        <textarea id="content" rows="10" placeholder="내용을 입력하세요" v-model.trim="content" @keyup.enter="addPost"></textarea>
      </div>

      <div class="button-group">
        <div>
          <!-- name속성을 하는 것이 url 변경이 되더라도 코드 수정이 필요 없음 -->
          <!-- <router-link to="/" class="back-btn">뒤로가기</router-link> -->
          <router-link :to="{name: 'Home'}" class="back-btn">뒤로가기</router-link>
          <button class="submit-btn" @click="addPost">작성하기</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  // 중복되는 css는 따로 파일을 만들어서 import
  import "@/assets/css/common.css"
  export default {
    name: "PostForm",
    data() {
        return {
           title: '',
           content: '',
           showError: false // 에러 메시지 여부
        }
    },
    computed: {
    // 에러 메시지를 자동 계산
    // 실무에서는 alert창을 띄우기보단, 경고 메시지를 보여주는 경우가 많음 
    errorMsg() {
      if (this.title.trim() === '' || this.content.trim() === '') {
        return '제목 내용을 모두 입력해주세요!'
      }
      return '' // 모든 입력값이 정상적으로 채워지면 빈 문자열 반환
    }
  },
    methods: {
       // 로컬 스토리지에서 게시글 가져오기
         getPosts(){
          return JSON.parse(localStorage.getItem('posts')) || []
        },

        // 게시글 저장하기
        savePosts(posts){
          localStorage.setItem('posts', JSON.stringify(posts))
        },

        // 게시글 추가
        addPost(){
          // 에러 메시지가 표시되어있다면, 메소드 실행X
          if(this.errorMsg){
            this.showError = true
            return
          }

            // 기존 데이터 로컬 저장소에서 가져오기
            const posts = this.getPosts()

            // 잘 작성했다면
            const newBoard = {
              id: posts.length > 0 ? posts[posts.length - 1].id + 1 : 1, // 마지막 id + 1 
              title: this.title,
              content: this.content
          }

            posts.push(newBoard)
            // 로컬스토리지에 저장
            this.savePosts(posts)

            // 추가한 후에 초기화
            this.title=''
            this.content=''

            // 작성한 후에 첫 페이지로 이동
            // 첫 화면으로 돌아가더라도 경로(/)가 아닌 name으로 사용하면 더 안정성 있게 갈 수 있다.
            this.$router.push({name: 'Home'})
        },
    },
  };
  </script>
  
  <style scoped>
/* 에러 메시지 */
.errorMsg{
  color: red;
  font-size: 0.9em;
  margin-top: 5px;
  display: block;
}
</style>  