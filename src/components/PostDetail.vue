<template>
  <div class="post-write">
    <h1>상세보기</h1>

    <!-- 목록으로 돌아가기 -->
    <router-link :to="{name: 'Home'}" class="list-btn">목록</router-link>

    <!-- 게시글 수정/완료 폼 -->
    <form @submit.prevent="toggleEditMode($route.params.id)">
      <div class="input-group">
        <label for="title">제목</label>
        <input type="text" id="title" placeholder="제목을 입력하세요" v-model="form.title" :readonly="isEditMode">
      </div>

      <div class="input-group">
        <label for="content">내용</label>
        <textarea id="content" rows="10" placeholder="내용을 입력하세요" v-model="form.content" :readonly="isEditMode"></textarea>
      </div>

      <!-- 유효성 검사 -->
      <label v-if="errorMsg && showError" class="errorMsg">{{errorMsg}}</label>

      <div>
        <label for="updateTime">작성 시간</label>
        <p>{{ updateTime }}</p>
      </div>

      <div class="fileData">
        <div v-if="isEditMode">
          <label v-if="form.files.length>0">첨부파일</label>
          <ul>
              <li v-for="(file, index) in form.files" :key="index">
                <a :href="file.fileUrl" target="_blank">{{ file.fileName }}</a> 
                ({{formatFileSize(file.fileSize)}})
              </li>
          </ul>
        </div>

      <!-- 수정하기 모드일 때 -->
        <div v-else>
          <label for="file" class="editFile">첨부파일</label>
          <input type="file" id="file" @change="fileEdit" class="hidden-file" multiple>
          <ul>
              <li v-for="(file, index) in form.files" :key="index">        
                <a :href="file.fileUrl" target="_blank">{{ file.fileName }}</a> 
                ({{formatFileSize(file.fileSize)}})
                <button type="button" @click="removeFiles(index)">삭제</button>
              </li>
          </ul>
        </div>
      </div>

      <div class="button-group">
        <div>
          <!-- 수정/완료 버튼 -->
          <button type="submit">{{isEditMode ? '수정하기' : '완료하기'}}</button>
          <button type="button" class="delete-btn" @click="deleteBoard($route.params.id)">삭제하기</button>
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
// import "@/assets/css/common.css"
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
          form:{
            title: '',
            content: '',
            files: []
          },
            updateTime: '',
            showError: false,
            isEditMode: true, // true일 때 읽기 모드
            boardId: this.$route.params.id, // 파라미터 값 받아옴
        }
    },
    // 상세보기 페이지로 넘어오면서 게시글에 대한 데이터들을 화면에 렌더링 하기 위함
    mounted(){
      if(!this.boardId){
        alert('유효하지 않은 게시글입니다.')
        this.$router.push({name: 'Home'})
        return
      }
      this.boardDetail(this.boardId)
    },
    // 수정할 때도 유효성 검사 진행
    computed: {
    errorMsg() {
      const errors = [];
      if (this.form.title.trim() === "") {
        errors.push("제목을 입력해주세요.");
      }
      if (this.form.content.trim() === "") {
        errors.push("내용을 입력해주세요.");
      }
      return errors.join("\n");
    }
  },
  methods:{
    // 파일 크기 지정
    formatFileSize(size) {
        const units = ['bytes', 'KB', 'MB'];
        let i = 0;
        while (size >= 1024 && i < units.length - 1) {
          size /= 1024;
          i++;
        }
        return `${Math.round(size)} ${units[i]}`;
      },
    // 게시글 db에서 가져오기
    boardDetail(boardId){
      axios
      .get(`http://localhost:3000/detail/${boardId}`)
      .then(response =>{
        console.log('진짜 빡치네',response.data)
        const post = response.data;
        this.form.title = post.title // 받아온 데이터로 title 설정
        this.form.content = post.content // 받아온 데이터로 content 설정
          
        // 받은 날짜를 원하는 형식으로 변환
        // yyyy/mm/dd/h:m
        const updatedTime = new Date(post.updatedAt)
        this.updateTime = `${updatedTime.getFullYear()}/
        ${(updatedTime.getMonth() + 1).toString().padStart(2, '0')}/
        ${updatedTime.getDate().toString().padStart(2, '0')} 
        ${updatedTime.getHours().toString().padStart(2, '0')}:${updatedTime.getMinutes().toString().padStart(2, '0')}
        ${(response.data.status)}`

        // 첨부파일 뿌려주기
        console.log(post.files.length)
        if(post.files && post.files.length > 0){
          this.form.files = post.files
          console.log('받아온 파일', this.files)
        }
        else{
          this.form.files = []
        }
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

    // 게시글 수정 중 파일 삭제
    removeFiles(index){
      const deleteFile = this.form.files[index]

      // db에 저장된 파일 목록이라면
      if(deleteFile.fileId){
        axios
        .delete('http://localhost:3000/delete/file', {data: {deleteFile: deleteFile}})
        .then(response =>{
          console.log('삭제할 파일: ', deleteFile)
          console.log(response.data, '데이터 삭제 완료')
          this.form.files.splice(index, 1)
        })
        .catch(err =>{
          console.error('파일 삭제 오류', err)
        })
      }
      else{
        this.form.files.splice(index, 1);
      }
    },

    // 수정할 게시글에 파일 추가
    fileEdit(event){
      const newFile = Array.from(event.target.files).map(file =>{
        return{
          fileName: file.name,
          fileUrl: URL.createObjectURL(file), // 브라우저에서 사용하는 임시 url
          fileSize: file.size,
          rawFile: file
        }
      })
      this.form.files = [...this.form.files, ...newFile]
      console.log('추가된 파일', this.form.files)
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
        const editCheck = confirm('게시글을 수정하겠습니까?')
        if(editCheck){
          const formData = new FormData()

          formData.append("title", this.form.title)
          formData.append("content", this.form.content)

          this.form.files.forEach((file)=>{
            formData.append('files', file.rawFile || file)
          })

          for (let [key, value] of formData.entries()) {
            console.log('정신 차려', key, value);
          }

          axios
          // 수정할 땐 어느 게시글인지, 변경된 제목과 내용을 같이 보낸다.
          .put(`http://localhost:3000/detail/${boardId}`, formData)
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
}
</script>

<style scoped>
.post-write {
  margin: 30px auto;
  max-width: 600px;
  padding: 20px;
  background-color: #f0f7ff;
  border: 2px solid #8bb7f2;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  font-size: 2rem;
  color: #003c7d;
  margin-bottom: 20px;
}

.input-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center; /* 중앙 정렬 */
}

.input-group label {
  font-size: 1.1rem;
  color: #003c7d;
  display: block;
  margin-bottom: 8px;
}

.input-group input,
.input-group textarea {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #b0c6f6;
  border-radius: 5px;
  box-sizing: border-box;
  background-color: #ffffff;
  font-family: 'Arial', sans-serif; /* 글씨체 동일하게 설정 */
}

.input-group input:focus,
.input-group textarea:focus {
  border-color: #007BFF;
  outline: none;
}

textarea {
  resize: none;
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

/* 상세보기: 수정, 삭제하기 버튼 
   작성하기: 뒤로가기, 작성하기 버튼*/
.button-group button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.back-btn,
.submit-btn {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

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

/* 첨부파일 */
.fileData div{
  display: flex;
}

.fileData label{
  font-size: 18px;
  margin-top: 10px;
}

.fileData button{
  background-color: red;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 2px 6px;
  cursor: pointer;
}

.editFile{
  border: 1px solid #007bff;
  border-radius: 5px;
  font-weight: bold;
  color: white;
  background-color: #007bff;
  padding: 8px 18px;
  cursor: pointer;
}

.hidden-file{
  display: none;
}

/* 에러메시지 여부 */
.errorMsg {
  color: red;
  font-size: 1rem;
  margin-top: 10px;
}
</style>