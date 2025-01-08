import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import mitt from 'mitt'

// 에미터를 전역 속성으로 정의
const emitter = mitt()
const app = createApp(App)
app.config.globalProperties.emitter = emitter
app.use(router).mount('#app')