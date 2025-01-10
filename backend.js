const express  = require('express')
const mysql = require('mysql')
const app = express()
const port = 3000
const path = require('path')
const cors = require('cors'); // CORS 패키지 추가
app.use(cors()); // 모든 요청을 허용 (개발 단계에서만 사용)


// MySQL 연결 설정
const db = mysql.createConnection({
    host: 'localhost',
    user:'root',
    password:'devpassword123',
    database:'board'
})

db.connect((err)=>{
    if(err){
        console.log('MySQL 연결 실패!', err)
    } else{
        console.log('MySQL 연결 성공!')
    }
})

// 간단한 라우트 추가
// 메인 화면에 데이터를 가져오기
app.get('/main', (req, res) => {
    db.query('SELECT *FROM board', (err, results)=>{
        if(err){
            res.status(500).send('서버 오류')
            return
        }
        res.json(results)
    })
  })

app.use(express.json());
// 게시글 작성
app.post('/write', (req, res) => {
    console.log(req.body)
    const { title, content } = req.body;

    // 제목과 내용이 없으면 에러 반환
    if (!title || !content) {
        return res.status(400).send('제목과 내용은 필수입니다.');
    }

    // 게시글 데이터 DB에 삽입
    db.query(
        'INSERT INTO board (board_title, board_content, board_current_time) VALUES (?, ?, NOW())',
        [title, content],
        (err) => {
            if (err) {
                return res.status(500).send('서버 오류');
            }
            res.status(201).send('게시글 작성 완료');
        }
    );
});

// 게시글 상세보기 페이지 이동
app.get('/detail/:id', (req, res) => {
    const postId = req.params.id
    db.query('select board_title, board_content, board_update_time from board where board_id = ?',
        [postId],
        (err, results)=>{
        if(err){
            return res.status(500).send('서버 오류')
        }

        if(results.length === 0){
            return res.status(404).send('게시글을 찾을 수 없습니다.')
        }
        console.log('반환 결과: ', results)
        res.json(results[0])
    })
  })

// 게시글 삭제
app.delete('/detail/:id', (req, res)=>{
    const postId = req.params.id
    db.query('delete from board where board_id = ?',
        [postId],
        (err) =>{
            if(err){
                console.err('DB 삭제 중 오류 발생', err)
                return res.status(500).send('서버 오류')
            }
            res.status(200).send('게시글 삭제 성공!')
        } 
    )
})

// 게시글 수정
app.put('/detail/:id', (req, res)=>{
    const postId = req.params.id
    const {title, content} = req.body

    console.log(postId, title, content)

    db.query('update board set board_title = ?, board_content = ?, board_update_time = now() where board_id = ?',
        [title, content, postId],
        (err) =>{
            if(err){
                console.error('안되니 왜!!', err)
                return res.status(500).send('서버 오류')
            }
            res.status(200).send('게시글 수정 완료!')
        }
    )
})
  
// Vue 빌드 파일 정적 제공
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

  // 서버 시작
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  })