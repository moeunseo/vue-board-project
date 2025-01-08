<template>
    <div class="post-write">
      <h1>게시글 작성해보자</h1>

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
          <router-link to="/" class="back-btn">뒤로가기</router-link>
          <button class="submit-btn" @click="addPost">작성하기</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "PostForm",
    data() {
        return {
           title: '',
           content: '',
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
            // 만약, 빈 공간이 존재한다면
            if(this.title.trim() === '' || this.content.trim() === ''){
                alert('내용을 모두 입력해주세요!')
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

            this.title=''
            this.content=''

            // 작성한 후에 첫 페이지로 이동
            this.$router.push('/')
        },
    },
  };
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
</style>  