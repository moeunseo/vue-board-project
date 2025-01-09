<template>
    <div class="post-write">
      <h1>상세보기</h1>
      <!-- <router-link to="/" class="back-btn list-btn">목록</router-link> -->
      <router-link :to="{name: 'Home'}" class="back-btn list-btn">목록</router-link>

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
// 중복되는 css는 따로 파일을 만들어서 import
import "@/assets/css/common.css"
export default {
    name: "PostDetail",
    data(){
        return {
            title: '',
            content: '',
            isEditMode: true // true일 때 읽기 모드
        }
    },
    // 상세보기 페이지로 넘어오면서 게시글에 대한 데이터들을 화면에 렌더링 하기 위함
    created(){
    const postId = this.$route.params.id

    // 상세보기로 들어왔다면
    // 라우터로 받아올 땐 문자열로 받아옴
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
    // 메소드 호출도 반복이 된다면 utils 폴더로 따로 빼서 메소드를 호출 시켜도 된다.
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
        this.$router.push({name: 'Home'})
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
        // map: 배열의 각 요소를 순회하며 수정 혹은 그대로 유지하여 새 배열을 반환
        const updatePosts = posts.map(post => 
        post.id === parseInt(this.$route.params.id)
        // 스프레드 연산자. post 안에 모든 객체가 존재
        // id값은 변경되지 않는 값이므로 그대로 두고 변경되는 값들만 받아와서 갱신하기!
        ? {...post, title: this.title, content: this.content}
        : post)
        this.savePosts(updatePosts)
        this.isEditMode = true

        alert('수정이 완료되었습니다.')
      }
    }
  }
}
</script>

<style scoped>
/* 목록 버튼 스타일 추가 */
.list-btn {
  display: block;
  margin-left: 500px; 
  width: fit-content; /* 버튼 크기를 텍스트에 맞춤 */
}
</style>