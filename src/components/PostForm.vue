<template>
  <div class="post-write">
    <h1>게시글 작성해보자</h1>
    
    <!-- form 태그로 폼을 감싸줍니다. -->
    <form @submit.prevent="addPost">
      <div class="input-group">
        <label for="title">제목</label>
        <input type="text" id="title" placeholder="제목을 입력하세요" v-model.trim="form.title">
      </div>

      <div class="input-group">
        <label for="content">내용</label>
        <textarea id="content" rows="10" placeholder="내용을 입력하세요" v-model.trim="form.content"></textarea>
      </div>

      <div class="custom-file-upload">
        <label for="file">파일 선택</label>
        <input type="file" id="file"  ref="fileInputRef" @change="fileUpload" class="hidden-file" multiple>
        <span v-if="form.files.length > 0">({{ form.files.length }}개 파일 선택됨)</span>
      </div>

        <!-- 업로드된 파일 목록 -->
        <ul v-if="form.files.length > 0" class="file-list">
        <li v-for="(file, index) in form.files" :key="index">
          {{ file.name }}
          <button type="button" @click="removeFile(index)">삭제</button>
        </li>
      </ul>

      <!-- 에러 메시지 -->
      <div v-if="showError" class="errorMsg">
        {{ errorMsg }}
      </div>
      <!-- 로딩 중일 때 작성버튼 비활성화 -->
      <div class="button-group">
        <div>
          <router-link :to="{name: 'Home'}" class="back-btn">뒤로가기</router-link>
          <button :disabled="isUploading" type="submit" class="submit-btn">
            {{ isUploading ? "작성 중..." : "작성하기" }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
// import "@/assets/css/common.css"
import axios from 'axios'
export default {
  name: "PostForm",
  data() {
    return {
      // 객체 형태로 받아오면 편함!
      form:{
        title: '',
        content: '',
        files: [] // 업로드된 파일 배열에 저장
      },
      showError: false, // 에러 메시지 여부
      isUploading: false
    }
  },
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
  methods: {
    // 파일 선택 메소드
    fileUpload(event){
      // 업로드한 파일 배열 형식으로 저장
      this.form.files = Array.from(event.target.files)
    },
    removeFile(index) {
    // 특정 파일 제거
    this.form.files.splice(index, 1);
  },
    addPost() {
      // 유효성 검사
      if (this.errorMsg) {
        this.showError = true
        return
      }

      this.isUploading = true

      const writeCheck = confirm('게시글을 작성하겠습니까?')
      if(writeCheck){
        const formData = new FormData()

        formData.append("title", this.form.title)
        formData.append("content", this.form.content)

        this.form.files.forEach((file) =>{
          formData.append("files", file)
        })

        axios.post("http://localhost:3000/write", formData,
        // axios는 json형식을 자동 파싱을 지원해주기에 명시할 필요는 없지만 알고 있자
        {headers: {'Content-Type': 'multpart/form-data'}})
        .then(response =>{
          console.log(response.data)
          alert('작성 완료되었습니다.')
          this.form = { title: "", content:"",files: [] }
          this.$router.push({name: 'Home'})
        })
        .catch(error =>{
          console.error('게시글 작성 오류: ', error)
          this.showError = true
        })
      }
    }
  }
};
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

.custom-file-upload {
  display: flex;
  align-items: center;
  gap: 10px;
}

.custom-file-upload label{
  border: 1px solid #007bff;
  border-radius: 5px;
  font-weight: bold;
  color: white;
  background-color: #007bff;
  padding: 8px 18px;
  font-size: 16px;
  cursor: pointer;
}

.hidden-file {
  display: none;
}

.file-list {
  margin-top: 10px;
  padding: 10px;
  background-color: #f9f9f9;
  border: 1px solid #b0c6f6;
  border-radius: 4px;
}

.file-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.file-list li button {
  background-color: red;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 2px 6px;
  cursor: pointer;
}

.file-list li button:hover {
  background-color: darkred;
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

.submit-btn {
  background-color: #007bff;
  margin-left: 390px;
}

/* 뒤로가기 버튼 왼쪽에 간격 추가 */
.back-btn {
  text-decoration: none;
}

.back-btn:hover, .submit-btn:hover {
  background-color: #0056b3;
}

.button-group .back-btn:focus,
.button-group .submit-btn:focus {
  outline: none;
}

/* 에러메시지 여부 */
.errorMsg {
  color: red;
  font-size: 1rem;
  margin-top: 10px;
}
</style>