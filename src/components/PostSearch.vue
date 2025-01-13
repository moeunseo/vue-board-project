<template>
    <div class="=list-header">
        <form @submit.prevent="searchBoard" class="search-form">
            <input type="text" v-model.trim="searchWord" placeholder="검색어를 입력하세요">
            <button type="submit">검색</button>
        </form>
    </div>
</template>

<script>
    export default {
        name: 'PostSearch',
        data(){
            return {
                searchWord: ""
            }
        },
        methods:{
            searchBoard(){
                console.log('검색한 단어', this.searchWord)
                if(this.searchWord.trim() === 0){
                    alert('검색어를 입력해주세요')
                    return
                }
                // 부모 컴포넌트(리스트 컴포넌트)로 해당 검색어를 에미터로 보냄
                this.$emit('searchWord', this.searchWord)
                
            }
        }
    }
</script>

<style scoped>
/* 상위 컨테이너: 검색 폼을 오른쪽에 정렬 */
.list-header {
  display: flex;
  justify-content: flex-end; /* 오른쪽 정렬 */
  align-items: center; /* 수직 중앙 정렬 */
  padding: 10px 20px; /* 상하/좌우 여백 */
  border-bottom: 1px solid #ddd; /* 구분선 */
  background-color: #f9f9f9; /* 배경 색상 */
}

/* 검색 폼 스타일 */
.search-form {
  display: flex; /* 내부 요소들을 가로로 정렬 */
  justify-content: flex-end;
  align-items: center; /* 수직 중앙 정렬 */
  gap: 10px; /* 입력창과 버튼 간의 간격 */
}

.search-form input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 200px; /* 입력창 너비 */
  transition: box-shadow 0.2s;
}

.search-form input:focus {
  outline: none;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5); /* 포커스 시 효과 */
  border-color: #007bff;
}

.search-form button {
  padding: 8px 15px;
  background-color: #007bff;
  color: white;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}
</style>