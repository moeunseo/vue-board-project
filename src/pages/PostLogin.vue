<template>
<div class="login-container">
    <h1>로그인</h1>
    <form @submit.prevent="handleLogin">
    <div class="form-group">
        <label for="username">아이디</label>
        <input type="text" id="username" v-model="formData.userId" placeholder="아이디를 입력하세요"/>
    </div>
    <div class="form-group">
        <label for="password">비밀번호</label>
        <input type="password" id="password" v-model="formData.password" placeholder="비밀번호를 입력하세요"/>
    </div>
    <button type="submit">로그인</button>
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
    };
},
methods: {
    handleLogin() {
        // 로그인 처리 로직
        console.log('로그인 시도:', this.formData)

        axios
        .post(`http://localhost:3000/login`, this.formData)
        .then(response =>{
            // 로그인 성공 시
            console.log(response.data)
            this.$router.push({name: 'Home'})
        })
        .catch(error =>{
            // 로그인이 실패 시
            alert('존재하지 않은 사용자입니다.')
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
</style>  