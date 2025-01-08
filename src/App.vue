<template>
  <!-- 라우터 경로 설정 시 리스트 페이지도 구현했기에 직접 렌더링을 진행하지 않아도 된다. -->
  <router-view />
</template>

<script>

export default {

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
