'use strict';

class Builder {
	constructor() {

	}

	/*
	* userDirectory = 학번 또는 교번
	* taskDirectory = 과제 아이디 이름의 폴더
	* fileName = 컴파일 할 파일 명
	* code = 실제 코드 내용
	*/
	studentInit = (userDirectory, taskDirectory, fileName, code) => {
		try {
			if(!fs.existsSync(userDirectory)) 
				fs.mkdirSync(userDirectory, {
					recursive: true,
					mode: 0o777
				});

			if(!fs.existsSync(taskDirectory)) 
				fs.mkdirSync(taskDirectory, {
					recursive: true,
					mode: 0o777
				});

			// Input.c, c++, java 존재하면 삭제
			if(fs.existsSync(taskDirectory+ '/' + fileName)) 
				fs.unlinkSync(taskDirectory + '/' + fileName);

			fs.writeFileSync(taskDirectory + '/' + fileName, code, {
				encoding: 'utf8',
				mode: 0o777,
				flag: 'w'
			});

			return taskDirectory + '/' + fileName;
		} catch(err) {
			console.log('파일 생성 에러', err);
		}

		return '';
	}

	java_compile = async (directory) => {
		var spw = child.spawn('bin/jdk1.8.0_241/bin/javac', [
			directory
		]);
		
		return new Promise(function(resolve, reject) {
			spw.stdout.on('data', function(out) {
				console.log('compile out', out.toString('utf8'));
			});

			spw.stderr.on('data', function(err) {
				console.log('compile err', err.toString('utf8'));
				// console.log('err', err.toString('ascii'));
			});
			
			spw.on('exit', (code) => {
				console.log('Compile Success ' + code);
				resolve(code);
			});
		});
	}

	java_excute = (execPath, className) => {
		var spw = child.spawn('bin/jdk1.8.0_241/bin/java', [
			'-cp',
			execPath,
			className
		]);

		return new Promise(function(resolve, reject) {
			spw.stdout.on('data', function(out) {
				console.log('excute out', out.toString('utf8'));
			});
			spw.stderr.on('data', function(err) {
				console.log('excute err', err.toString('utf8')); //err.toString('ascii'));
			});
	
			spw.on('exit', (code) => {
				console.log('Excute Success', code);
				resolve(code);
			});
		});
	}
	
	c_compile = async (output, input) => {
		var spw = child.spawn('g++', [
			'-o',
			output,
			'-g',
			input,
			'-std=c++11'
		]);


		return new Promise(function(resolve, reject) {
			spw.stdout.on('data', function(out) {
				console.log('compile out', out.toString('utf8'));
			});

			spw.stderr.on('data', function(err) {
				// console.log('err', err);
				console.log('compile err', err.toString('utf8'));
			});
			
			spw.on('exit', (code) => {
				console.log('Compile Success ' + code);
				resolve(code);
			});
		});
	}

	c_excute = (execPath) => {
		var spw = child.spawn(execPath, []);

		return new Promise(function(resolve, reject) {
			spw.stdout.on('data', function(out) {
				console.log('excute out', out.toString('utf8'));
			});
			spw.stderr.on('data', function(err) {
				console.log('excute err', err.toString('utf8')); //err.toString('ascii'));
			});
			spw.on('exit', (code) => {
				console.log('Excute Success', code);
				resolve(code);
			});
		});
	}

	
}

const builder = new Builder();

module.exports = builder;