<template>
  <!-- 라우터 경로 설정 시 리스트 페이지도 구현했기에 직접 렌더링을 진행하지 않아도 된다. -->
  <router-view />
</template>

<script>
import axios from 'axios';
export default {
  name: 'App',
  mounted(){
    console.log('app.vue 실행 중!!!!!!!!!!')
    this.checkTokenValidity()
  },
  methods:{
    checkTokenValidity(){
      console.log('실행되는거니?????????')
      const token = localStorage.getItem('token')

      console.log('받아온 token값', token)
      if(!token){
        console.log('토큰없음. 로그아웃 처리')
        return
      }
      axios
      .get('/auth/check-token',{
        headers: {Authorization: `Bearer ${token}`}
      })
      .then((response) =>{
        console.log('토큰 유효', response.data)
      })
      .catch((error)=>{
        if (error.response && error.response.status === 401) {
            // 여기서 로그아웃 처리 불필요! Axios.js에서 이미 처리함
            console.log('Axios.js에서 처리된 토큰 만료')
        }
      })
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
