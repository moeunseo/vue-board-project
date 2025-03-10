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
const moment = require('moment')
// 비밀번호 암호화를 위한 모듈
const bcrypt = require('bcrypt')

// 보안 강화
const https = require('https')
const server = https.createServer({
    key: fs.readFileSync('localhost.key'),
    cert: fs.readFileSync('localhost.crt')
}, app)

app.use(cors({
    origin: 'https://localhost:8081',  // 클라이언트의 URL을 정확하게 지정
    // credentials: true,  // 쿠키를 포함한 요청을 허용
}));

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


// 비밀번호를 암호화하는 함수
async function hashPassword(plainPassword) {
    const saltRounds = 10; // 솔트 라운드 수 (보안 수준)
    try {
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds)
        return hashedPassword
    } catch (error) {
        console.error('비밀번호 암호화 오류:', error)
        throw error
    }
}

// 클라이언트로 부터 요청이 들어오면 express는 데이터가 json형식인지 몰라서 직접 설정
app.use(express.json())

// 아이디 중복 확인
app.post('/userIdCheck', (req, res)=>{
    const userId = req.body.userId
    console.log('받아온 userId', userId)

    if(userId === ''){
        return res.status(400).json({ message: "빈 값 아이디 받아옴" })
    }

    db.query('select userId from board_signup where userId = ?',
        [userId],
        (err, result) =>{
            if(err){
                console.error('아이디 중복확인 오류 ',err)
                return res.status(500).json({message: '서버 오류 다시 시도해주세요'})
            }

            // 행이 없다면 아이디 생성 완료
            if(result.length > 0){
                return res.status(200).json({exists: true}) // 중복아이디가 존재
            }
            else{
                return res.status(200).json({exists: false}) // 아이디 사용 가능
            }
        }
    ) 
})

// 회원가입
app.post('/signup', async (req, res)=>{
    const {username, userId, password} = req.body

    if(username === '' || userId === '' || password ==='' ){
        return res.status(400).json({ message: "모든 필드를 채워주세요." })
    }

    try{
        const hashedPassword = await hashPassword(password)
        db.query(`
            insert into board_signup (userName, userId, userPwd)
            values (?, ?, ?)`,
            [username, userId, hashedPassword],
            (err) =>{
                if(err){
                    console.error('회원가입 DB쿼리 실행 오류: ',err)
                    return res.status(500).json({message: '서버 오류, 다시 시도해주세요.'})
                }
                res.status(200).json({message: '회원가입 완료되었습니다.'})
            }
        )   
    }
    catch(error){
        console.error('비밀번호 암호화 오류', error)
        return res.status(500).json({message: '비밀번호 암호화 오류'})
    }
})

// 입력된 비밀번호와 저장된 해시된 비밀번호를 비교하는 함수
async function comparePassword(plainPassword, hashedPassword) {
    try {
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword)
        return isMatch
    } catch (error) {
        console.error('비밀번호 비교 오류:', error)
        throw error
    }
}

// 로그인
// 토큰 사용
const jwt = require('jsonwebtoken')
const secretKey = 'vuetest'
// 토큰 유효성 체크
const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization']

    // 로그인을 하지 않은 사람이 게시글을 볼 수 있게
    if (!token) {
        next()
        return
    }

    jwt.verify(token.split(' ')[1], secretKey, (err, user) => {
    if (err) {
        console.error('토큰 유효기간 확인 필요', err)
        return res.status(401).json({message: '토큰이 유효하지 않습니다.'})
    }
    req.user = user  // 검증된 사용자 정보 저장
    next()  // 요청을 처리할 수 있도록 이어짐
    })
}

// 토큰 만료 시 구현
app.get('/auth/check-token', authenticateJWT, (req, res) =>{
    res.status(200).json({message: '토큰이 유효합니다.'})
})

// 로그인 구현
app.post('/login', async (req, res)=>{
    console.log('받아온 아이디 비밀번호', req.body)
    const {userId, password} = req.body

    // 아이디 비밀번호 유효성 검사
    if(userId === '' || password === ''){
        return res.status(400).json({ message: "모든 필드를 채워주세요." })
    }

    // 비동기 처리 작업을 위해 Promise 사용
    try {
        // 데이터베이스에서 사용자 정보 조회
        const result = await new Promise((resolve, reject) => {
          db.query(`
            SELECT usernum, userName, userId, userPwd
            FROM board_signup
            WHERE userId = ?`,
            [userId],
            (err, result) => {
              if (err) {
                console.error('사용자 찾기 오류:', err);
                reject('사용자를 조회하는 도중 오류가 발생했습니다.');
              } else {
                resolve(result);
              }
            })
        })
    
        if (result.length === 0) {
          return res.status(404)
          .json({
            message: '사용자를 찾을 수 없습니다. 입력한 아이디 혹은 비밀번호를 확인해주세요.',
            statusCode: 404,
            error: 'UserNotFound'
          })
        }
    
        // 비밀번호 비교
        const isMatch = await comparePassword(password, result[0].userPwd)
        if (!isMatch) {
          return res.status(400)
          .json({
            message: '비밀번호가 일치하지 않습니다.',
            statusCode: 400,
            error: 'InvalidPassword'
        })
        }
    
        // JWT 토큰 발급
        const token = jwt.sign({
            usernum: result[0].usernum, 
            userName: result[0].userName, 
            userId: result[0].userId 
        },secretKey, { expiresIn: '1h' })  // 토큰 유효 기간 (1시간)
    
        // jwt 토큰 응답 전송
        res.status(200).json({token})
    } 
    catch (error) {
        console.error('로그인 처리 오류:', error);
        res.status(500)
        .json({
            message: '로그인 처리 중 오류가 발생했습니다.',
            statusCode: 500
        })
    }
})

// 간단한 라우트 추가
// 메인 화면(PostList)에 데이터를 가져오기
app.get('/main', (req, res) => {
    // 작성이 최신순으로 불러오기
    db.query(`
        select b.board_id, b.board_title, b.userNum, b.board_update_time, bs.userName 
        from board b left join board_signup bs on
        b.userNum = bs.usernum
        order by b.board_update_time desc`, 
        (err, results)=>{
        if(err){
            console.error('데이터를 가져오는 도중 오류 발생', err)
            return res.status(500).json({message:'데이터를 불러오는 도중 에러 발생생.'})
        }
        res.status(200).json(results) // json형태로 보내기 때문에 express.json 필요X
    })
})

// 검색된 결과 select
app.get('/main/:query', (req, res)=>{
    const searchWord = req.params.query
    
    const searchQuery = `
        SELECT b.board_id, b.board_title, b.userNum, b.board_update_time, bs.userName 
        from board b left join board_signup bs on
        b.userNum = bs.usernum
        WHERE b.board_title LIKE CONCAT('%', ?, '%')
        OR b.board_content LIKE CONCAT('%', ?, '%')
        order by board_update_time desc`
    db.query(searchQuery,
        [searchWord, searchWord],
        (err, results)=>{
            if(err){
                console.error('검색한 결과 오류 발생', err)
                return res.status(500)
                .json({message: '검색한 결과 가져오는 도중 오류 발생'})
            }
            else{
                res.status(200).json(results)
            }
        }
    )
})

// Multer 설정 (파일 업로드)
// 파일 저장할 폴더 생성 및 이름 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const date = new Date()
        const year = String(date.getFullYear())
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 월
        const day = String(date.getDate()).padStart(2, '0'); // 일
        
        const folderPath = path.join(__dirname, 'uploads', year, month, day).replace(/\\/g, '/')

        // 폴더가 없다면 자동 생성
        fs.mkdirSync(folderPath, {recursive: true})

        // 콜백
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
        // 모든 파일 업로드 허용
      cb(null, true)
    }
})

// 게시글 작성
app.post('/write', authenticateJWT, upload.array('files'), (req, res) => {
    console.log('받아온 제목과 내용', req.body)
    console.log('받아온 파일', req.files)

     const {title, content} = req.body

    // 제목과 내용이 없으면 에러 반환 (더블체크)
    // 개발자 도구에서는 html파일을 전체 볼 수가 있어, 사용자가 임시로 작성하기 버튼을 비활성화
    // 한 후에 빈 값을 보낼 수 있다. (우회되는 경우 방지)
    // 따라서 백엔드에서 한번 더 체크하는 것이 보안에 더 좋다.
    if (!title || !content) {
        return res.status(400).json({
            message: '모든 필드를 입력해주세요.',
            statusCode: 400
        })
    }

    const usernum = req.user.usernum
    console.log('로그인한 유저', usernum)

    // board INSERT
    db.query(
        'INSERT INTO board (board_title, board_content, userNum) VALUES (?, ?, ?)',
        [title, content, usernum],
        (err, result) => {
            if (err) {
                console.error('게시글 작성 중에 오류 발생', err)
                return res.status(500).json({
                    message: '게시글 작성 중에 오류 발생',
                    statusCode: 500
                })
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
                // Promise가 완료된 후 실행
                Promise.all(fileQueries)
                .then(()=>{
                    res.status(200).send('게시글이 성공적으로 업로드 되었습니다.')
                })
                .catch(error =>{
                    console.error('게시글 업로드 중에 오류 발생', error)
                    res.status(500).json({
                        message: '게시글 업로드 중에 오류 발생',
                        statusCode: 500
                    })
                })
            }
            else{
                res.status(200).send('게시글이 성공적으로 업로드되었습니다. (파일 없음)')
            }
        }
    )
})

// 게시글 상세보기 페이지 이동
app.get('/detail/:id', (req, res) => {
    const postId = req.params.id

    // 토큰이 존재하는 경우만 authenticateJWT 미들웨어 실행
    if (req.headers['authorization']) {
        authenticateJWT(req, res, () => {
            console.log('로그인한 유저', req.user) // 유저 정보 확인
            fetchPostDetails(postId, res) // 게시글 상세 데이터 반환
        })
    } else {
        // 토큰이 없는 경우에도 게시글 상세 정보를 반환
        fetchPostDetails(postId, res)
    }
})

// 게시글 상세 데이터 반환 함수
function fetchPostDetails(postId, res) {
    db.query(`
      select b.userNum, b.board_title, b.board_content, b.board_update_time, b.board_current_time, 
             f.file_id, f.file_name, f.file_url, f.file_size 
      from board b 
      left join board_file f on b.board_id = f.board_id
      where b.board_id = ?`, 
      [postId], 
      (err, results) => {
        if (err) {
            console.error('게시글을 가져오는 도중 오류 발생', err)
            return res.status(500).json({
                message: '게시글을 가져오는 도중 에러 발생',
                statusCode: 500
            })
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: '게시글을 찾을 수 없습니다. (Not Found)',
                statusCode: 404
            })
        }

        // json형태로 받기
        const post = results[0]
        const updatedTime = new Date(post.board_update_time)
        const createdTime = new Date(post.board_current_time)

        const timeDifference = updatedTime.getTime() - createdTime.getTime()
        const status = timeDifference !== 0 ? '(수정됨)' : ''

        const response = {
            userNum: post.userNum,
            title: post.board_title,
            content: post.board_content,
            updatedAt: post.board_update_time,
            status: status,
            files: []
        }

        results.forEach(result => {
            if (result.file_name) {
                response.files.push({
                    fileId: result.file_id,
                    fileName: result.file_name,
                    fileUrl: result.file_url,
                    fileSize: result.file_size
                })
            }
        })
        res.status(200).json(response)  // 게시글 정보 응답
    })
}

// 게시글 삭제
// 트랜잭션으로도 해보기
app.delete('/detail/:id', authenticateJWT, (req, res) => {
    const postId = req.params.id

    // 삭제 권한 확인
    db.query('select userNum from board where board_id = ?', [postId], (err, resultUser) => {
        if (err) {
            console.error('게시글 삭제 중 유저 확인 오류 발생', err)
            return res.status(500).json({
                message: '게시글 삭제 중 유저 확인 오류 발생',
                statusCode: 500
            })
        }

        const userNum = resultUser[0].userNum
        if (userNum !== req.user.usernum) {
            return res.status(403).json({
                message: '수정 권한이 없습니다.',
                statusCode: 403
            })
        }

        // 권한이 있으면 첨부파일 삭제와 게시글 삭제 진행
        db.query('select file_url from board_file where board_id = ?', [postId], async (err, resultsDB) => {
            if (err) {
                console.error('첨부파일 가져오는 도중 오류 발생', err)
                return res.status(500).json({
                    message: '첨부파일 가져오는 도중 오류 발생',
                    statusCode: 500
                })
            }

            // 서버에 업로드된 파일 삭제
            const fileDeletePromises = resultsDB.map(async (file) => {
                const filePath = path.resolve(file.file_url)
                console.log(filePath)
                // 업로드된 파일이 있는지 확인
                try {
                    await fs.promises.unlink(filePath)
                    console.log(`파일 삭제 성공: ${filePath}`)
                } catch (err) {
                    console.error(`파일 삭제 실패: ${filePath}`, err)
                    throw new Error('파일 삭제 중 오류 발생')
                }
            })

            // 게시글 삭제
            db.query('delete from board where board_id = ?', [postId], (err, results) => {
                if (err) {
                    console.error('DB 삭제 중 오류 발생', err)
                    return res.status(500).json({
                        message: '게시글 삭제 중 오류 발생',
                        statusCode: 500
                    })
                }

                if (results.affectedRows === 0) {
                    return res.status(404).json({
                        message: '게시글이 존재하지 않습니다. (Not Found)',
                        statusCode: 404
                    })
                }

                Promise.all(fileDeletePromises)
                .then(() => {
                    res.status(200).send('게시글 삭제 완료')
                })
                .catch((error) => {
                    console.error('게시글 삭제 중 오류 발생', error)
                    res.status(500).json({
                        message: '게시글 삭제 중 오류 발생',
                        statusCode: 500
                    })
                })
            })
        })
    })
})

// 게시글 수정
app.put('/detail/:id', authenticateJWT, upload.array('files'),(req, res)=>{
    const postId = req.params.id
    const {id, title, content} = req.body

    console.log('받아온 데이터들: ',postId, id, title, content)
    console.log('==', req.files)

    if (!title || !content) {
        return res.status(400).json({
            message: '모든 필드를 채워주세요.',
            statusCode: 400
        })
    }

    // 수정 권한 등록
    db.query('select userNum from board where board_id = ?',
        [postId],
        (err, result)=>{
            if(err){
                console.error('사용자 번호 가져오면서 에러 발생', err)
                return res.status(500).json({
                    message: '유저 확인 중 오류 발생',
                    statusCode: 500
                })
            }

            const board = result[0]
            if(board.userNum !== req.user.usernum){
                return res.status(403).json({
                    message: '수정 권한이 없습니다.',
                    statusCode: 403
                })
            }

            db.query('update board set board_title = ?, board_content = ?, board_update_time = now() where board_id = ?',
                [title, content, postId],
                (err) =>{
                    if(err){
                        console.error('게시글 수정 중 오류 발생', err)
                        return res.status(500).json({
                            message: '게시글 수정 중 오류 발생',
                            statusCode: 500
                        })
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
                            res.status(200).send('게시글 수정 완료')
                        })
                        .catch(error =>{
                            console.error('게시글 수정(파일 업로드) 중 오류 발생', error)
                            res.status(500).json({
                                message: '게시글 수정 중 오류 발생', 
                                statusCode: 500
                            })
                        })
                    }
                    else{
                        res.status(200).send('게시글 수정 완료')
                    }
                }
            )
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
            if(err) {
                console.error('게시글 수정 중 파일 삭제 오류 발생', err)
                return res.status(500).json({
                    message: '게시글 수정 중 파일 삭제 오류 발생',
                    statusCode: 500
                })
            }

            // 만약 삭제할 파일이 있다면
            if(result.affectedRows > 0){
                const filePath = path.resolve(fileUrl)
                fs.unlink(filePath, (err)=>{
                    if(err){
                        console.error(`파일 삭제 실패: ${filePath}`, err)
                        return res.status(500).json({
                            message: '수정 중 파일 삭제 실패',
                            statusCode: 500
                        })
                    }
                    else{
                        console.log(`파일 삭제 성공: ${filePath}`)
                        res.status(200).send('업로도된 파일 삭제 완료')
                    }
                })
            }
            else{
                res.status(404).send('파일을 찾을 수 없습니다.')
            }
        }
    )
})

  
// 댓글 목록 불러오기
app.get('/comment/:id', (req, res)=>{
    const boardId = req.params.id
    db.query(`
        select c.comment_id, c.comment_content, c.created_at, c.updated_at, c.userNum, bs.userName 
        from comments c join board_signup bs 
        on c.userNum = bs.usernum
        where board_id = ?
        order by c.created_at desc`,
        [boardId],
        (err, results) =>{
            if(err){
                console.error('댓글 목록 오류', err)
                return res.status(500).json({
                    message: '댓글 목록을 불러오는 도중 오류 발생',
                    statusCode: 500
                })
            }

            const commentStatus = results.map(comment =>{
                const created_at = new Date(comment.created_at)
                const updated_at = new Date(comment.updated_at)

                const gapTime = updated_at.getTime() - created_at.getTime()
                const status = gapTime !== 0 ? '(수정됨)' : ''

                return {...comment, status}
            })
        
            res.status(200).json(commentStatus)
        }
    )
})

// 댓글 작성
app.post('/comment/:id', authenticateJWT,(req,res)=>{
    const {newComment, boardId} = req.body

    if(!newComment){
        return res.status(400).json({
            message: '댓글 입력은 필수입니다.',
            statusCode: 400
        })
    }

    db.query('insert into comments (comment_content, board_id, userNum) values (?, ?, ?)',
        [newComment, boardId, req.user.usernum],
        (err) =>{
            if(err){
                console.error('댓글 작성 시 오류 발생', err)
                return res.status(500).json({
                    message: '댓글 작성하면서 오류 발생',
                    statusCode: 500
                })
            }
            res.status(200).json({message: '게시글 댓글 작성 완료'})
        }
    )
})
// 댓글 삭제
app.delete('/comment/:id', authenticateJWT, (req, res)=>{
    const boardId = req.params.id
    const {commentId, userId} = req.body

    if(req.user.usernum !== userId){
        return res.status(403).json({
            message: '댓글 삭제 권한이 없습니다.'
        })
    }

    db.query('delete from comments where comment_id=? and board_id=?',
        [commentId, boardId],
        (err, results)=>{
            if(err){
                console.error('댓글 삭제 오류', err)
                return res.status(500).json({
                    message: '댓글 삭제 중 오류 발생',
                    statusCode: 500
                })
            }

            if(results.affectedRows === 0){
                return res.status(404).json({
                    message: '댓글을 찾을 수 없습니다.'
                })
            }
            res.status(200).send('댓글 삭제 완료!')
        }
    )
})

// 댓글 수정
app.put('/comment/:id', authenticateJWT, (req, res)=>{
    const boardId = req.params.id
    const {id: commentId, newComment: commentContent, userId} = req.body

    if (!commentContent) {
        return res.status(400).json({message: '댓글은 필수입니다.'})
    }

    if(req.user.usernum !== userId){
        return res.status(403).json({
            message: '수정 권한이 없습니다.',
            statusCode: 400
        })
    }

    db.query('update comments set comment_content = ?, updated_at = now() where comment_id = ? and board_id = ?',
        [commentContent, commentId, boardId],
        (err)=>{
            if(err){
                console.error('댓글 수정 오류 발생', err)
                return res.status(500).json({
                    message: '댓글 수정 중 오류 발생',
                    statusCode: 500
                })
            }
            res.status(200).send('댓글 수정 완료!')
        }
    )
})

// Vue 빌드 파일 정적 제공
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// 서버 시작 http일 때
// app.listen(port, () => {
// console.log(`Server is running on http://localhost:${port}`)
// })

// https.createServer(server, app).listen(port, () => {
//     console.log('HTTPS server is running on https://localhost:3000')
// })
server.listen(port, ()=>{
    console.log(`HTTPS server is running on https://localhost:${port}`)
})