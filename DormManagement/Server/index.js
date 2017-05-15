var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var path = require('path');
var utils = require('./utils.js');
var mysql = require('mysql');
var crypto = require('crypto');

var app = express();

app.use(express.static(path.join(__dirname, '../Front')));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
            res.send( {isSuccess: false} );
        }

        var sqlQuery = connection.query(userQuerySql, userQuerySql_Params, function(err, result) {
            if (err) {
                console.log(err);
                connection.release();
                res.send( {isSuccess: false} );
            }
          
            if (result.length > 0) {
                res.send( {isSuccess: true} );
            } else {
                res.send( {isSuccess: false} );
            }
        });
    })

});

app.listen(4000, function(req, res) {
    console.log('app is running at port 3000.');
});