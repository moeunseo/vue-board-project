const express  = require('express')
const mysql = require('mysql')
const app = express()
const port = 3000
const path = require('path')
// 이미지 업로드할 때 많이 사용
const multer = require('multer')
// 파일 시스템에 사용되는 모듈
const fs = require('fs')
const cors = require('cors'); // CORS 패키지 추가
app.use(cors()); // 모든 요청을 허용 (개발 단계에서만 사용)
const moment = require('moment')


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
    // 작성이 최신순으로 불러오기
    db.query('SELECT *FROM board order by board_current_time desc', 
        (err, results)=>{
        if(err){
            return res.status(500).send('서버 오류')
        }
        res.json(results) // json형태로 보내기 때문에 express.json 필요X
    })
})

// 검색된 결과 select
app.get('/main/:query', (req, res)=>{
    // 검색된 단어를 받아옴
    console.log('잘되니?', req.params.query)
    const searchWord = req.params.query
    
    const serarchQuery = `
        SELECT *FROM board
        WHERE board_title LIKE CONCAT('%', ?, '%')
        OR board_content LIKE CONCAT('%', ?, '%')
        order by board_current_time desc`
    db.query(serarchQuery,
        [searchWord, searchWord],
        (err, results)=>{
            if(err){
                return res.status(500).send(err)
            }
            else{
                res.json(results)
            }
        }
    )
})

// 클라이언트로 부터 요청이 들어오면 express는 데이터가 json형식인지 몰라서 직접 설정
app.use(express.json())

// Multer 설정 (파일 업로드)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const date = new Date()
        const year = String(date.getFullYear())
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 월
        const day = String(date.getDate()).padStart(2, '0'); // 일
        
        const folderPath = path.join(__dirname, 'uploads', year, month, day).replace(/\\/g, '/')

        // 폴더가 없다면 자동 생성
        fs.mkdirSync(folderPath, {recursive: true})

        cb(null, folderPath)
      },
      filename: (req, file, cb) => {
        // moment 모듈을 사용하여 시간 형태와 원본 파일 이름 한글이 깨지지 않게 저장
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
        cb(null, moment().format('YYYYMMDD') + '_' + file.originalname); // 파일 이름 설정
      }
})

// multer를 사용하면 json형태를 자동 파싱해준다
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB 제한
    fileFilter: (req, file, cb) => {
      cb(null, true)
    }
})

// 게시글 작성
app.post('/write', upload.array('files'), (req, res) => {
    console.log('받아온 제목과 내용', req.body)
    console.log('받아온 파일', req.files)

     const {title, content} = req.body

    // 제목과 내용이 없으면 에러 반환 (더블체크)
    // 개발자 도구에서는 html파일을 전체 볼 수가 있어, 사용자가 임시로 작성하기 버튼을 비활성화
    // 한 후에 빈 값을 보낼 수 있다. (우회되는 경우 방지)
    // 따라서 백엔드에서 한번 더 체크하는 것이 보안에 더 좋다.
    if (!title || !content) {
        return res.status(400).send('제목과 내용은 필수입니다.');
    }

    // board INSERT
    db.query(
        'INSERT INTO board (board_title, board_content) VALUES (?, ?)',
        [title, content],
        (err, result) => {
            if (err) {
                return res.status(500).send('서버 오류');
            }

            const boardId = result.insertId // result안에 게시글id값을 포함하고 있음

            // board_file INSERT
            // 파일 업로드가 되었다면~
            if(req.files && req.files.length > 0){
                const fileQueries = req.files.map(file =>{
                    return new Promise((resolve, reject) =>{
                        const filePath = file.path.replace(/\\/g, '/')
                        const fileQuery = 'INSERT INTO board_file (file_name, file_size, file_url, board_id) values (?,?,?,?)'
                        db.query(fileQuery, [file.filename, file.size, filePath,boardId],
                            (err)=>{
                                if(err){
                                    reject('첨부파일 삽입 오류')
                                }
                                else{
                                    resolve()
                                }
                            }
                        )
                    })
                })
                Promise.all(fileQueries)
                .then(()=>{
                    res.status(200).send('게시글이 성공적으로 업로드 되었습니다.')
                })
                .catch(error =>{
                    res.status(500).send(error)
                })
            }
            else{
                res.status(200).send('게시글이 성공적으로 업로드되었습니다. (파일 없음)');
            }
        }
    );
});

// 게시글 상세보기 페이지 이동
app.get('/detail/:id', (req, res) => {
    const postId = req.params.id
    db.query(`
        select b.board_title, b.board_content, b.board_update_time, b.board_current_time, f.file_id, f.file_name, f.file_url, f.file_size 
        from board b left join board_file f
        on b.board_id = f.board_id
        where b.board_id = ?`,
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

        // 게시글과 파일을 같이 보내기 위해해
        const response = {
            title: post.board_title,
            content: post.board_content,
            updatedAt: post.board_update_time,
            status: status,
            files: []
        }

        results.forEach(result =>{
            if(result.file_name){
                response.files.push({
                    fileId: result.file_id,
                    fileName: result.file_name,
                    fileUrl: result.file_url,
                    fileSize: result.file_size
                })
            }
        })
        // ...: 스프레드 연산자
        // 기존 데이터 + 필요한 값을 덧붙이기 위해 사용
        console.log('====', response)
        res.json(response)
    })
  })

// 게시글 삭제
app.delete('/detail/:id', (req, res)=>{
    const postId = req.params.id

    // DB에서 첨부파일 URL 가져오기
    db.query('select file_url from board_file where board_id = ?',
        [postId], 
        (err, resultsDB)=>{
            if (err){
                return res.status(500).send('서버 오류')
            }                

            // 게시글 삭제
            db.query('delete from board where board_id = ?',
                [postId],
                (err, results) =>{
                    if(err){
                        console.error('DB 삭제 중 오류 발생', err)
                        return res.status(500).send('서버 오류')
                    }

                    if(results.affectedRows === 0){
                        return res.status(404).send('게시글을 찾을 수 없습니다.')
                    }
                } 
            )

            // 서버에 업로드된 파일 삭제
            resultsDB.forEach((file)=>{
                const filePath = path.resolve(file.file_url)
                fs.unlink(filePath, (err)=>{
                    if(err) console.error(`파일 삭제 실패: ${filePath}`, err)
                    else console.log(`파일 삭제 성공: ${filePath}`)
                })
            })
            res.status(200).send('게시글 삭제 완료')
        }
    )
})

// 게시글 수정
app.put('/detail/:id', upload.array('files'),(req, res)=>{
    const postId = req.params.id
    const {title, content} = req.body

    console.log('받아온 데이터들: ',postId, title, content)
    console.log('==', req.files)

    if (!title || !content) {
        return res.status(400).send('제목과 내용은 필수입니다.');
    }

    db.query('update board set board_title = ?, board_content = ?, board_update_time = now() where board_id = ?',
        [title, content, postId],
        (err) =>{
            if(err){
                return res.status(500).send('서버 오류')
            }
        
            // 파일이 업로드 됐을 때만 실행
            if(req.files && req.files.length > 0){
                const fileQueries = req.files.map(file =>{
                    return new Promise((resolve, reject) =>{
                        const filePath = file.path.replace(/\\/g, '/')
                        const fileQuery = 'INSERT INTO board_file (file_name, file_size, file_url, board_id) values (?,?,?,?)'
                        db.query(fileQuery, [file.filename, file.size, filePath, postId],
                            (err)=>{
                                if(err){
                                    reject('첨부파일 삽입 오류')
                                }
                                else{
                                    resolve()
                                }
                            }
                        )
                    })
                })
                Promise.all(fileQueries)
                .then(()=>{
                    res.status(200).send('파일 삽입 완료')
                })
                .catch(error =>{
                    res.status(500).send(error)
                })
            }
            else{
                res.status(200).send('파일 삽입 완료')
            }
        }
    )
})

// 게시글 수정 중에 파일 삭제
app.delete('/delete/file', (req,res) =>{
    console.log('삭제할 파일', req.body)
    const {fileId, fileUrl} = req.body.deleteFile

    console.log('id', fileId)
    console.log('url', fileUrl)

    db.query('delete from board_file where file_id = ?',
        [fileId],
        (err, result)=>{
            if(err) return res.status(500).send('파일 삭제 오류', err)
            
            console.log('삭제할 파일: ', result)
            // 만약 삭제할 파일이 있다면
            if(result.affectedRows > 0){
                console.log('ㅎ2')
                const filePath = path.resolve(fileUrl)
                fs.unlink(filePath, (err)=>{
                    if(err){
                        console.error(`파일 삭제 실패: ${filePath}`, err)
                        return res.status(500).send('파일 삭제 실패')
                    }
                    else{
                        console.log(`파일 삭제 성공: ${filePath}`)
                        res.status(200).send('업로도된 파일 삭제 완료')
                    }
                })
            }
            else{
                res.status(404).send('파일 찾을 수 없습니다.')
            }
        }
    )
})

  
// 댓글 목록 불러오기
app.get('/comment/:id', (req, res)=>{
    const boardId = req.params.id
    db.query(`
        select comment_id, comment_content, created_at, updated_at 
        from comments where board_id = ?
        order by created_at desc`,
        [boardId],
        (err, results) =>{
            if(err){
                return res.status(500).send('서버 오류')
            }
            console.log('===========',results)

            const commentStatus = results.map(comment =>{
                const created_at = new Date(comment.created_at)
                const updated_at = new Date(comment.updated_at)

                const gapTime = updated_at.getTime() - created_at.getTime()
                const status = gapTime !== 0 ? '(수정됨)' : ''

                return {...comment, status}
            })
        
            console.log(commentStatus)
            res.json(commentStatus)
        }
    )
})

// 댓글 작성
app.post('/comment/:id', (req,res)=>{
    const {newComment, boardId} = req.body

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
app.delete('/comment/:id', (req, res)=>{
    const boardId = req.params.id
    const commentId = req.body.commentId

    console.log('=========', boardId, commentId)

    db.query('delete from comments where comment_id=? and board_id=?',
        [commentId, boardId],
        (err, results)=>{
            if(err){
                console.error('댓글 삭제 오류!', err)
                return res.status(500).send('서버 오류')
            }

            if(results.affectedRows === 0){
                return res.status(404).send('댓글을 찾을 수 없습니다.')
            }
            res.status(200).send('댓글 삭제 완료!')
        }
    )
})
// 댓글 수정
app.put('/comment/:id', (req, res)=>{
    const boardId = req.params.id
    const {id: commentId, newComment: commentContent} = req.body

    console.log(req.body)
    console.log('===========', boardId, commentId, commentContent)

    if (!commentContent) {
        return res.status(400).send('내용은 필수입니다.')
    }

    db.query('update comments set comment_content = ?, updated_at = now() where comment_id = ? and board_id = ?',
        [commentContent, commentId, boardId],
        (err)=>{
            if(err){
                console.error('댓글 수정 오류!', err)
                return res.status(500).send('서버 오류')
            }
            res.status(200).send('댓글 수정 완료!')
        }
    )
})

// Vue 빌드 파일 정적 제공
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
})

  // 서버 시작
app.listen(port, () => {
console.log(`Server is running on http://localhost:${port}`);
})