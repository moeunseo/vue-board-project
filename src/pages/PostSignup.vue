<template>
    <div class="signup-container">
      <h1>회원가입</h1>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
            <label for="username">이름</label>
            <input type="text" id="username" v-model.trim="formData.username" placeholder="이름을 입력하세요"/>
        </div>

        <div class="form-group">
            <label for="userId">아이디</label>
            <input type="text" id="userId" v-model.trim="formData.userId" placeholder="아이디를 입력하세요" />
        </div>

        <!-- 중복확인 버튼 -->
        <button type="button" @click="checkUserId">중복확인</button>
        <p v-if="isUserIdExists !== null">
            {{ isUserIdExists ? '이미 사용 중인 아이디입니다.' : '사용 가능한 아이디입니다.' }}
        </p>

        <div class="form-group">
            <label for="password">비밀번호</label>
            <input type="password" id="password" v-model.trim="formData.password" placeholder="비밀번호를 입력하세요" />
        </div>

        <div class="form-group">
            <button type="submit" :class="{'disabled-btn': isFormInvalid}" :disabled="isFormInvalid">가입하기</button>
        </div>
      </form>

      <!-- 에러메세지를 보여줄 모달창 -->
      <ErrorModal :isVisible="isModalVisible" :message="modalMessage" @close="isModalVisible = false" />
    </div>
  </template>
  
<script>
import axios from 'axios'
import ErrorModal from '@/components/ErrorModal.vue'
  export default {
    components:{
      ErrorModal
    },
    data() {
      return {
        formData: {
          username: '',
          userId: '',
          password: ''
        },
        // 아이디 중복 여부
        isUserIdExists: null,
        isUserIdBtn: false,
        // 모달 상태 관리
        isModalVisible: false,
        modalMessage: ''
      }
    },
    computed:{
      // 값을 전부 입력하기 전까진 버튼 비활성화
      isFormInvalid() {
        return !this.formData.username.trim() || !this.formData.userId.trim() ||!this.formData.password.trim()
      }
    },
    methods: {
       // 모달로 에러 메시지 표시
      showModal(message) {
        this.modalMessage = message
        this.isModalVisible = true
      },
      // 아이디 중복확인
      checkUserId(){
        const userId = this.formData.userId.trim()
        // 입력하지 않았다면
        if(!userId){
          this.showModal('아이디를 입력하세요.')
          return
        }
        // 버튼 누름
        // 아이디 중복확인을 위한 메소드 호출
        this.isUserIdBtn = true
        axios
        .post(`https://localhost:3000/userIdCheck`, {userId: userId})
        .then(response =>{
          this.isUserIdExists = response.data.exists // false값이면 아이디 생성 성공
          console.log('중복 유무', this.isUserIdExists)
        })
        .catch(error =>{
          console.error('아이디 중복 확인 오류', error.response.data.message)
          this.isUserIdBtn = false
        })
      },

      handleSubmit() {
        if(!this.isUserIdBtn || this.isUserIdExists){
          this.showModal('아이디 중복 체크하세요.')
          return
        }

        // 여기에 서버로 데이터를 보내는 로직 작성
        console.log('회원가입 데이터:', this.formData)
        // 사용가능한 아이디라면, false라면
        // 중복확인 버튼을 눌렀을 때만 실행
        if(!this.isUserIdExists && this.isUserIdBtn){
          axios
          .post(`https://localhost:3000/signup`, this.formData)
          .then(response =>{
              console.log(response.data, '데이터 전송')
              this.showModal(response.data.message)
              setTimeout(()=>{
                this.$router.push({name: 'PostLogin'})
              }, 1000)
          })
          .catch(error =>{
              console.error('회원가입 오류', error.response.data.message)
              this.showModal('회원가입 실패' + error.response.data.message)
          })
        }
      }
    }
  }
  </script>
  
  <style scoped>
.signup-container {
max-width: 400px;
margin: 50px auto;
padding: 20px;
background-color: #f9f9f9;
border-radius: 8px;
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h1 {
text-align: center;
margin-bottom: 20px;
color: #333;
}

.form-group {
margin-bottom: 15px;
}

label {
display: block;
margin-bottom: 5px;
font-weight: bold;
color: #333;
}

input {
width: 100%;
padding: 10px;
border: 1px solid #ddd;
border-radius: 4px;
box-sizing: border-box;
font-size: 16px;
}

input:focus {
border-color: #0056b3;
outline: none;
}

.error{
display: block;
margin-bottom: 5px;
font-weight: bold;
color: red;
}

button {
width: 100%;
padding: 12px;
background-color: #007bff;
border: none;
border-radius: 4px;
color: white;
font-size: 16px;
font-weight: bold;
cursor: pointer;
margin-bottom: 10px;
}

button:hover {
background-color: #0056b3;
}

button:disabled {
background-color: #ccc;
}
  </style>  