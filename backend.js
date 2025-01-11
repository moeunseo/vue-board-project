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

// db 연결 성공 여부 체크
db.connect((err)=>{
    if(err){
        console.log('MySQL 연결 실패!', err)
    } else{
        console.log('MySQL 연결 성공!')
    }
})

// 간단한 라우트 추가
// 메인 화면(PostList)에 데이터를 가져오기
app.get('/main', (req, res) => {
    db.query('SELECT *FROM board', (err, results)=>{
        if(err){
            return res.status(500).send('서버 오류')
        }
        res.json(results) // json형태로 보내기 때문에 express.json 필요X
    })
  })

// 클라이언트로 부터 요청이 들어오면 express는 데이터가 json형식인지 몰라서 직접 설정
app.use(express.json())
// 게시글 작성
app.post('/write', (req, res) => {
    console.log('작성한 데이터',req.body)
    const { title, content } = req.body

    // 제목과 내용이 없으면 에러 반환 (더블체크)
    // 개발자 도구에서는 html파일을 전체 볼 수가 있어, 사용자가 임시로 작성하기 버튼을 비활성화
    // 한 후에 빈 값을 보낼 수 있다. (우회되는 경우 방지)
    // 따라서 백엔드에서 한번 더 체크하는 것이 보안에 더 좋다.
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
    db.query('select board_title, board_content, board_update_time, board_current_time from board where board_id = ?',
        [postId],
        (err, results)=>{
        if(err){
            return res.status(500).send('서버 오류')
        }

        // 잘못된 url, 페이지가 존재하지 않는 경우, 404를 띄어주는 것이 좋다.
        if(results.length === 0){
            return res.status(404).send('게시글을 찾을 수 없습니다.')
        }
        console.log('반환 결과: ', results)
        // json배열의 형태가 아닌 객체 형태로 응답
        // 배열의 형태로 보내면 앞단에서 데이터를 가져올 때 post[0].board~
        // 이런식으로 가져와야해서 애초부터 객체로 응답!
        const post = results[0]
        const updatedTime = new Date(post.board_update_time)
        const createdTime = new Date(post.board_current_time)
        
        const timeDifference = updatedTime.getTime() - createdTime.getTime();
        console.log('timeDifference (ms):', timeDifference);  // 차이 출력
        
        const status = timeDifference !== 0? '(수정됨)' : ''
        // ...: 스프레드 연산자
        // 기존 데이터 + 필요한 값을 덧붙이기 위해 사용
        res.json({...post, status})
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

    if (!title || !content) {
        return res.status(400).send('제목과 내용은 필수입니다.');
    }

    db.query('update board set board_title = ?, board_content = ?, board_update_time = now() where board_id = ?',
        [title, content, postId],
        (err) =>{
            if(err){
                return res.status(500).send('서버 오류')
            }
            res.status(200).send('게시글 수정 완료!')
        }
    )
})
  
// 댓글 목록 불러오기
app.get('/comment/:id', (req, res)=>{
    const boardId = req.params.id
    db.query('select comment_content, updated_at from comments where board_id = ?',
        [boardId],
        (err, results) =>{
            if(err){
                return res.status(500).send('서버 오류')
            }
            console.log(results)
            res.json(results)
        }
    )
})

// 댓글 작성
app.post('/comment/:id', (req,res)=>{
    const {newComment, boardId} = req.body

    console.log('================',newComment)
    console.log('================',boardId)

    if(!newComment){
        return res.status(400).send('제목과 내용은 필수입니다.')
    }

    db.query('insert into comments (comment_content, board_id) values (?, ?)',
        [newComment, boardId],
        (err) =>{
            if(err){
                console.error('무슨오류야?', err)
                return res.status(500).send('서버 오류')
            }
            res.status(201).send('게시글 작성 완료');
        }
    )
})
// 댓글 삭제

// 댓글 수정


// Vue 빌드 파일 정적 제공
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
})

  // 서버 시작
app.listen(port, () => {
console.log(`Server is running on http://localhost:${port}`);
})