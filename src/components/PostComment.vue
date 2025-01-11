<template>
    <div class="comment-section">
        <h3>댓글</h3>

        <!-- 댓글 작성 폼 -->
        <form @submit.prevent="submitComment" class="comment-form">
            <textarea v-model.trim="newComment" placeholder="댓글을 작성하세요" rows="4"></textarea>
            <label v-if="errorMsg && showError" class="errorMsg">{{errorMsg}}</label>
            <button type="submit" class="submit-btn">댓글 작성</button>
        </form>

        <!-- 댓글 목록 -->
        <div v-if="comments.length" class="comment-list">
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
                <p class="comment-text">{{ comment.comment_content }}</p>
                <!-- 작성 시간 보여주기 -->
            </div>
        </div>

        <!-- 댓글이 없을 때 -->
        <div v-else class="no-comments">
        <p>댓글이 없습니다. 첫 댓글을 달아주세요!</p>
        </div>
    </div>
</template>
  
<script>
import axios from 'axios'
export default {
    name: 'PostComment',
    props: ['id'], // 상세보기 컴포넌트에서 받은 게시글 id값
    data() {
        return {
            newComment: '',
            comments: [],
            showError: false // 에러메세지 유무
        }
    },
    mounted(){
        this.commentAll();
    },
    computed:{
        errorMsg() {
            if (this.newComment === '') {
                return '댓글을 입력해주세요!'
            }
                return ''
        }
    },
    methods: {
        // 댓글 목록 조회
        commentAll(){
            axios
            .get(`http://localhost:3000/comment/${this.id}`)
            .then(response =>{
                console.log('받아온 댓글: ', response.data)
                this.comments = response.data
            })
            .catch(error =>{
                console.error('데이터 가져오기 오류', error)
            })
        },


        // API 호출 하는 부분
        submitComment() {
            if(this.errorMsg){
                this.showError = true
                return
           }

           // 작성한 댓글과 게시글 번호 보내기
           const commentData = {
             newComment: this.newComment,
             boardId: this.id

           }

           axios
            .post(`http://localhost:3000/comment/${this.id}`, commentData)
            .then(response =>{
                console.log('작성한 댓글: ', response.data)
                alert('댓글 작성 완료되었습니다.')
                this.newComment = ''
                // 댓글 작성 후에 댓글 목록을 다시 뿌려주기 위해 메소드 호출
                this.commentAll()
            })
            .catch(error =>{
                console.log('댓글 작성 오류', error)
                this.showError = true
            })
        },
    },
}
</script>

<style scoped>
.comment-section {
  margin: 20px;
}

h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

textarea {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  box-sizing: border-box;
  resize: none;
  width: 100%;
  font-family: 'Arial', sans-serif;
}

.submit-btn {
  align-self: flex-end;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
}

.submit-btn:hover {
  background-color: #0056b3;
}

.comment-list {
  margin-top: 20px;
}

.comment-item {
  padding: 10px;
  margin-bottom: 10px;
  background-color: #f8f9fa;
  border-radius: 5px;
}

.comment-text {
  font-size: 1rem;
  margin: 0;
}

.no-comments {
  text-align: center;
  font-style: italic;
  color: #888;
}

/* 에러메시지 여부 */
.errorMsg {
  color: red;
  font-size: 1rem;
  margin-top: 10px;
}
  </style>  