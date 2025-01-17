const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    historyApiFallback: true, // history 모드 활성화
    hot: false,
    liveReload: false,
    server: {
      type: 'https', // 새로운 방식으로 HTTPS 활성화
      options: {
        key: './localhost.key', // HTTPS용 키 파일 경로
        cert: './localhost.crt', // HTTPS용 인증서 파일 경로
      },
    },
    proxy: {
      '/': {
        target: 'https://localhost:3000', // 백엔드 URL
        secure: false, // 인증서 검증 비활성화
        changeOrigin: true, // 백엔드와 다른 도메인에서 요청 가능
      },
    },
  },
})