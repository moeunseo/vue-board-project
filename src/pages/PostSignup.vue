<template>
    <div class="signup-container">
      <h1>회원가입</h1>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
            <label for="username">이름</label>
            <input type="text" id="username" v-model="formData.username" placeholder="이름을 입력하세요"/>
            <label v-if="errorMsg" class="error">이름을 입력해주세요.</label>
        </div>

        <div class="form-group">
            <label for="userId">아이디</label>
            <input type="text" id="userId" v-model="formData.userId" placeholder="아이디를 입력하세요" />
            <label v-if="errorMsg" class="error">아이디를 입력해주세요.</label>
        </div>

        <div class="form-group">
            <label for="password">비밀번호</label>
            <input type="password" id="password" v-model="formData.password" placeholder="비밀번호를 입력하세요" />
            <label v-if="errorMsg" class="error">비밀번호를 입력해주세요.</label>
        </div>

        <div class="form-group">
            <label for="confirmPassword">비밀번호 확인</label>
            <input type="password" id="confirmPassword" v-model="formData.confirmPassword" placeholder="비밀번호를 다시 입력하세요" />
            <label v-if="checkPwd" class="error">비밀번호가 일치하지 않습니다.</label>
        </div>

        <div class="form-group">
            <button type="submit">가입하기</button>
        </div>
      </form>

    </div>
  </template>
  
  <script>
import axios from 'axios';

  export default {
    data() {
      return {
        formData: {
          username: '',
          userId: '',
          password: '',
          confirmPassword: ''
        },
        errorMsg: false,
        checkPwd: false
      };
    },
    computed:{
        // 이름이 빈칸일 때
        
    },
    methods: {
      handleSubmit() {
        // 비밀번호 확인 로직
        if (this.formData.password !== this.formData.confirmPassword) {
          this.checkPwd = true
          return
        }
  
        // 여기에 서버로 데이터를 보내는 로직 작성
        console.log('회원가입 데이터:', this.formData);
        axios
        .post(`http://localhost:3000/signup`, this.formData)
        .then(response =>{
            console.log(response.data, '데이터 전송')
            this.$router.push({name: 'PostLogin'})
        })
        .catch(error =>{
            console.error('회원가입 오류', error)
        })
      }
    }
  };
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
}

button:hover {
background-color: #0056b3;
}

button:disabled {
background-color: #ccc;
}
  </style>  