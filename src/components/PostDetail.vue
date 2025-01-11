<template>
  <div class="post-write">
    <h1>상세보기</h1>

    <!-- 목록으로 돌아가기 -->
    <router-link :to="{name: 'Home'}" class="list-btn">목록</router-link>

    <!-- 유효성 검사 -->
    <label v-if="errorMsg && showError" class="errorMsg">{{errorMsg}}</label>

    <!-- 게시글 수정/완료 폼 -->
    <form @submit.prevent="toggleEditMode($route.params.id)">
      <div class="input-group">
        <label for="title">제목</label>
        <input type="text" id="title" placeholder="제목을 입력하세요" v-model.trim="title" :readonly="isEditMode">
      </div>

      <div class="input-group">
        <label for="content">내용</label>
        <textarea id="content" rows="10" placeholder="내용을 입력하세요" v-model.trim="content" :readonly="isEditMode"></textarea>
      </div>

      <div>
        <label for="updateTime">작성 시간</label>
        <p>{{ updateTime }}</p>
      </div>

      <div class="button-group">
        <div>
          <!-- 수정/완료 버튼 -->
          <button type="submit">{{isEditMode ? '수정하기' : '완료하기'}}</button>
          <button class="delete-btn" @click="deleteBoard($route.params.id)">삭제하기</button>
        </div>
      </div>
    </form>
     <!-- 댓글 컴포넌트 추가 -->
     <!-- 댓글 목록을 불러올 땐 게시글id값을 props를 사용하여 전달 -->
     <PostComment :id = "boardId"/>
  </div>
</template>

<script>
// 중복되는 css는 따로 파일을 만들어서 import
import "@/assets/css/common.css"
import axios from "axios"
// 댓글 컴포넌트 추가
import PostComment from "@/components/PostComment.vue"
export default {
    name: "PostDetail",
    components: {
      PostComment
    },
    data(){
        return {
            title: '',
            content: '',
            updateTime: '',
            showError: false,
            isEditMode: true, // true일 때 읽기 모드
            boardId: this.$route.params.id // 파라미터 값 받아옴
        }
    },
    // 상세보기 페이지로 넘어오면서 게시글에 대한 데이터들을 화면에 렌더링 하기 위함
    mounted(){
      this.boardDetail(this.boardId)
    },
    // 수정할 때도 유효성 검사 진행
    computed: {
    errorMsg() {
      if (this.title.trim() === '' || this.content.trim() === '') {
        return '제목 내용을 모두 입력해주세요!'
      }
      return ''
    }
  },
  methods:{
    // 게시글 db에서 가져오기
    boardDetail(boardId){
      axios
      .get(`http://localhost:3000/detail/${boardId}`)
      .then(response =>{
        console.log(response.data)
          const post = response.data;
          this.title = post.board_title // 받아온 데이터로 title 설정
          this.content = post.board_content // 받아온 데이터로 content 설정
          
        // 받은 날짜를 원하는 형식으로 변환
        // yyyy/mm/dd/h:m
        const updatedTime = new Date(post.board_update_time)
        this.updateTime = `${updatedTime.getFullYear()}/
        ${(updatedTime.getMonth() + 1).toString().padStart(2, '0')}/
        ${updatedTime.getDate().toString().padStart(2, '0')} 
        ${updatedTime.getHours().toString().padStart(2, '0')}:${updatedTime.getMinutes().toString().padStart(2, '0')}
        ${(response.data.status)}`
      })
      .catch (error =>{
          console.error('게시글을 가져오면서 오류 발생', error)
        })
      },

    // 게시글 삭제
    deleteBoard(boardId){
      const confirmDelete = confirm('게시글을 삭제하겠습니까?')
      if(confirmDelete){
        axios
        .delete(`http://localhost:3000/detail/${boardId}`)
        .then(response =>{
          console.log(response.data, '삭제 완료')
          alert('삭제 완료되었습니다.')
          // 삭제 후엔 리스트 화면으로
          this.$router.push({name: 'Home'})
        })
        .catch(error =>{
          console.error('게시글 삭제 오류', error)
        })
      }
    },
      //게시글 수정
      toggleEditMode(boardId){
        if(this.errorMsg){
          this.showError = true
          return 
        }

        // 현재 플래그가 true라면 false로 변경
        // 수정/완료하기 버튼 여부
        if(this.isEditMode){
          this.isEditMode = false
        }

        else{
          axios
          // 수정할 땐 어느 게시글인지, 변경된 제목과 내용을 같이 보낸다.
          .put(`http://localhost:3000/detail/${boardId}`, {
            title: this.title,
            content: this.content
          })
          .then(response =>{
            console.log(response.data, '수정 완료')
            this.isEditMode = true
            alert('수정이 완료되었습니다.')
          })
          .catch(err =>{
            console.error('게시글 수정 오류', err)
          })
        }
      }
    }
}
</script>

<style scoped>
label, p{
  font-size: 1.1rem;
  color: #003c7d; 
  margin-bottom: 8px;
  display: inline-flex; /* 한 줄로 배치 */
}

label {
  margin-right: 10px; /* label과 p 사이의 간격을 조정 */
}

.button-group button.delete-btn {
  background-color: #FF4D4D;
  margin-left: 390px;
}

.button-group button:hover {
  background-color: #0056b3;
}

.button-group button.delete-btn:hover {
  background-color: #cc0000;
}

.list-btn {
  display: inline-block;
  padding: 10px 20px;
  font-size: 16px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-align: center;
  font-weight: bold;
  text-decoration: none; /* 링크 기본 스타일 제거 */
  margin-left: 520px;
}

.list-btn:hover{
  background-color: #0056b3;
}

/* 에러메시지 여부 */
.errorMsg {
  color: red;
  font-size: 1rem;
  margin-top: 10px;
}
</style>