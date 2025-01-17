// 유효시간 만료된 토큰 정리
import axios from "axios"

const axiosInstance = axios.create({
    baseURL: 'https://localhost:3000',
    timeout: 10000
})

// 응답 인터셉터
axiosInstance.interceptors.response.use(
    response => {
      console.log('11응답 성공', response)
      return response
    },
    async (error) => {
      console.log('인터셉터에서 오류:', error);
      if (error.response && error.response.status === 401) {
        console.log('토큰 만료');
        alert('로그인 세션이 만료되었습니다.')
        localStorage.removeItem('token');  // 토큰 삭제
          // alert 이후 페이지 이동을 약간 지연
        setTimeout(() => {
          window.location.href = '/login';
        }, 500); // 0.1초 대기
      }
      return Promise.reject(error);
    }
)
  
export default axiosInstance;