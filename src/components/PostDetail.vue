<template>
    <div class="post-write">
      <h1>상세보기</h1>
      <router-link to="/" class="back-btn list-btn">목록</router-link>

      <div class="input-group">
        <label for="title">제목</label>
        <input type="text" id="title" placeholder="제목을 입력하세요" v-model.trim="title" :readonly="isEditMode">
      </div>

      <div class="input-group">
        <label for="content">내용</label>
        <textarea id="content" rows="10" placeholder="내용을 입력하세요" v-model.trim="content" @keyup.enter="addPost" :readonly="isEditMode"></textarea>
      </div>

      <div class="button-group">
        <div>
          <button @click="toggleEditMode">{{isEditMode ? '수정하기' : '완료하기'}}</button>
          <button class="delete-btn" @click="deletePost($route.params.id)">삭제하기</button>
        </div>
      </div>
    </div>
</template>

<script>
    export default {
        name: "PostDetail",
        data(){
            return {
                title: '',
                content: '',
                isEditMode: true // true일 때 상세보기 모드
            }
        },
        // 라우터 이용 시 사용하는 거 같움
        created(){
        const postId = this.$route.params.id

        // 상세보기로 들어왔다면
        if(postId){
          const posts = this.getPosts()
          const post = posts.find((post) => post.id === parseInt(postId))

          if(post){
            this.title = post.title
            this.content = post.content
          }
        }
    },
    methods:{
         // 로컬 스토리지에서 게시글 가져오기
         getPosts(){
          return JSON.parse(localStorage.getItem('posts')) || []
        },

        // 게시글 저장하기
        savePosts(posts){
          localStorage.setItem('posts', JSON.stringify(posts))
        },

        // 게시글 삭제
        deletePost(postId){
          const confirmDelete = confirm('게시글을 삭제하겠습니까?')
          if(confirmDelete){
            const posts = this.getPosts()
            // 현재 들어온 게시글의 번호가 다른 애들만 배열에 추가
            // url에 있는 id값은 문자열이기 때문에 형변환을 해줘야함
            const updatedPosts = posts.filter(post => post.id !== parseInt(postId))
            this.savePosts(updatedPosts)

            // 삭제 후엔 리스트 화면으로
            this.$router.push('/')
          }
        },

        // 게시글 수정
        toggleEditMode(){
            // 현재 플래그가 true라면 false로 변경
          if(this.isEditMode){
            this.isEditMode = false
          }

          else{
            const posts = this.getPosts()
            const updatePosts = posts.map(post => 
            post.id === parseInt(this.$route.params.id)
            ? {...post, title: this.title, content: this.content}
            : post)
            this.savePosts(updatePosts)
            this.isEditMode = true
          }
        }
    }
}
</script>

<style scoped>
.post-write {
  max-width: 600px;
  margin: 50px auto;
  padding: 20px;
  border: 2px solid #B2DFFC;
  border-radius: 10px;
  background-color: #F5FBFF;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  color: #0068B4;
  font-size: 1.8rem;
  margin-bottom: 20px;
}

.input-group {
  margin-bottom: 15px;
  text-align: center;
}

.input-group label {
  display: block;
  font-size: 1rem;
  margin-bottom: 5px;
  color: #0068B4;
}

input[type="text"],
textarea {
  width: 80%;
  padding: 10px;
  border: 1px solid #B2DFFC;
  border-radius: 5px;
  font-size: 1rem;
  margin: 0 auto;
  display: block;
}

textarea {
  resize: none;
}

.button-group div {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

/* 공통 버튼 스타일 */
button, .back-btn, .submit-btn {
  display: inline-block;
  padding: 10px 20px;
  margin: 10px 0;
  background-color: #B2DFFC;
  color: #0068B4;
  text-decoration: none;
  text-align: center;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

button:hover, .back-btn:hover, .submit-btn:hover {
  background-color: #003E7E;
}

button:active, .back-btn:active, .submit-btn:active {
  background-color: #002B57;
  transform: scale(0.98);
}

/* 작성하기 버튼 스타일 */
.submit-btn {
  background-color: #0068B4;
  color: white;
}

.submit-btn:hover {
  background-color: #004A99;
}

.submit-btn:active {
  background-color: #003E7E;
}

/* 삭제 버튼 */
.delete-btn {
  background-color: #FF6B6B;
  color: white;
}

.delete-btn:hover {
  background-color: #FF4A4A;
}

.delete-btn:active {
  background-color: #E63939;
}

/* 목록 버튼 스타일 추가 */
.list-btn {
  display: block;
  margin-left: 500px; 
  width: fit-content; /* 버튼 크기를 텍스트에 맞춤 */
}
</style>