const router = require('express').Router();
const pool = require('../../DB');
const crypto = require('crypto');
const Util = require('../../Util');
const jwt      = require('jsonwebtoken');
const jConfig = require('../../secretConfig.json');

const axios = require('axios');

// 미들웨어 헤더 검사
router.use(function(req, res, next){
	let permitList = ['/auth/login', '/auth/register'];
	let token = req.headers['authorization'];
	
	if(permitList.includes(req.originalUrl)) {
		next();
		return;
	}

    if(!token) {
		res.status(400).send({result: 'failed', msg: '토큰을 입력해주세요.'});
        return;
    }

    if(token.startsWith('Bearer ')) 
		token = token.slice(7, token.length);
	

	jwt.verify(token, jConfig.jtokenSecretKey, function(err, decoded) {
		if(err) 
			res.status(400).send({result: 'failed', msg: '유효하지 않은 토큰 입니다.'});
		else {
			req.decode = decoded;
			/*
				req.decode. { id, name, email, userType}
			*/
			next();
		}
	});
});

// GET
// GET  req.query
// POST req.body

// 학생 게정 생성 코드
router.post('/register', async function(req, res) {
	const {id, pw, name, email} = req.body;

	// 비밀번호 sha256 방식으로 해시화
	var _pw_sha256_hash = crypto.createHash('sha256').update(pw).digest('hex');

	let con;
	try {
		con = await pool.getConnection();

		const query = "INSERT INTO user (id, pw, name, email, userType) values (?, ?, ?, ?, 0)";
		
		await pool.query(con, query, [id, _pw_sha256_hash, name, email]);

		res.send({msg: '회원가입 성공'});

	} catch (error) {
		console.log('에러났을때 처리하는 부분', error);
		if(error.errno === 1062) {
			res.send({msg: '이미 가입되어있는 아이디 입니다.'});
		} else
			res.send({msg: '알수없는 에러 실패'});
	} finally {
		con.release();
	}
});

router.post('/login', async function(req, res) {
	const {id, pw} = req.body;

	// 비밀번호 sha256 방식으로 해시화
	var _pw_sha256_hash = crypto.createHash('sha256').update(pw).digest('hex');

	let con;
	try {
		con = await pool.getConnection();

		const query = "SELECT * FROM user WHERE id = ? and pw = ?";
		
		let result = await pool.query(con, query, [id, _pw_sha256_hash]);
		if(result.length === 1) {
			let token = Util.TokenGen({
				userIdx: result[0].userIdx,
				id: result[0].id,
				name: result[0].name,
				email: result[0].email,
				userType: result[0].userType
			});
			res.status(200).send({msg: '로그인 성공', token: token});
		} else {
			res.status(400).send({msg: '로그인 실패'});
		}

	} catch (error) {
		console.log('에러났을때 처리하는 부분', error);
		res.send({msg: '알수없는 에러 실패'});
	} finally {
		con.release();
	}
});


router.get('/info', async function(req, res) {
	let decode = req.decode;

	res.send({msg: '조회 성공', info: {
		id: decode.id,
		name: decode.name,
		userType: decode.userType
	}})
});

module.exports = router;
