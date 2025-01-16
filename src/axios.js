// 유효시간 만료된 토큰 정리
import axios from "axios"

const axiosInstance = axios.create({
    baseURL: 'https://localhost:3000',
    timeout: 10000
})

// 응답 인터셉터
axiosInstance.interceptors.response.use(
    response => {
      console.log('응답 성공'. response)
      return response
    },
    error => {
      console.log("인터셉터 실행됨!"); // 인터셉터 실행 여부 확인
        if (error.response) {
            console.log("응답 상태 코드:", error.response.status); // 상태 코드 확인
            console.log("응답 데이터:", error.response.data);       // 응답 데이터 확인
        } else {
            console.log("응답 자체가 없음 (서버 연결 실패 등)");
        }

      if (error.response || error.response.status === 401) {
        // 401 오류 발생 시, 토큰 만료 처리
        alert('로그인 세션이 만료되었습니다.')
        localStorage.removeItem('token')
        // 로그인 페이지로 이동
        window.location.href('/login')
      }
      return Promise.reject(error);
    }
)
  
export default axiosInstance;