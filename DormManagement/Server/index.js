var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var path = require('path');
var utils = require('./utils.js');
var mysql = require('mysql');
var crypto = require('crypto');
var fs = require('fs');
var busboy = require('connect-busboy');

var app = express();

app.use(express.static(path.join(__dirname, '../Front')));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(busboy());

app.use(session({
    secret: 'tinyheart',
    name: 'DormManagement',
    cookie: { maxAge: 1000 * 60 * 30 },
    resave: true,
    rolling: true,
    saveUninitialized: true
}));

app.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

var sqlPool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dms'
});

app.get('/', utils.checkLogin);

app.get('/', function(req, res) {
    res.render('views/index.html');
});

app.post('/login', function(req, res) {

	var username = req.body.username,
		password = req.body.password;

    var md5 = crypto.createHash('md5'),
        md5password = md5.update(password).digest('hex');

	var userQuerySql = "SELECT * FROM user WHERE username=? and password=?",
		userQuerySql_Params = [username, md5password];

    sqlPool.getConnection(function(err, connection) {
        if (err) {
            console.log(err);
            res.send( {isConnect: false, isSuccess: false} );
        }

        var sqlQuery = connection.query(userQuerySql, userQuerySql_Params, function(err, result) {
            if (err) {
                console.log(err);
                connection.release();
                res.send( {isSuccess: false} );
            }
          
            if (result.length > 0) {
                console.log('登录成功！');
                req.session.user = username;
                res.send( {isConnect: true, isSuccess: true} );
            } else {
                console.log('登录失败！');
                res.send( {isConnect: true, isSuccess: false} );
            }
        });
    })

});

app.get('/getBedInfoTemplate', function(req, res) {
    var fileName = 'template.xlsx',
        filePath = path.join(__dirname, 'download/' + fileName);
        console.log(filePath);
        try {
            var stats = fs.statSync(filePath);
            if (stats.isFile()) {
                res.setHeader('Content-Type', 'application/octet-stream');
                res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
                res.setHeader('Content-Length', stats.size);
                fs.createReadStream(filePath).pipe(res);
            } else {
                res.end(404);
            }
        } catch(e) {
            console.log(e)
            res.end(404);
        }
});

app.post('/uploadBedInfo', function(req, res) {
    console.log('get the request')
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function(fieldName, file, fileName) {
        console.log('Uploading:' + fileName);

        var filePath = path.join(__dirname, 'upload/' + fileName),
            targetPath = path.join(__dirname, 'upload/bedInfo.xlsx');
        fstream = fs.createWriteStream(filePath);

        // 文件不存在，新建
        if (fs.existsSync(filePath) == false) {
            fs.mkdirSync(filePath);
        }

        file.pipe(fstream);
        fstream.on('close', function() {
            console.log('上传完毕');
            fs.renameSync(filePath, targetPath, function(err, data) {
                res.redirect('views/bedInfo.html');              
            });
            res.redirect('views/bedInfo.html');
        })
    })
});


app.listen(4000, function(req, res) {
    console.log('app is running at port 4000.');
});