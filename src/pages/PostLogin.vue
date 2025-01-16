<template>
<div class="login-container">
    <h1>로그인</h1>
    <form @submit.prevent="handleLogin">
    <div class="form-group">
        <label for="username">아이디</label>
        <input type="text" id="username" v-model.trim="formData.userId" placeholder="아이디를 입력하세요" />
    </div>
    <div class="form-group">
        <label for="password">비밀번호</label>
        <input type="password" id="password" v-model.trim="formData.password" placeholder="비밀번호를 입력하세요"/>
    </div>
    <button type="submit" :class="{'disabled-btn': isFormInvalid}" :disabled="isFormInvalid">로그인</button>
    </form>
    <!-- <br> -->
    <!-- 나중에 구현할 부분 -->
    <!-- <button type="button">카카오 로그인</button> -->
</div>
</template>

<script>
import axios from 'axios';

export default {
data() {
    return {
        formData: {
            userId: '',
            password: '',
        },
        isSubmitClicked: false
    }
},
computed:{
    // 아이디나 비밀번호가 빈 값이면 버튼을 비활성화
    isFormInvalid() {
      return !this.formData.userId.trim() || !this.formData.password.trim()
    }
},

methods: {
    handleLogin() {
        // 로그인 처리 로직
        console.log('로그인 시도:', this.formData)

        axios
        .post(`https://localhost:3000/login`, this.formData)
        .then(response =>{
            // 로그인 성공 시
            console.log(response.data)
            // 서버에서 받은 JWT 토큰을 로컬 스토리지에 저장
            localStorage.setItem('token', response.data.token)
            this.$router.push({name: 'Home'})
        })
        .catch(error =>{
            // 로그인이 실패 시
            alert('존재하지 않은 사용자입니다.')
            this.formData.userId = ''
            this.formData.password = ''
            this.$router.push({name: 'PostLogin'})
            console.error('로그인 오류', error)
        })
    },
},
}
</script>

<style scoped>
.login-container {
width: 100%;
max-width: 400px;
margin: 0 auto;
padding: 20px;
border: 1px solid #ccc;
border-radius: 8px;
background-color: #f9f9f9;
}

h1 {
text-align: center;
margin-bottom: 20px;
}

.form-group {
margin-bottom: 15px;
}

label {
display: block;
margin-bottom: 5px;
}

input {
width: 100%;
padding: 8px;
border: 1px solid #ccc;
border-radius: 4px;
box-sizing: border-box;
font-size: 16px;
}

button {
width: 100%;
padding: 10px;
border: none;
border-radius: 4px;
background-color: #007bff;
color: white;
font-size: 16px;
font-weight: bold;
cursor: pointer;
}

button:hover {
background-color: #0056b3;
}

/* 비활성화된 버튼 스타일 */
button.disabled-btn {
  background-color: #ccc; /* 회색 */
  cursor: not-allowed;
}

/* 버튼에 마우스를 올렸을 때 활성화 */
button:not(.disabled-btn):hover {
  background-color: #0056b3;
}
</style>  