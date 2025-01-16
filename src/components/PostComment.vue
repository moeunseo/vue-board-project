<template>
    <div class="comment-section">
        <h3>댓글</h3>

        <!-- 댓글 작성 폼 -->
        <form @submit.prevent="submitComment" class="comment-form" v-if="isLoggedIn">
            <textarea v-model.trim="newComment" placeholder="댓글을 작성하세요" rows="4"></textarea>
            <label v-if="errorMsg && showError" class="errorMsg">{{errorMsg}}</label>
            <button type="submit" class="submit-btn">댓글 작성</button>
        </form>

        <!-- 댓글 목록 -->
        <div v-if="comments.length" class="comment-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <!-- 프로필 이미지와 댓글 본문 -->
            <div class="comment-content">
              <!-- <img src="/path/to/default-avatar.png" alt="Profile" class="profile-img" /> -->
              <div class="comment-details">
                <!-- 수정 클릭 여부 -->
                <p v-if="!comment.editMode" class="comment-text">
                  <span class="user-name">{{comment.userName}}</span>
                  <span class="comment-content">{{comment.comment_content}}</span>
                  <span style="display: none;">{{ comment.userNum }}</span>
                  <span class="comment-time">{{formatTimeAgo(comment.updated_at)}}</span>
                  <span class="comment-time">{{comment.status}}</span>
                </p>
                <textarea v-else v-model.trim="comment.comment_content" rows="4"></textarea>
              </div>
            </div>

            <!-- 각 댓글별 수정/삭제 버튼 -->
             <!-- 내가 작성한 댓글만 표시 -->
            <div v-if="isUserMode && comment.userNum === this.userNum.usernum">
              <div class="comment-actions" v-if="!comment.editMode">
                <button @click="toggleEditMode(comment)" class="edit-btn">수정</button>
                <button @click="deleteComment(comment.comment_id)" class="delete-btn">삭제</button>
              </div>

            <!-- 수정하기를 할 땐, 해당 댓글 번호와 내용을 함께 보내야 한다. -->
              <form @submit.prevent="editComment(comment)" v-else>
                <div class="comment-actions">
                  <button type="submit" class="edit-btn">수정하기</button>
                </div>
              </form>
            </div>
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
import jwt_decode from 'jwt-decode';
export default {
    name: 'PostComment',
    props: ['id'], // 상세보기 컴포넌트에서 받은 게시글 id값
    data() {
      return {
        newComment: '',
        comments: [],
        showError: false, // 작성 에러메세지 유무
        editMode: false, // 댓글 수정 여부
        isLoggedIn: localStorage.getItem('token'),
        isUserMode: false,
        userNum: null
      }
    },
    mounted(){
      this.commentAll()
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
        .get(`https://localhost:3000/comment/${this.id}`)
        .then(response =>{
            console.log('받아온 댓글: ', response.data)
            this.comments = response.data // 댓글 배열 저장 json

            if(this.isLoggedIn){
              try {
                  this.userNum = jwt_decode(this.isLoggedIn)  // jwt_decode를 호출
                  const userId = this.userNum.usernum

                  this.comments.forEach(comment=>{
                    if(userId === comment.userNum){
                      this.isUserMode = true
                    }
                  })
              } catch (error) {
                  console.error('토큰 디코딩 오류:', error)
        }
      }
        })
        .catch(error =>{
            console.error('데이터 가져오기 오류', error)
        })
      },

      // 댓글 작성 API 호출 하는 부분
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
        .post(`https://localhost:3000/comment/${this.id}`, commentData,
          {headers: {'Authorization': `Bearer ${this.isLoggedIn}`}}
        )
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

      // 시간을 유튜브 댓글처럼 보이는 것처럼 표현
      formatTimeAgo(date) {
        const now = new Date();
        const updated = new Date(date);
        
        const diffInSeconds = Math.floor((now - updated) / 1000);
        if (diffInSeconds < 60) return `${diffInSeconds}초 전`;
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}시간 전`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) return `${diffInDays}일 전`;
        
        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) return `${diffInMonths}개월 전`;
        
        return `${Math.floor(diffInMonths / 12)}년 전`;
      },
      
      // 수정 모드 전환
      toggleEditMode(comment){
        console.log(comment)
        comment.editMode = !comment.editMode
      },

      // 댓글 수정
      editComment(comment){
        console.log('-----------', comment.comment_id)
        console.log('----------', comment.comment_content)

        this.userNum = jwt_decode(this.isLoggedIn)  // jwt_decode를 호출
        const userId = this.userNum.usernum

        const editComment = {
          id: comment.comment_id,
          newComment: comment.comment_content,
          userId
        }

        const editCheck = confirm('수정하시겠습니까?')
        if(editCheck){
          axios
          .put(`https://localhost:3000/comment/${this.id}`, editComment,
            {
              headers: {'Authorization': `Bearer ${this.isLoggedIn}`}
            }
          )
          .then(response =>{
            console.log('수정된 댓글',response.data)
            alert('수정 완료되었습니다.')
            this.commentAll()
          })
          .catch(error =>{
            if(error){
              console.error('댓글 수정 오류', error)
            }
          })
        }
      },

      // 댓글 삭제
      deleteComment(commentId){
        // 댓글 번호 잘 가져오는지 확인
        console.log(commentId)

        const checkComment = confirm('댓글을 삭제하시겠습니까?')
        if(checkComment){
          this.userNum = jwt_decode(this.isLoggedIn)  // jwt_decode를 호출
          const userId = this.userNum.usernum

          axios
          // delete는 데이터를 본문 자체로 보내지 않기에 명시적으로 작성해서 데이터를 보내야 한다.
          .delete(`https://localhost:3000/comment/${this.id}`,{
            data: {commentId, userId},
            headers: {'Authorization': `Bearer ${this.isLoggedIn}`}
          })
          .then(response =>{
            console.log(response.data, '삭제 완료')
            alert('삭제 완료되었습니다.')
            this.commentAll()
          })
          .catch(error =>{
            if(error){
              console.error('댓글 삭제 오류', error)
            }
          })
        }
      }
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

textarea{
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
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-item {
  /* display: flex;
  justify-content: space-between; */
  align-items: flex-start;
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  position: relative;
}

.profile-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 1rem;
  object-fit: cover;
}

.comment-content {
  display: flex;
  flex-direction: column;
}

.comment-actions {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}

.edit-btn,
.delete-btn {
  background: none;
  border: none;
  font-size: 12px;
  color: #007bff;
  cursor: pointer;
}

.edit-btn:hover,
.delete-btn:hover {
  text-decoration: underline;
}

.comment-actions {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.comment-details {
  display: flex;
  gap: 0.2rem;
}

.comment-text {
  display: flex;
}

.user-name {
  font-weight: bold; /* 선택사항: 이름 강조 */
}

.comment-content {
  margin-top: 5px; /* 이름과 댓글 간격 조정 */
}

.comment-time {
  font-size: 12px;
  color: #888;
}

.no-comments {
  text-align: center;
  font-style: italic;
  color: #888;
}
</style>  