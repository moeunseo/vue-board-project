import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import mitt from 'mitt'
const emitter = mitt()
const app = createApp(App)
app.config.globalProperties.emitter = emitter

const socket = new WebSocket('wss://localhost:8081');

// 웹소켓 연결 상태 관리
socket.onopen = () => {
  console.log('웹소켓 서버와 연결되었습니다.');
};

socket.onmessage = (event) => {
  console.log('서버로부터 받은 메시지:', event.data);
};

socket.onclose = () => {
  console.log('웹소켓 연결이 종료되었습니다.');
};

socket.onerror = (error) => {
  console.log('웹소켓 오류:', error);
};

// 앱에 소켓을 글로벌 속성으로 추가하여 다른 컴포넌트에서 사용할 수 있게 합니다.
app.config.globalProperties.socket = socket;
app.use(router).mount('#app')