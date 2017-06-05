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
var https = require('https');
var logPath_bed = path.join(__dirname, 'dms_bed.log');
var logPath_dorm = path.join(__dirname, 'dms_dorm.log');
var logPath_student = path.join(__dirname, 'dms_student.log');

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

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

app.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

var sqlPool = mysql.createPool({
    connectionLimit: 20,
    host: 'localhost',
    user: 'root',
    password: 'caloline',
    database: 'dms'
});

app.get('/', function(req, res) {
    res.redirect('views/index.html');
});

app.post('/checkLogin', function(req, res) {
    if (!req.session.user) {
        console.log('未登录！');
        res.send( {isSuccess: false} );
    } else {
        res.send( {isSuccess: true} );
    }
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
            connection.release();

            if (err) {
                console.log(err);
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

app.get('/getTemplate/:_info', function(req, res) {
    var fileName = 'DormTemplate.xlsx';

    switch(req.params._info) {
        case 'dormInfo':
            fileName = 'DormTemplate.xlsx';
            break;
        case 'bedInfo':
            fileName = 'BedTemplate.xlsx';
            break;
        case 'studentInfo':
            fileName = 'StudentTemplate.xlsx';
            break;
    }

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

        var targetPath = path.join(__dirname, 'upload/bedInfo.xlsx');
       
        fstream = fs.createWriteStream(targetPath);

        file.pipe(fstream);
        fstream.on('close', function() {
            console.log('上传完毕');
            
            // 清空日志
            log.delete(logPath_bed);

            updateBedInfoByExcel(targetPath).then(function() {
                res.redirect('views/bedInfo.html');
            });
            
        })
    })
});

app.post('/uploadDormInfo', function(req, res) {
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function(fieldName, file, fileName) {
        console.log('Uploading:' + fileName);

        var targetPath = path.join(__dirname, 'upload/dormInfo.xlsx');
       
        fstream = fs.createWriteStream(targetPath);

        file.pipe(fstream);
        fstream.on('close', function() {
            console.log('上传完毕');
            
            // 清空日志
            log.delete(logPath_dorm);

            updateDormInfoByExcel(targetPath).then(function() {
                res.redirect('views/dormInfo.html');
            });
            
        })
    })
});

app.post('/uploadStudentInfo', function(req, res) {
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function(fieldName, file, fileName) {
        console.log('Uploading:' + fileName);

        var targetPath = path.join(__dirname, 'upload/studentInfo.xlsx');
       
        fstream = fs.createWriteStream(targetPath);

        file.pipe(fstream);
        fstream.on('close', function() {
            console.log('上传完毕');
            
            // 清空日志
            log.delete(logPath_dorm);

            updateStudentInfoByExcel(targetPath).then(function() {
                res.redirect('views/studentList.html');
            });
            
        })
    })
});

app.post('/getBedInfo', function(req, res) {
	var bedInfoQuerySql = "SELECT * FROM bed WHERE deleteBit=? ORDER BY buildingNo, roomNo, bedNo",
		bedInfoQuerySql_Params = [0];

    sqlPool.getConnection(function(err, connection) {
        if (err) {
            console.log(err);
            res.send( {isConnect: false, isSuccess: false} );
        }

        var sqlQuery = connection.query(bedInfoQuerySql, bedInfoQuerySql_Params, function(err, result) {
            connection.release();

            if (err) {
                console.log(err);
                res.send( {isConnect: true, isSuccess: false} );
            }
            
            res.send( {isConnect: true, isSuccess: true, bedInfos: result} );

        });
    })    
});

app.post('/getDormInfo', function(req, res) {
	var dormInfoQuerySql = "SELECT * FROM dorm WHERE deleteBit=? ORDER BY buildingNo, roomNo",
		dormInfoQuerySql_Params = [0];

    sqlPool.getConnection(function(err, connection) {
        if (err) {
            console.log(err);
            res.send( {isConnect: false, isSuccess: false} );
        }

        var sqlQuery = connection.query(dormInfoQuerySql, dormInfoQuerySql_Params, function(err, result) {
            connection.release();

            if (err) {
                console.log(err);
                res.send( {isConnect: true, isSuccess: false} );
            }

            res.send( {isConnect: true, isSuccess: true, dormInfos: result} );

        });
    })    
});


app.post('/getStudentInfos', function(req, res) {
	var studentInfoQuerySql = "SELECT * FROM student WHERE deleteBit=? ORDER BY studentNo",
		studentInfoQuerySql_Params = [0];

    sqlPool.getConnection(function(err, connection) {
        if (err) {
            console.log(err);
            res.send( {isConnect: false, isSuccess: false} );
        }

        var sqlQuery = connection.query(studentInfoQuerySql, studentInfoQuerySql_Params, function(err, result) {
            connection.release();

            if (err) {
                console.log(err);
                res.send( {isConnect: true, isSuccess: false} );
            }

            res.send( {isConnect: true, isSuccess: true, studentInfos: result} );

        });
    })    
});

app.post('/getErrorMsg', function(req, res) {
    var from = req.body.from,
        logPath;

    switch(from) {
        case 'bed':
            logPath = logPath_bed; 
            break;
        case 'dorm':
            logPath = logPath_dorm;
            break;
        case 'student':
            logPath = logPath_student;
            break;
    }

    console.log(logPath)
    if (log.hasContent(logPath)) {
        res.send({ hasContent: true, errorMsg: log.read(logPath)});
    } else {
        res.send({ hasContent: false });
    }
});

app.post('/logout', function(req, res) {
    delete req.session.user;
    res.send({ isSuccess: true });
});

app.post('/checkin', function(req, res) {
    var buildingNo = req.body.buildingNo,
        roomNo = req.body.roomNo,
        bedNo = req.body.bedNo;

    var bedInfoQuerySql = "SELECT * FROM bed WHERE buildingNo=? AND roomNo=? AND bedNo=?",
        bedInfoQuerySql_Params = [buildingNo, roomNo, bedNo];

    sqlPool.getConnection(function(err, connection) {
        if (err) {
            console.log(err);
            res.send( {isConnect: false, isSuccess: false} );
        }

        var sqlQuery = connection.query(bedInfoQuerySql, bedInfoQuerySql_Params, function(err, result) {
            connection.release();

            if (err) {
                console.log(err);
                res.send( {isConnect: true, isSuccess: false} );
            }
        
            if (result.length > 0) {
                var bedInfoObj = result[0];

                if (bedInfoObj['status'] != 1) {
                    if (bedInfoObj['status'] == 0) {
                        res.send( {isConnect: true, isSuccess: false, errorMsg: '未分配学生不可办理入住！'} );
                    } else if (bedInfoObj['status'] == 2) {
                        res.send( {isConnect: true, isSuccess: false, errorMsg: '该床位已有同学入住！'} );
                    }
                } else if (bedInfoObj['studentNo'] == undefined || bedInfoObj['studentName'] == undefined){
                    res.send( {isConnect: true, isSuccess: false, errorMsg: '分配学生信息不完整！请重新分配。'} );
                } else {
                    var bedInfoUpdateSql = "UPDATE bed SET status=? WHERE buildingNo=? AND roomNo=? AND bedNo=?",
                        bedInfoUpdateSql_Params = [2, bedInfoObj['buildingNo'], bedInfoObj['roomNo'], bedInfoObj['bedNo']];

                    sqlPool.getConnection(function(err, connection) {
                        if (err) {
                            console.log(err);
                            res.send( {isConnect: false, isSuccess: false} );
                        }

                        var sqlQuery = connection.query(bedInfoUpdateSql, bedInfoUpdateSql_Params, function(err, result) {
                            connection.release();

                            if (err) {
                                console.log(err);
                                res.send( {isConnect: true, isSuccess: false} );
                            }
                            
                            res.send( {isConnect: true, isSuccess: true} );

                        });
                    });
                }
            } else {
                res.send( {isConnect: true, isSuccess: false, errorMsg: '床位信息错误，请检查楼号、宿舍号、床号。'} );
            }
        });
    });    
});

app.post('/checkout', function(req, res) {
    var buildingNo = req.body.buildingNo,
        roomNo = req.body.roomNo,
        bedNo = req.body.bedNo;

    var bedInfoQuerySql = "SELECT * FROM bed WHERE buildingNo=? AND roomNo=? AND bedNo=?",
        bedInfoQuerySql_Params = [buildingNo, roomNo, bedNo];

    sqlPool.getConnection(function(err, connection) {
        if (err) {
            console.log(err);
            res.send( {isConnect: false, isSuccess: false} );
        }

        var sqlQuery = connection.query(bedInfoQuerySql, bedInfoQuerySql_Params, function(err, result) {
            connection.release();

            if (err) {
                console.log(err);
                res.send( {isConnect: true, isSuccess: false} );
            }
        
            if (result.length > 0) {
                var bedInfoObj = result[0];

                if (bedInfoObj['status'] == 0) {
                    res.send( {isConnect: true, isSuccess: false, errorMsg: '未分配学生不可办理退宿！'} );
                } else if (bedInfoObj['studentNo'] == undefined || bedInfoObj['studentName'] == undefined){
                    res.send( {isConnect: true, isSuccess: false, errorMsg: '分配学生信息不完整！请先重新分配。'} );
                } else {
                    var bedInfoUpdateSql = "UPDATE bed SET status=?, studentNo=?, studentName=? WHERE buildingNo=? AND roomNo=? AND bedNo=?",
                        bedInfoUpdateSql_Params = [0, null, null, bedInfoObj['buildingNo'], bedInfoObj['roomNo'], bedInfoObj['bedNo']];

                    sqlPool.getConnection(function(err, connection) {
                        if (err) {
                            console.log(err);
                            res.send( {isConnect: false, isSuccess: false} );
                        }

                        var sqlQuery = connection.query(bedInfoUpdateSql, bedInfoUpdateSql_Params, function(err, result) {
                            connection.release();

                            if (err) {
                                console.log(err);
                                res.send( {isConnect: true, isSuccess: false} );
                            }
                            
                            res.send( {isConnect: true, isSuccess: true} );

                        });
                    });
                }
            } else {
                res.send( {isConnect: true, isSuccess: false, errorMsg: '床位信息错误，请检查楼号、宿舍号、床号。'} );
            }
        });
    });    
});

app.post('/usable',  function(req, res) {
    var buildingNo = req.body.buildingNo,
        roomNo = req.body.roomNo,
        bedNo = req.body.bedNo;

    var bedInfoQuerySql = "SELECT * FROM bed WHERE buildingNo=? AND roomNo=? AND bedNo=?",
        bedInfoQuerySql_Params = [buildingNo, roomNo, bedNo];

    sqlPool.getConnection(function(err, connection) {
        if (err) {
            console.log(err);
            res.send( {isConnect: false, isSuccess: false} );
        }

        var sqlQuery = connection.query(bedInfoQuerySql, bedInfoQuerySql_Params, function(err, result) {
            connection.release();
            if (err) {
                console.log(err);
                res.send( {isConnect: true, isSuccess: false} );
            }
        
            if (result.length > 0) {
                var bedInfoObj = result[0];

                var bedInfoUpdateSql = "UPDATE bed SET usable=? WHERE buildingNo=? AND roomNo=? AND bedNo=?",
                    bedInfoUpdateSql_Params = [bedInfoObj['usable'] ^ 1, bedInfoObj['buildingNo'], bedInfoObj['roomNo'], bedInfoObj['bedNo']];

                sqlPool.getConnection(function(err, connection) {
                    if (err) {
                        console.log(err);
                        res.send( {isConnect: false, isSuccess: false} );
                    }

                    var sqlQuery = connection.query(bedInfoUpdateSql, bedInfoUpdateSql_Params, function(err, result) {
                        connection.release();
                        if (err) {
                            console.log(err);
                            res.send( {isConnect: true, isSuccess: false} );
                        }
                        
                        res.send( {isConnect: true, isSuccess: true} );

                    });
                });
              
            } else {
                res.send( {isConnect: true, isSuccess: false, errorMsg: '床位信息错误，请检查楼号、宿舍号、床号。'} );
            }
        });
    });      
});

app.post('/distribute', function(req, res) {
    var buildingNo = req.body.buildingNo,
        roomNo = req.body.roomNo,
        bedNo = req.body.bedNo,
        studentName = req.body.studentName,
        studentNo = req.body.studentNo;

    var bedInfoQuerySql = "SELECT * FROM bed WHERE buildingNo=? AND roomNo=? AND bedNo=?",
        bedInfoQuerySql_Params = [buildingNo, roomNo, bedNo];

    sqlPool.getConnection(function(err, connection) {
        if (err) {
            console.log(err);
            res.send( {isConnect: false, isSuccess: false} );
        }

        var sqlQuery = connection.query(bedInfoQuerySql, bedInfoQuerySql_Params, function(err, result) {
            connection.release();  
            if (err) {
                console.log(err);
                res.send( {isConnect: true, isSuccess: false} );
            }
        
            if (result.length > 0) {
                var bedInfoObj = result[0];

                if (bedInfoObj['status'] != 0) {
                    res.send( {isConnect: true, isSuccess: false, errorMsg: '只有空床状态才可以分配学生！'} );
                }

                var bedInfoUpdateSql = "UPDATE bed SET status=?, studentNo=?, studentName=? WHERE buildingNo=? AND roomNo=? AND bedNo=?",
                    bedInfoUpdateSql_Params = [1, studentNo, studentName, bedInfoObj['buildingNo'], bedInfoObj['roomNo'], bedInfoObj['bedNo']];

                sqlPool.getConnection(function(err, connection) {
                    

                    if (err) {
                        console.log(err);
                        res.send( {isConnect: false, isSuccess: false} );
                    }

                    var sqlQuery = connection.query(bedInfoUpdateSql, bedInfoUpdateSql_Params, function(err, result) {
                        connection.release();
                        if (err) {
                            console.log(err);
                            res.send( {isConnect: true, isSuccess: false} );
                        }
                        
                        res.send( {isConnect: true, isSuccess: true} );

                    });
                });
              
            } else {
                res.send( {isConnect: true, isSuccess: false, errorMsg: '床位信息错误，请检查楼号、宿舍号、床号。'} );
            }
        });
    });  
});

app.post('/addDorm', function(req, res) {
    var buildingNo = req.body.buildingNo,
        roomNo = req.body.roomNo;

    var dormInfoQuerySql = "SELECT * FROM dorm WHERE buildingNo=? AND roomNo=?",
        dormInfoQuerySql_Params = [buildingNo, roomNo];

    sqlPool.getConnection(function(err, connection) {
        if (err) {
            console.log(err);
            res.send( {isConnect: false, isSuccess: false} );
        }

        var sqlQuery = connection.query(dormInfoQuerySql, dormInfoQuerySql_Params, function(err, result) {
            connection.release();
            if (err) {
                console.log(err);
                res.send( {isConnect: true, isSuccess: false} );
            }
            if (result.length == 0) {

                var dormInfoInsertSql = "INSERT INTO dorm(buildingNo, roomNo) VALUES(?, ?)",
                    dormInfoInsertSql_Params = [buildingNo, roomNo];

                sqlPool.getConnection(function(err, connection) {
                    if (err) {
                        console.log(err);
                        res.send( {isConnect: false, isSuccess: false} );
                    }

                    var sqlQuery = connection.query(dormInfoInsertSql, dormInfoInsertSql_Params, function(err, result) {
                        connection.release();
                        if (err) {
                            console.log(err);
                            res.send( {isConnect: true, isSuccess: false} );
                        }
                        
                        res.send( {isConnect: true, isSuccess: true} );

                    });
                });
              
            } else {
                var dormInfoObj = result[0];
                if (dormInfoObj['deleteBit'] == 0) {
                    res.send( {isConnect: true, isSuccess: false, errorMsg: '已存在该宿舍信息。'} );
                } else {
                    var dormInfoDeleteSql = "UPDATE dorm SET deleteBit=? WHERE buildingNo=? AND roomNo=?",
                        dormInfoDeleteSql_Params = [0, dormInfoObj['buildingNo'], dormInfoObj['roomNo']];

                    sqlPool.getConnection(function(err, connection) {
                        if (err) {
                            console.log(err);
                            res.send( {isConnect: false, isSuccess: false} );
                        }

                        var sqlQuery = connection.query(dormInfoDeleteSql, dormInfoDeleteSql_Params, function(err, result) {
                            connection.release();
                            if (err) {
                                console.log(err);
                                res.send( {isConnect: true, isSuccess: false} );
                            }
                            
                            res.send( {isConnect: true, isSuccess: true} );

                        });
                    });                   
                }
                
            }
        });
    });  
});

app.post('/addStudent', function(req, res) {
    var studentNo = req.body.studentNo,
        studentName = req.body.studentName;

    var studentInfoQuerySql = "SELECT * FROM student WHERE studentNo=?",
        studentInfoQuerySql_Params = [studentNo];

    sqlPool.getConnection(function(err, connection) {
        if (err) {
            console.log(err);
            res.send( {isConnect: false, isSuccess: false} );
        }

        var sqlQuery = connection.query(studentInfoQuerySql, studentInfoQuerySql_Params, function(err, result) {
            connection.release();
            if (err) {
                console.log(err);
                res.send( {isConnect: true, isSuccess: false} );
            }
            if (result.length == 0) {

                var studentInfoInsertSql = "INSERT INTO student(studentNo, studentName, code) VALUES(?, ?, ?)",
                    studentInfoInsertSql_Params = [studentNo, studentName, Math.random().toString(36).substr(2).substr(0, 7)];

                sqlPool.getConnection(function(err, connection) {
                    if (err) {
                        console.log(err);
                        res.send( {isConnect: false, isSuccess: false} );
                    }

                    var sqlQuery = connection.query(studentInfoInsertSql, studentInfoInsertSql_Params, function(err, result) {
                        connection.release();
                        if (err) {
                            console.log(err);
                            res.send( {isConnect: true, isSuccess: false} );
                        }
                        
                        res.send( {isConnect: true, isSuccess: true} );

                    });
                });
              
            } else {
                var studentInfoObj = result[0];
                if (studentInfoObj['deleteBit'] == 0) {
                    res.send( {isConnect: true, isSuccess: false, errorMsg: '已存在该学号信息。'} );
                } else {
                    var studentInfoUpdateSql = "UPDATE student SET deleteBit=?, studentName=? WHERE studentNo=?",
                        studentInfoUpdateSql_Params = [0, studentName, studentNo];

                    sqlPool.getConnection(function(err, connection) {
                        if (err) {
                            console.log(err);
                            res.send( {isConnect: false, isSuccess: false} );
                        }

                        var sqlQuery = connection.query(studentInfoUpdateSql, studentInfoUpdateSql_Params, function(err, result) {
                            connection.release();
                            if (err) {
                                console.log(err);
                                res.send( {isConnect: true, isSuccess: false} );
                            }
                            
                            res.send( {isConnect: true, isSuccess: true} );

                        });
                    });                   
                }              
            }
        });
    });  
});

app.post('/deleteDorm', function(req, res) {
    var buildingNo = req.body.buildingNo,
        roomNo = req.body.roomNo;

    var dormInfoQuerySql = "SELECT * FROM dorm WHERE buildingNo=? AND roomNo=? AND deleteBit=?",
        dormInfoQuerySql_Params = [buildingNo, roomNo, 0];

    sqlPool.getConnection(function(err, connection) {
        if (err) {
            console.log(err);
            res.send( {isConnect: false, isSuccess: false} );
        }

        var sqlQuery = connection.query(dormInfoQuerySql, dormInfoQuerySql_Params, function(err, result) {
            connection.release();
            if (err) {
                console.log(err);
                res.send( {isConnect: true, isSuccess: false} );
            }
        
            if (result.length > 0) {

                var dormInfoDeleteSql = "UPDATE dorm SET deleteBit=? WHERE buildingNo=? AND roomNo=?",
                    dormInfoDeleteSql_Params = [1, buildingNo, roomNo];

                sqlPool.getConnection(function(err, connection) {
                    if (err) {
                        console.log(err);
                        res.send( {isConnect: false, isSuccess: false} );
                    }

                    var sqlQuery = connection.query(dormInfoDeleteSql, dormInfoDeleteSql_Params, function(err, result) {
                        connection.release();
                        if (err) {
                            console.log(err);
                            res.send( {isConnect: true, isSuccess: false} );
                        }
                        
                        res.send( {isConnect: true, isSuccess: true} );

                    });
                });
              
            } else {
                res.send( {isConnect: true, isSuccess: false, errorMsg: '不存在该宿舍信息。'} );
            }
        });
    });  
});

app.post('/deleteStudent', function(req, res) {
    var studentNo = req.body.studentNo,
        studentName = req.body.studentName;

    var studentInfoQuerySql = "SELECT * FROM student WHERE studentNo=? AND deleteBit=?",
        studentInfoQuerySql_Params = [studentNo, 0];

    sqlPool.getConnection(function(err, connection) {
        if (err) {
            console.log(err);
            res.send( {isConnect: false, isSuccess: false} );
        }

        var sqlQuery = connection.query(studentInfoQuerySql, studentInfoQuerySql_Params, function(err, result) {
            connection.release();
            if (err) {
                console.log(err);
                res.send( {isConnect: true, isSuccess: false} );
            }
        
            if (result.length > 0) {

                var studentInfoDeleteSql = "UPDATE student SET deleteBit=? WHERE studentNo=?",
                    studentInfoDeleteSql_Params = [1, studentNo];

                sqlPool.getConnection(function(err, connection) {
                    if (err) {
                        console.log(err);
                        res.send( {isConnect: false, isSuccess: false} );
                    }

                    var sqlQuery = connection.query(studentInfoDeleteSql, studentInfoDeleteSql_Params, function(err, result) {
                        connection.release();
                        if (err) {
                            console.log(err);
                            res.send( {isConnect: true, isSuccess: false} );
                        }
                        
                        res.send( {isConnect: true, isSuccess: true} );

                    });
                });
              
            } else {
                res.send( {isConnect: true, isSuccess: false, errorMsg: '不存在该学号信息。'} );
            }
        });
    });  
});

app.post('/checkDormInfo', function(req, res) {
    var dormInfoQuerySql = "SELECT * FROM dorm WHERE deleteBit=?",
        dormInfoQuerySql_Params = [0];

    sqlPool.getConnection(function(err, connection) {
        if (err) {
            console.log(err);
            res.send( {isConnect: false, isSuccess: false} );
        }

        var sqlQuery = connection.query(dormInfoQuerySql, dormInfoQuerySql_Params, function(err, result) {
            connection.release();
            if (err) {
                console.log(err);
                res.send( {isConnect: true, isSuccess: false} );
            }
        
            if (result.length > 0) {
                res.send( {isConnect: true, isSuccess: true} );
              
            } else {
                res.send( {isConnect: true, isSuccess: false} );
            }
        });
    });  
});

app.post('/fetchStudentInfo', function(req, res) {
    var stuid = req.body.stuid;

    var studentInfoQuerySql = "SELECT * FROM student WHERE studentNo=? AND deleteBit=?",
        studentInfoQuerySql_Params = [stuid, 0];

    sqlPool.getConnection(function(err, connection) {
        if (err) {
            console.log(err);
            res.send( {isConnect: false, isSuccess: false} );
        }

        var sqlQuery = connection.query(studentInfoQuerySql, studentInfoQuerySql_Params, function(err, result) {
            connection.release();
            if (err) {
                console.log(err);
                res.send( {isConnect: true, isSuccess: false} );
            }
            
            if (result.length > 0) {
                res.send( {isConnect: true, isSuccess: true, studentInfo: result } );
              
            } else {
                res.send( {isConnect: true, isSuccess: false} );
            }
        });
    });    
});

app.post('/fetchStudentDetail', function(req, res) {
    var stuid = req.body.stuid;
    var TOKEN = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    var responseText = "";

    https.get("https://api.mysspku.com/index.php/V2/Ssbd/getinfo?stuid=" + stuid + "&token=" + TOKEN, (financeRes) => {
        financeRes.on('data', (d) => {
            responseText += d;
        });

        financeRes.on('end', () => {
            var responseObj = JSON.parse(responseText);

            if (responseObj.errcode == 0) {

                if (responseObj.data.financecomplete == 1) {
                    res.send({ isSuccess: true, student: responseObj.data });
                } else {
                    res.send({ isSuccess: false });
                }
            } else {
                if (responseObj.errcode == 40001) {
                    console.log('学生编号不存在。');
                } else if (responseObj.errcode == 40901) {
                    console.log('无效的token。');
                }
                res.send({ isSuccess: false});
            }
        });                                        
    }).on('error', (e) => {
        console.log('here')
        res.send({ isSuccess: false});
        console.error(e);
    });

});

app.post('/checkOpenTime', function(req, res) {
    var timeQuerySql = "SELECT * FROM time",
        timeQuerySql_Params = ["openTime"];

    sqlPool.getConnection(function(err, connection) {
        if (err) {
            console.log(err);
            res.send( {isConnect: false, isSuccess: false} );
        }

        var sqlQuery = connection.query(timeQuerySql, timeQuerySql_Params, function(err, result) {
            connection.release();
            if (err) {
                console.log(err);
                res.send( {isConnect: true, isSuccess: false} );
            }
            
            if (result.length > 0) {
                res.send( {isConnect: true, isSuccess: true, time: result[0] } );
              
            } else {
                res.send( {isConnect: true, isSuccess: false} );
            }
        });
    });     
});

function updateBedInfoByExcel(filePath) {
    // 一条条读，读一条，验证成功以对象形式加入数组；一旦有一条不成功，清空数组，写入Log；
    
    // excel表格中全部读完后再修改数据库

    // 如果已经存在记录（buildingNo+roomNo+bedNo），则删除后插入
    // 如果没有，则新增
    // 返回promise，完毕后执行
    return new Promise(function(resolve, reject) {
        var bedInfoArr = [];

        var resolveFunc = resolve;

        var flag = true;

        var recordCount = 0;
        
        async.each(utils.parseBedExcel(filePath), function(bedInfoObj, callback) {
            recordCount++;
            validateBedInfo(bedInfoObj, recordCount).then(function(validateFlag) {
                console.log(validateFlag);
                if (validateFlag) {
                    bedInfoArr.push(bedInfoObj);
                } else {
                    flag = false;
                }
                
                callback();
            });
        }, function(err) {
            if (err) {
                console.log(err);
            } else {
                // 如果有不合格记录，则全部不更新
                if (flag) {
                    // 插入数据库
                    console.log('通过校验');
                    async.eachSeries(bedInfoArr, function(bedInfoObj, callback) {
                        try {
                            var bedInfoQuerySql = "SELECT * FROM bed WHERE buildingNo=? AND roomNo=? AND bedNo=?",
                                bedInfoQuerySql_Params = [bedInfoObj['buildingNo'], bedInfoObj['roomNo'], bedInfoObj['bedNo']];
                
                            sqlPool.getConnection(function(err, connection) {
                                if (err) {
                                    console.log(err);
                                    callback(err);
                                }

                                var sqlQuery = connection.query(bedInfoQuerySql, bedInfoQuerySql_Params, function(err, result) {
                                    if (err) {
                                        console.log(err);
                                        connection.release();
                                        callback(err);
                                    }
                                
                                    if (result.length > 0) {
                                        // 该床位已有记录，则修改
                                        console.log(bedInfoObj);

                                        var bedInfoUpdateSql = "UPDATE bed SET sex=?, status=?, studentNo=?, studentName=?, deleteBit=? WHERE buildingNo=? AND roomNo=? AND bedNo=?",
                                            bedInfoUpdateSql_Params = [bedInfoObj['sex'], bedInfoObj['status'], bedInfoObj['studentNo'], bedInfoObj['studentName'], 0, bedInfoObj['buildingNo'], bedInfoObj['roomNo'], bedInfoObj['bedNo']];                                    
                                    
                                        sqlPool.getConnection(function(err, connection) {
                                            if (err) {
                                                console.log(err);
                                                callback(err);
                                            }

                                            var sqlQuery = connection.query(bedInfoUpdateSql, bedInfoUpdateSql_Params, function(err, result) {
                                                if (err) {
                                                    console.log(err);
                                                    connection.release();
                                                    callback(err);
                                                }

                                                callback();
                                            })
                                        });
                                        
                                    } else {
                                        console.log(bedInfoObj);
                                        // 没有该床位记录，则插入
                                        var bedInfoInsertSql = "INSERT INTO bed(buildingNo, roomNo, bedNo, sex, status, studentNo, studentName) VALUES(?, ?, ?, ?, ?, ?, ?)",
                                            bedInfoInsertSql_Params = [bedInfoObj['buildingNo'], bedInfoObj['roomNo'], bedInfoObj['bedNo'], bedInfoObj['sex'], bedInfoObj['status'], bedInfoObj['studentNo'], bedInfoObj['studentName']];                                    
                                        
                                        sqlPool.getConnection(function(err, connection) {
                                            if (err) {
                                                console.log(err);
                                                callback(err);
                                            }

                                            var sqlQuery = connection.query(bedInfoInsertSql, bedInfoInsertSql_Params, function(err, result) {
                                                if (err) {
                                                    console.log(err);
                                                    connection.release();
                                                    callback(err);
                                                }

                                                callback();
                                            })
                                        });
                                    }
                                });
                            });

                        } catch(e) {
                            console.log(e);
                        }
                    }, function(err) {
                        if (err) {
                            console.log(err);
                        }
                        resolveFunc();
                    });

                } else {
                    resolveFunc();
                }
            }
        })
    })
}

function updateDormInfoByExcel(filePath) {
    // 一条条读，读一条，验证成功以对象形式加入数组；一旦有一条不成功，清空数组，写入Log；
    
    // excel表格中全部读完后再修改数据库

    // 如果已经存在记录（buildingNo+roomNo+bedNo），则删除后插入
    // 如果没有，则新增
    // 返回promise，完毕后执行
    return new Promise(function(resolve, reject) {
        var dormInfoArr = [];

        var resolveFunc = resolve;

        var flag = true;

        var recordCount = 1;

        async.each(utils.parseDormExcel(filePath), function(dormInfoObj, callback) {
            if (validateDormInfo(dormInfoObj, recordCount)) {
                dormInfoArr.push(dormInfoObj);
            } else {
                flag = false;
            }
            recordCount++;
            callback();
        }, function(err) {
            if (err) {
                console.log(err);
            } else {
                // 如果有不合格记录，则全部不更新
                if (flag) {
                    // 插入数据库
                    async.eachSeries(dormInfoArr, function(dormInfoObj, callback) {
                        try {
                            var dormInfoQuerySql = "SELECT * FROM dorm WHERE buildingNo=? AND roomNo=?",
                                dormInfoQuerySql_Params = [dormInfoObj['buildingNo'], dormInfoObj['roomNo']];

                            console.log(dormInfoObj);

                            sqlPool.getConnection(function(err, connection) {
                                if (err) {
                                    console.log(err);
                                    callback(err);
                                }

                                var sqlQuery = connection.query(dormInfoQuerySql, dormInfoQuerySql_Params, function(err, result) {
                                    if (err) {
                                        console.log(err);
                                        connection.release();
                                        callback(err);
                                    }
                                
                                    if (result.length > 0) {
                                        dormInfoObj = result[0];
                                        if (dormInfoObj['deleteBit'] == 1) {
                                            // 已存在但是被删除了

                                            var dormInfoDeleteSql = "UPDATE dorm SET deleteBit=? WHERE buildingNo=? AND roomNo=?",
                                                dormInfoDeleteSql_Params = [0, dormInfoObj['buildingNo'], dormInfoObj['roomNo']];

                                            sqlPool.getConnection(function(err, connection) {
                                                if (err) {
                                                    console.log(err);
                                                    callback(err);
                                                }

                                                var sqlQuery = connection.query(dormInfoDeleteSql, dormInfoDeleteSql_Params, function(err, result) {
                                                    connection.release();
                                                    if (err) {
                                                        console.log(err);
                                                        callback(err);
                                                    }
                                                    
                                                    callback();
                                                });
                                            });                                          
                                        } else {
                                            console.log('exist');
                                            callback();
                                        }
                                        
                                    } else {
                                        // 没有该床位记录，则插入
                                        var dormInfoInsertSql = "INSERT INTO dorm(buildingNo, roomNo) VALUES(?, ?)",
                                            dormInfoInsertSql_Params = [dormInfoObj['buildingNo'], dormInfoObj['roomNo']];                                    
                                        console.log('not exist')
                                        sqlPool.getConnection(function(err, connection) {
                                            if (err) {
                                                console.log(err);
                                                callback(err);
                                            }

                                            var sqlQuery = connection.query(dormInfoInsertSql, dormInfoInsertSql_Params, function(err, result) {
                                                if (err) {
                                                    console.log(err);
                                                    connection.release();
                                                    callback(err);
                                                }

                                                callback();
                                            })
                                        });
                                    }
                                });
                            });

                        } catch(e) {
                            console.log(e);
                        }
                    }, function(err) {
                        if (err) {
                            console.log(err);
                        }
                        resolveFunc();
                    });

                } else {
                    resolveFunc();
                }
            }
        })
    })
}

function updateStudentInfoByExcel(filePath) {
    // 一条条读，读一条，验证成功以对象形式加入数组；一旦有一条不成功，清空数组，写入Log；
    
    // excel表格中全部读完后再修改数据库

    // 如果已经存在记录（buildingNo+roomNo+bedNo），则删除后插入
    // 如果没有，则新增
    // 返回promise，完毕后执行
    return new Promise(function(resolve, reject) {
        var studentInfoArr = [];

        var resolveFunc = resolve;

        var flag = true;

        var recordCount = 1;

        async.each(utils.parseStudentExcel(filePath), function(studentInfoObj, callback) {
            if (validateStudentInfo(studentInfoObj, recordCount)) {
                studentInfoArr.push(studentInfoObj);
            } else {
                flag = false;
            }
            recordCount++;
            callback();
        }, function(err) {
            if (err) {
                console.log(err);
            } else {
                // 如果有不合格记录，则全部不更新
                if (flag) {
                    // 插入数据库
                    async.eachSeries(studentInfoArr, function(studentInfoObj, callback) {
                        try {
                            var studentInfoQuerySql = "SELECT * FROM student WHERE studentNo=?",
                                studentInfoQuerySql_Params = [studentInfoObj['studentNo']];

                            console.log(studentInfoObj);

                            sqlPool.getConnection(function(err, connection) {
                                if (err) {
                                    console.log(err);
                                    callback(err);
                                }

                                var sqlQuery = connection.query(studentInfoQuerySql, studentInfoQuerySql_Params, function(err, result) {
                                    if (err) {
                                        console.log(err);
                                        connection.release();
                                        callback(err);
                                    }
                                
                                    if (result.length > 0) {
                                        var studentInfoResultObj = result[0];
                                        if (studentInfoResultObj['deleteBit'] == 1) {
                                            // 已存在但是被删除了，则修改deleteBit和更新studentName

                                            var studentInfoUpdateSql = "UPDATE student SET deleteBit=?, studentName=? WHERE studentNo=?",
                                                studentInfoUpdateSql_Params = [0, studentInfoObj['studentName'], studentInfoObj['studentNo']];

                                            sqlPool.getConnection(function(err, connection) {
                                                if (err) {
                                                    console.log(err);
                                                    callback(err);
                                                }

                                                var sqlQuery = connection.query(studentInfoUpdateSql, studentInfoUpdateSql_Params, function(err, result) {
                                                    connection.release();
                                                    if (err) {
                                                        console.log(err);
                                                        callback(err);
                                                    }
                                                    
                                                    callback();
                                                });
                                            });                                          
                                        } else {
                                            console.log(studentInfoObj['studentName'])
                                            var studentInfoUpdateSql = "UPDATE student SET studentName=? WHERE studentNo=?",
                                                studentInfoUpdateSql_Params = [studentInfoObj['studentName'], studentInfoObj['studentNo']];

                                            sqlPool.getConnection(function(err, connection) {
                                                if (err) {
                                                    console.log(err);
                                                    callback(err);
                                                }

                                                var sqlQuery = connection.query(studentInfoUpdateSql, studentInfoUpdateSql_Params, function(err, result) {
                                                    connection.release();
                                                    if (err) {
                                                        console.log(err);
                                                        callback(err);
                                                    }
                                                    
                                                    callback();
                                                });
                                            });  
                                        }
                                        
                                    } else {
                                        // 没有该学生记录，则插入
                                        var studentInfoInsertSql = "INSERT INTO student(studentNo, studentName, code) VALUES(?, ?, ?)",
                                            studentInfoInsertSql_Params = [studentInfoObj['studentNo'], studentInfoObj['studentName'], Math.random().toString(36).substr(2).substr(0, 7)];                                    
                                        console.log('not exist')
                                        sqlPool.getConnection(function(err, connection) {
                                            if (err) {
                                                console.log(err);
                                                callback(err);
                                            }

                                            var sqlQuery = connection.query(studentInfoInsertSql, studentInfoInsertSql_Params, function(err, result) {
                                                if (err) {
                                                    console.log(err);
                                                    connection.release();
                                                    callback(err);
                                                }

                                                callback();
                                            })
                                        });
                                    }
                                });
                            });

                        } catch(e) {
                            console.log(e);
                        }
                    }, function(err) {
                        if (err) {
                            console.log(err);
                        }
                        resolveFunc();
                    });

                } else {
                    resolveFunc();
                }
            }
        })
    })
}

app.post('/validateStudent', function(req, res) {
    var code = req.body.code;

    utils.getAccessToken().then(function(accountInfo) {
        // console.log(accountInfo);

        var responseText = "";

        // 先验证是否进行企业号验证
        https.get("https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token=" + accountInfo.access_token + "&code=" + code, (useridRes) => {

            useridRes.on('data', (d) => {
                responseText += d;
            });

            useridRes.on('end', () => {
                var responseObj = JSON.parse(responseText);
                console.log('verify_qiyi');
                console.log(responseObj)
                // TODO：测试模拟用，记得删除
                responseObj.errcode = undefined;
                responseObj.UserId = "1601210386";

                if (responseObj.errcode != undefined) {
                    res.send({ isSuccess: false });
                } else {
                    var UserId = responseObj.UserId;

                    if (UserId == undefined) {
                        res.send({ isValidate: false});
                    } else {
                        // 验证是否在可选宿舍名单中

                        var studentInfoQuerySql = "SELECT * FROM student WHERE studentNo=? AND deleteBit=?",
                            studentInfoQuerySql_Params = [UserId, 0];

                        sqlPool.getConnection(function(err, connection) {
                            if (err) {
                                console.log(err);
                                res.send( {isConnect: false} );
                            }

                            var sqlQuery = connection.query(studentInfoQuerySql, studentInfoQuerySql_Params, function(err, result) {
                                connection.release();
                                if (err) {
                                    console.log(err);
                                    res.send( {isConnect: false} );
                                }
                                
                                // 在名单之中
                                if (result.length > 0) {
                                    // res.send( {isSuccess: true} );

                                    var TOKEN = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
                                    var responseText = "";

                                    https.get("https://api.mysspku.com/index.php/V2/Ssbd/getinfo?stuid=" + UserId + "&token=" + TOKEN, (financeRes) => {
                                        financeRes.on('data', (d) => {
                                            responseText += d;
                                        });

                                        financeRes.on('end', () => {
                                            var responseObj = JSON.parse(responseText);
                                            console.log(responseObj)
                                            if (responseObj.errcode == 0) {
                                                console.log('not error')
                                                if (responseObj.data.financecomplete == 1) {
                                                    res.send({ isValid: true, stuid: UserId });
                                                } else {
                                                    res.send({ isValid: false });
                                                }
                                            } else {
                                                if (responseObj.errcode == 40001) {
                                                    console.log('学生编号不存在。');
                                                } else if (responseObj.errcode == 40901) {
                                                    console.log('无效的token。');
                                                }
                                                res.send({ isSuccess: false});
                                            }
                                        });                                        
                                    }).on('error', (e) => {
                                        console.log('here')
                                        res.send({ isSuccess: false});
                                        console.error(e);
                                    });;
                                } else {
                                    res.send({ isValid: false });
                                }
                                

                            });
                        });                           
                        // res.send({ isSuccess: true, isValidate: true});
                    }
                }

            });
            
        }).on('error', (e) => {
            res.send({ isSuccess: false});
            console.error(e);
        });
    })
});

// 校验同行人真实性
app.post('/validatePartner', function(req, res) {
    var stuid = req.body.stuid,
        code = req.body.code,
        sex = req.body.sex;

    // 是否已经分配
    var bedInfoQuerySql = "SELECT * FROM bed WHERE studentNo=? AND deleteBit=?",
        bedInfoQuerySql_Params = [stuid, 0];

    sqlPool.getConnection(function(err, connection) {
        if (err) {
            console.log(err);
            res.send(  {errcode: 4001, msg: "数据库连接错误。"} );
        }

        var sqlQuery = connection.query(bedInfoQuerySql, bedInfoQuerySql_Params, function(err, result) {
            connection.release();
            if (err) {
                console.log(err);
                res.send( {errcode: 4001, msg: "数据库连接错误。"} );
            }
        
            if (result.length > 0) {
                res.send(  {errcode: 4003, msg: "添加失败，该同学已办理过住宿"} );       
            } else {
 
                // 校验是否在数据库名单中，及校验码准确性
                var studentQuerySql = "SELECT * FROM student WHERE studentNo=? AND deleteBit=?",
                    studentQuerySql_Params = [stuid, 0];

                sqlPool.getConnection(function(err, connection) {
                    if (err) {
                        console.log(err);
                        res.send(  {errcode: 4001, msg: "数据库连接错误。"} );
                    }

                    var sqlQuery = connection.query(studentQuerySql, studentQuerySql_Params, function(err, result) {
                        connection.release();
                        if (err) {
                            console.log(err);
                            res.send( {errcode: 4001, msg: "数据库连接错误。"} );
                        }
                    
                        if (result.length > 0) {
                            if (result[0].code != code) {
                                res.send(  {errcode: 4004, msg: "添加失败，同住人校验码错误"} );
                            } else {
                                 // 校验是否缴费及性别
                                var TOKEN = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
                                var responseText = "";

                                https.get("https://api.mysspku.com/index.php/V2/Ssbd/getinfo?stuid=" + stuid + "&token=" + TOKEN, (financeRes) => {
                                    financeRes.on('data', (d) => {
                                        responseText += d;
                                    });

                                    financeRes.on('end', () => {
                                        var responseObj = JSON.parse(responseText);
                                        console.log(responseObj)
                                        if (responseObj.errcode == 0) {
                                            if (responseObj.data.financecomplete == 1) {
                                                if (responseObj.data.gender != sex) {
                                                    res.send(  {errcode: 4007, msg: "添加失败，男女不可同住"} );
                                                } else {
                                                    res.send(  {isSuccess: true, studentName: responseObj.data.name} );
                                                }
                                            } else {
                                                res.send(  {errcode: 4004, msg: "添加失败，该同学尚未缴纳住宿费"} );
                                            }
                                        } else {
                                            if (responseObj.errcode == 40001) {
                                                // console.log('学生编号不存在。');
                                                res.send(  {errcode: 4005, msg: "添加失败，该学号不存在" } );
                                            } else if (responseObj.errcode == 40901) {
                                                console.log('无效的token。');
                                                res.send(  {errcode: 4006, msg: "添加失败，请联系管理员" } );
                                            }
                                            
                                        }
                                    });                                        
                                }).on('error', (e) => {
                                    console.error(e);
                                    res.send(  {errcode: 4006, msg: "添加失败，请联系管理员" } );
                                });                            
                            }                        
                        } else {
                            res.send(  {errcode: 4002, msg: "添加失败，该同学没有资格办理住宿"} );
                        }
                    });
                });  

   

            }
        });
    }); 


});

// 获取空房状态
app.post('/getAvailableDormStatus', function(req, res) {
    var sex = req.body.sex;

    var preData = {
        max5: 0, // 以total来记
        max13: 0,
        max14: 0,
        building5: [], // 5号楼，剩余1床位房间1个，剩余2床位房间0个
        building13: [],
        building14: []
    }

    // var preData = {
    //     errcode: 4001,
    //     msg: ""
    // }

    sex == '男' ? sex = 1 : sex = 0;

    var totalBed = [],
        availableBed = [];
    
    var totalBedQuerySql = "SELECT buildingNo, roomNo, count(bedNo) sum FROM bed WHERE sex=? GROUP BY roomNo ORDER BY buildingNo, roomNo",
        totalBedQuerySql_Params = [sex];

    sqlPool.getConnection(function(err, connection) {
        if (err) {
            console.log(err);
            res.send( {errcode: 4001, msg: "数据库连接错误。"} );
        }

        var sqlQuery = connection.query(totalBedQuerySql, totalBedQuerySql_Params, function(err, result) {
            connection.release();
            if (err) {
                console.log(err);
                res.send( {errcode: 4001, msg: "数据库连接错误。"} );
            }
            
            totalBed = result;

            totalBed.forEach(function(elem) {
                switch(elem.buildingNo) {
                    case 5: 
                        if (elem.sum > preData.max5)
                            preData.max5 = elem.sum;
                        break;
                    case 13:
                        if (elem.sum > preData.max13)
                            preData.max13 = elem.sum;
                        break;
                    case 14:
                        if (elem.sum > preData.max14)
                            preData.max14 = elem.sum;
                        break;
                }            
            });

            var availableBedQuerySql = "SELECT buildingNo, roomNo, count(bedNo) available FROM bed WHERE status=? AND usable=? AND sex=? AND roomNo IN (SELECT roomNo FROM dorm) GROUP BY roomNo ORDER BY buildingNo, roomNo",
                availableBedQuerySql_Params = [0, 1, sex];

            sqlPool.getConnection(function(err, connection) {
                if (err) {
                    console.log(err);
                    res.send( {errcode: 4001, msg: "数据库连接错误。"} );
                }

                var sqlQuery = connection.query(availableBedQuerySql, availableBedQuerySql_Params, function(err, result) {
                    connection.release();
                    if (err) {
                        console.log(err);
                        res.send( {errcode: 4001, msg: "数据库连接错误。"} );
                    }
                    
                    availableBed = result;

                    for (var i = 0; i < preData.max5; i++) {
                        preData.building5.push(0);
                    }

                    for (var i = 0; i < preData.max13; i++) {
                        preData.building13.push(0);
                    }
                    
                    for (var i = 0; i < preData.max14; i++) {
                        preData.building14.push(0);
                    }

                    availableBed.forEach(function(elem) {
                        switch(elem.buildingNo) {
                            case 5:
                                preData.building5[elem.available - 1]++;
                                break;
                            case 13:
                                preData.building13[elem.available - 1]++;
                                break;
                            case 14:
                                preData.building14[elem.available - 1]++;
                                break;
                        }
                    });

                    res.send({ isSuccess: true, status: preData})

                });
            });              

        });
    });  
});

app.post('/confirmDistribute', function(req, res) {
    var buildingNo = req.body.buildingNo,
        sex = req.body.sex,
        students = req.body.students;

    console.log(students)

    var availableBedQuerySql = "SELECT buildingNo, roomNo, count(bedNo) available FROM bed WHERE buildingNo=? AND status=? AND usable=? AND sex=? AND roomNo IN (SELECT roomNo FROM dorm) GROUP BY roomNo ORDER BY buildingNo, roomNo",
        availableBedQuerySql_Params = [buildingNo, 0, 1, sex];

    sqlPool.getConnection(function(err, connection) {
        if (err) {
            console.log(err);
            res.send( {errcode: 4001, msg: "数据库连接错误。"} );
        }

        var sqlQuery = connection.query(availableBedQuerySql, availableBedQuerySql_Params, function(err, result) {
            connection.release();
            if (err) {
                console.log(err);
                res.send( {errcode: 4001, msg: "数据库连接错误。"} );
            }
            
            if (result.length > 0) {
                var targetRoomNo = '';

                for (var i = 0; i < result.length; i++) {
                    var elem = result[i];
                    if (elem.available >= students.length)   {
                        // 人数满足要求
                        targetRoomNo = elem.roomNo;
                        break;
                    }
                }

                if (targetRoomNo == '') {
                     res.send( {errcode: 4002, msg: "该宿舍楼已无满足人数条件的宿舍。请选择其他宿舍楼，或重新分配同住人。"} );
                     return;
                }
                
                console.log(targetRoomNo);

                var bedInfoQuerySql = "SELECT * FROM bed WHERE buildingNo=? AND roomNo=? AND usable=? AND status=? AND deleteBit=?",
                    bedInfoQuerySql_Params = [buildingNo, targetRoomNo, 1, 0, 0];

                sqlPool.getConnection(function(err, connection) {
                    if (err) {
                        console.log(err);
                        res.send( {errcode: 4001, msg: "数据库连接错误。"} );
                    }

                    var sqlQuery = connection.query(bedInfoQuerySql, bedInfoQuerySql_Params, function(err, result) {
                        connection.release();
                        if (err) {
                            console.log(err);
                            res.send( {errcode: 4001, msg: "数据库连接错误。"} );
                        }

                        if (result.length < students.length) {
                            res.send( {errcode: 4002, msg: "该宿舍楼已无满足人数条件的宿舍。请选择其他宿舍楼，或重新分配同住人。"} );
                        } else {
                            var beds = result,
                                bedIndex = 0;

                            async.eachSeries(students, function(item, callback) {
                                var bedInfoUpdateSql = "UPDATE bed SET studentNo=?, studentName=?, status=? WHERE buildingNo=? AND roomNo=? AND bedNo=? AND deleteBit=?",
                                    bedInfoUpdateSql_Params = [item.studentNo, item.studentName, 1, buildingNo, targetRoomNo, beds[bedIndex].bedNo, 0];

                                sqlPool.getConnection(function(err, connection) {
                                    if (err) {
                                        callback(err);
                                        console.log(err);
                                    }

                                    var sqlQuery = connection.query(bedInfoUpdateSql, bedInfoUpdateSql_Params, function(err, result) {
                                        connection.release();
                                        if (err) {
                                            callback(err);
                                            console.log(err);                                       
                                        }

                                        bedIndex++;
                                        callback();

                                    });
                                });                                 
                            }, function(err) {
                                if (err) {
                                    console.log(err);
                                    res.send( {errcode: 4003, msg: "分配失败，请重试"} );
                                }

                                res.send( { isSuccess: true} );
                            });
                        }
                    });
                });  

            } else {
                // 没有满足条件的宿舍
                res.send( {errcode: 4002, msg: "该宿舍楼已无满足人数条件的宿舍。请选择其他宿舍楼，或重新分配同住人。"} );
            }

        });
    });        
});

app.post('/checkStudentStatus', function(req, res) {
    var stuid = req.body.stuid;

    var bedInfoQuerySql = "SELECT * FROM bed WHERE studentNo=? AND deleteBit=?",
        bedInfoQuerySql_Params = [stuid, 0];

    sqlPool.getConnection(function(err, connection) {
        if (err) {
            console.log(err);
            res.send( {isConnect: false, isSuccess: false} );
        }

        var sqlQuery = connection.query(bedInfoQuerySql, bedInfoQuerySql_Params, function(err, result) {
            connection.release();
            if (err) {
                console.log(err);
                res.send( {isConnect: true, isSuccess: false} );
            }

            if (result.length > 0) {
                res.send( {isConnect: true, isSuccess: true, dormStatus: result[0] } );
            } else {
                res.send( {isConnect: true, isSuccess: true } );
            }
        });
    });    
});

function validateBedInfo(bedInfoObj, recordCount) {

    return new Promise(function(resolve, reject) {
        var flag = true;

        // 检测是否楼号为空
        if (bedInfoObj['buildingNo'] == undefined) {
            log.write(logPath_bed, "第" + recordCount + "条记录缺少楼号。");
            flag = false;
        }

        // 检测是否宿舍号为空
        if (bedInfoObj['roomNo'] == undefined) {
            log.write(logPath_bed, "第" + recordCount + "条记录缺少宿舍号。");
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
                    log.write(logPath_bed, "第" + recordCount + "条记录宿舍号格式错误。");
                    flag = false;                     
                }
            }
        }

        if (bedInfoObj['bedNo'] == undefined) {
            log.write(logPath_bed, "第" + recordCount + "条记录缺少床位遍号。");
            flag = false;
        }

        if (bedInfoObj['sex'] == undefined) {
            log.write(logPath_bed, "第" + recordCount + "条记录缺少性别信息。");
            flag = false;
        }

        if (bedInfoObj['status'] == undefined) {
            log.write(logPath_bed, "第" + recordCount + "条记录缺少状态信息。");
            flag = false;
        }   

        if (bedInfoObj['status'] == 1 || bedInfoObj['status'] == 2) {
            if (bedInfoObj['studentNo'] == undefined) {
                log.write(logPath_bed, "第" + recordCount + "条记录缺少学生学号。");
                flag = false;
            } else {
                var re = /^\d{10}$/;
                if (!re.test(bedInfoObj['studentNo'])) {
                    log.write(logPath_bed, "第" + recordCount + "条记录学生学号格式错误。");
                    flag = false;
                }
            }
            if (bedInfoObj['studentName'] == undefined) {
                log.write(logPath_bed, "第" + recordCount + "条记录缺少学生姓名。");
                flag = false;
            }
        } else {
            if (bedInfoObj['studentNo'] != undefined || bedInfoObj['studentName'] != undefined) {
                log.write(logPath_bed, "第" + recordCount + "条记录不应有学生信息。");
                flag = false;
            }
        }

        // 验证是否在宿舍列表中
        if (bedInfoObj['buildingNo'] != undefined && bedInfoObj['roomNo'] != undefined) {
            var dormInfoQuerySql = "SELECT * FROM dorm WHERE buildingNo=? AND roomNo=? AND deleteBit=?",
                dormInfoQuerySql_Params = [bedInfoObj['buildingNo'], bedInfoObj['roomNo'], 0];

            sqlPool.getConnection(function(err, connection) {
                if (err) {
                    console.log(err);
                    callback(err);
                }

                var sqlQuery = connection.query(dormInfoQuerySql, dormInfoQuerySql_Params, function(err, result) {
                    if (err) {
                        console.log(err);
                        connection.release();
                        callback(err);
                    }
                    
                    if (result.length > 0) {

                    } else {

                        log.write(logPath_bed, "第" + recordCount + "条记录中的宿舍信息不存在。");
                        flag = false;

                    }
                    resolve(flag);
                });
            });
        } else {
            resolve(flag);
        }
    })
 
}

function validateDormInfo(dormInfoObj, recordCount) {
    var flag = true;

    // 检测是否楼号为空
    if (dormInfoObj['buildingNo'] == undefined) {
        log.write(logPath_dorm, "第" + recordCount + "条记录缺少楼号。");
        flag = false;
    }

    // 检测是否宿舍号为空
    if (dormInfoObj['roomNo'] == undefined) {
        log.write(logPath_dorm, "第" + recordCount + "条记录缺少宿舍号。");
        flag = false;
    } else {
        // 根据不同楼号检测宿舍号的有效性
        // 5号楼：4位数字；13号楼：F+4位数字；14号楼：E+4位数字
        if (dormInfoObj['buildingNo'] != undefined) {
            var re;
            switch(dormInfoObj['buildingNo']) {
                case 5:
                    re = /^5\d{3}$/;
                    break;
                case 13:
                    re = /^F\d{4}$/;
                    break;
                case 14:
                    re = /^E\d{4}$/;              
                    break;
            }

            if (!re.test(dormInfoObj['roomNo'])) {
                log.write(logPath_dorm, "第" + recordCount + "条记录宿舍号格式错误。");
                flag = false;                     
            }
        }
    }

    return flag;
}

function validateStudentInfo(studentInfoObj, recordCount) {
    var flag = true;

    // 检测是否学号为空
    if (studentInfoObj['studentNo'] == undefined) {
        log.write(logPath_student, "第" + recordCount + "条记录缺少学号。");
        flag = false;
    } else {
        var re = /^\d{10}$/;

        if (!re.test(studentInfoObj['studentNo'])) {
            log.write(logPath_student, "第" + recordCount + "条记录学号输入有误。");
            flag = false;            
        }
    }

    // 检测是否姓名为空
    if (studentInfoObj['studentName'] == undefined) {
        log.write(logPath_student, "第" + recordCount + "条记录缺少姓名。");
        flag = false;
    } 

    return flag;
}

app.listen(4000, function(req, res) {
    console.log('app is running at port 4000.');
});