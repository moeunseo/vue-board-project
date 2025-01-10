<template>
  <div class="post-write">
    <h1>게시글 작성해보자</h1>

    <label v-if="errorMsg && showError" class="errorMsg">{{errorMsg}}</label>
    
    <!-- form 태그로 폼을 감싸줍니다. -->
    <form @submit.prevent="addPost">
      <div class="input-group">
        <label for="title">제목</label>
        <input type="text" id="title" placeholder="제목을 입력하세요" v-model.trim="title">
      </div>

      <div class="input-group">
        <label for="content">내용</label>
        <textarea id="content" rows="10" placeholder="내용을 입력하세요" v-model.trim="content"></textarea>
      </div>

      <div class="button-group">
        <div>
          <router-link :to="{name: 'Home'}" class="back-btn">뒤로가기</router-link>
          <button type="submit" class="submit-btn">작성하기</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import "@/assets/css/common.css"
import axios from 'axios'
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
    errorMsg() {
      if (this.title.trim() === '' || this.content.trim() === '') {
        return '제목 내용을 모두 입력해주세요!'
      }
      return ''
    }
  },
  methods: {
    addPost() {
      if (this.errorMsg) {
        this.showError = true
        return
      }

      const boardData = {
        title: this.title,
        content: this.content
      }

      axios.post("http://localhost:3000/write", boardData, 
      {headers: {'Content-Type': 'application/json'}
      })
      .then(response =>{
        console.log(response.data)
        this.$router.push({name: 'Home'})
        this.title='',
        this.content=''
      })
      .catch(error =>{
        console.error('게시글 작성 오류: ', error)
        this.showError = true
      })
    }
  }
};
</script>

<style scoped>
/* 게시글 작성, 수정 컴포넌트 css */
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

.errorMsg {
  color: red;
  font-size: 1rem;
  margin-top: 10px;
}
</style>