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
var xlsx = require('xlsx');
var log = require('./log.js');
var async = require('async');
var logPath = path.join(__dirname, 'dms.log');

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
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function(fieldName, file, fileName) {
        console.log('Uploading:' + fileName);

        // var filePath = path.join(__dirname, 'upload/' + fileName),
        var targetPath = path.join(__dirname, 'upload/bedInfo.xlsx');
       
        fstream = fs.createWriteStream(targetPath);

        // 文件不存在，新建
        // if (fs.existsSync(filePath) == false) {
        //     fs.mkdirSync(filePath);
        // }

        // if (fs.existsSync(targetPath) == true) {
        //     fs.unlinkSync(targetPath);
        // } 

        file.pipe(fstream);
        fstream.on('close', function() {
            console.log('上传完毕');
            // fs.renameSync(filePath, targetPath, function(err, data) {
            //     if (err) {
            //         console.log(err);
            //         // TODO: LOG
            //     } else {
            //         console.log('not err');
            //         res.redirect('views/bedInfo.html');  
            //     }   
            // });
            
            // 清空日志
            log.delete(logPath);

            updateBedInfoByExcel(targetPath).then(function() {
                res.redirect('views/bedInfo.html');
            });
            
        })
    })
});

app.post('/getBedInfo', function(req, res) {
	var bedInfoQuerySql = "SELECT * FROM bed WHERE deleteBit=?",
		bedInfoQuerySql_Params = [0];

    sqlPool.getConnection(function(err, connection) {
        if (err) {
            console.log(err);
            res.send( {isConnect: false, isSuccess: false} );
        }

        var sqlQuery = connection.query(bedInfoQuerySql, bedInfoQuerySql_Params, function(err, result) {
            if (err) {
                console.log(err);
                connection.release();
                res.send( {isConnect: true, isSuccess: false} );
            }
            
            res.send( {isConnect: true, isSuccess: true, bedInfos: result} );

        });
    })    
});

function updateBedInfoByExcel(filePath) {
    // 一条条读，读一条，验证成功以对象形式加入数组；一旦有一条不成功，清空数组，写入Log；
    
    // excel表格中全部读完后再修改数据库

    // 如果已经存在记录（buildingNo+roomNo+bedNo），则删除后插入
    // 如果没有，则新增
    // 返回promise，完毕后执行
    return new Promise(function(resolve, reject) {
        var bedInfoArr = [];

        var flag = true;

        var recordCount = 1;

        // utils.parseExcel(filePath).forEach(function(bedInfoObj) {
        //     if (validateBedInfo(bedInfoObj)) {
        //         bedInfoArr.push(bedInfoObj);
        //     }
        // }, function(err) {

        // });
        async.each(utils.parseExcel(filePath), function(bedInfoObj, callback) {
            if (validateBedInfo(bedInfoObj, recordCount)) {
                bedInfoArr.push(bedInfoObj);
            } else {
                flag = false;
            }
            recordCount++;
        }, function(err) {
            if (err) {
                console.log(err);
            } else {
                if (flag) {
                    // 插入数据库

                }
                // 记得看有没有异步
                resolve();
            }
        })


    })
}

function validateBedInfo(bedInfoObj, recordCount) {
    var flag = true;

    // 检测是否楼号为空
    if (bedInfoObj['buildingNo'] == undefined) {
        log.write(logPath, "第" + recordCount + "条记录缺少楼号。");
        flag = false;
    }

    // 检测是否宿舍号为空
    if (bedInfoObj['roomNo'] == undefined) {
        log.write(logPath, "第" + recordCount + "条记录缺少宿舍号。");
        flag = false;
    } else {
        // 根据不同楼号检测宿舍号的有效性
        // 5号楼：4位数字；13号楼：F+4位数字；14号楼：E+4位数字
        if (bedInfoObj['buildingNo'] != undefined) {
            var re;
            switch(bedInfoObj['buildingNo']) {
                case 5:
                    re = /^\d{4}$/;
                    break;
                case 13:
                    re = /^F\d{4}$/;
                    break;
                case 14:
                    re = /^E\d{4}$/;              
                    break;
            }

            if (!re.test(bedInfoObj['roomNo'])) {
                log.write(logPath, "第" + recordCount + "条记录宿舍号格式错误。");
                flag = false;                     
            }
        }
    }

    if (bedInfoObj['bedNo'] == undefined) {
        log.write(logPath, "第" + recordCount + "条记录缺少床位遍号。");
        flag = false;
    }

    if (bedInfoObj['sex'] == undefined) {
        log.write(logPath, "第" + recordCount + "条记录缺少性别信息。");
        flag = false;
    }

    if (bedInfoObj['status'] == undefined) {
        log.write(logPath, "第" + recordCount + "条记录缺少状态信息。");
        flag = false;
    }   

    if (bedInfoObj['status'] == '已分配' || bedInfoObj['status'] == '已入住') {
        if (bedInfoObj['studentNo'] == undefined) {
            log.write(logPath, "第" + recordCount + "条记录缺少学生学号。");
            flag = false;
        } else {
            var re = /^\d{10}$/;
            if (!re.test(bedInfoObj['studentNo'])) {
                log.write(logPath, "第" + recordCount + "条记录学生学号格式错误。");
                flag = false;
            }
        }
        if (bedInfoObj['studentName'] == undefined) {
            log.write(logPath, "第" + recordCount + "条记录缺少学生姓名。");
            flag = false;
        }
    }
    
    return flag;
}

app.listen(4000, function(req, res) {
    console.log('app is running at port 4000.');
});