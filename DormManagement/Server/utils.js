var mysql = require('mysql');
var xlsx = require('xlsx');
var fs = require('fs');
var https = require('https');
var accountInfo = require('./token.json');
var resolveFunc;

module.exports = {
    parseBedExcel: function(filePath) {
        var workBook = xlsx.readFile(filePath),
            workSheet = workBook.Sheets[workBook.SheetNames[0]];

        var keys = Object.keys(workSheet);
        var headers = [];
        var data = [];

        keys.filter(function(k) {
            return k[0] !==  '!';
        }).forEach(function(k) {
            var col = k.substring(0, 1);
            var row = parseInt(k.substring(1));
            var value = workSheet[k].v;

            if (row === 1) {
                    // console.log(value)
                if (value.indexOf('序号') != -1) {
                    headers[col] = 'id';
                }

                if (value.indexOf('楼号') != -1) {
                    headers[col] = 'buildingNo';
                }      

                if (value.indexOf('宿舍号') != -1) {
                    headers[col] = 'roomNo';
                }      

                if (value.indexOf('床位') != -1) {
                    headers[col] = 'bedNo';
                }  

                if (value.indexOf('性别') != -1) {
                    headers[col] = 'sex';
                }  

                if (value.indexOf('状态') != -1) {
                    headers[col] = 'status';
                }

                if (value.indexOf('学生学号') != -1) {
                    headers[col] = 'studentNo';
                }

                if (value.indexOf('学生姓名') != -1) {
                    headers[col] = 'studentName';
                }

                return;
            }

            if (!data[row]) {
                data[row] = {}
            }

            switch(headers[col]) {
                case 'roomNo':
                    value = (value + '').trim();
                    break; 
                case 'studentNo':
                    value = (value + '').trim();
                    break;
                case 'studentName':
                    value = (value + '').trim();
                    break;
                case 'sex':
                    if (value == '男') {
                        value = 1;
                    } else if (value == '女') {
                        value = 0;
                    }                        
                    break;
                case 'status':
                    if (value == '空床') {
                        value = 0;
                    } else if (value == '已分配') {
                        value = 1;
                    } else if (value == '已入住') {
                        value = 2;
                    }
                    break;
                        
            }
            data[row][headers[col]] = value;
        })

        return data.slice(2);
    },
    parseDormExcel: function(filePath) {
        var workBook = xlsx.readFile(filePath),
            workSheet = workBook.Sheets[workBook.SheetNames[0]];

        var keys = Object.keys(workSheet);
        var headers = [];
        var data = [];

        keys.filter(function(k) {
            return k[0] !==  '!';
        }).forEach(function(k) {
            var col = k.substring(0, 1);
            var row = parseInt(k.substring(1));
            var value = workSheet[k].v;

            if (row === 1) {
                    // console.log(value)
                if (value.indexOf('序号') != -1) {
                    headers[col] = 'id';
                }

                if (value.indexOf('楼号') != -1) {
                    headers[col] = 'buildingNo';
                }      

                if (value.indexOf('宿舍号') != -1) {
                    headers[col] = 'roomNo';
                }      

                return;
            }

            if (!data[row]) {
                data[row] = {}
            }

            switch(headers[col]) {
                case 'roomNo':
                    value = (value + '').trim();
                    break;                       
            }
            data[row][headers[col]] = value;
        })

        return data.slice(2);
    },
    parseStudentExcel: function(filePath) {
        var workBook = xlsx.readFile(filePath),
            workSheet = workBook.Sheets[workBook.SheetNames[0]];

        var keys = Object.keys(workSheet);
        var headers = [];
        var data = [];

        keys.filter(function(k) {
            return k[0] !==  '!';
        }).forEach(function(k) {
            var col = k.substring(0, 1);
            var row = parseInt(k.substring(1));
            var value = workSheet[k].v;

            if (row === 1) {
                    // console.log(value)
                if (value.indexOf('序号') != -1) {
                    headers[col] = 'id';
                }

                if (value.indexOf('学号') != -1) {
                    headers[col] = 'studentNo';
                }      

                if (value.indexOf('姓名') != -1) {
                    headers[col] = 'studentName';
                }

                if (value.indexOf('性别') != -1) {
                    headers[col] = 'sex';
                }

                return;
            }

            if (!data[row]) {
                data[row] = {}
            }

            switch(headers[col]) {
                case 'studentNo':
                    value = (value + '').trim();
                    break;   
                case 'studentName':
                    value = (value + '').trim();
                    break;
                case 'sex':
                    if (value == '男') {
                        value = 1;
                    } else if (value == '女') {
                        value = 0;
                    }                        
                    break;                                         
            }
            data[row][headers[col]] = value;
        })

        return data.slice(2);       
    },
    getAccessToken: function() {
        return new Promise(function(resolve, reject) {
            resolveFunc = resolve;
            // 判断本地的access_token是否失效
            if (!isAccessTokenValid(accountInfo)) {
                console.log("No Access Token.");
                // 失效则重新获取
                queryAccessToken();
            } else {
                // 为失效则执行resolve，将access_token等基本信息传给调用方
                resolveFunc(accountInfo);
            }            
        })
    },
    checkLogin: function(req, res) {
        if (!req.session.user) {
            console.log('未登录！');
            res.end();
            res.redirect('views/index.html');
        }
    }
}

function queryAccessToken() {
    var corpid = accountInfo.corpid,
        corpsecret = accountInfo.corpsecret,
        update_time = accountInfo.update_time;

    // https请求的配置
    var options = {
        host: "qyapi.weixin.qq.com",
        port: 443,
        path: "/cgi-bin/gettoken?corpid=" + corpid +"&corpsecret=" + corpsecret,
        method: "GET"
    }

    var req = https.request(options, function(res) {
        var responseText = ""; // 存储从微信服务器获取的返回数据

        // 监听'data'事件，将获取到的数据拼接起来
        res.on('data', function (data) {
            responseText += data;
        });

        // 监听'end'事件，在response结束后执行
        res.on('end', function () {
            // console.log(responseText)

            // 解析responseText，若没有access_token的信息，则不更新最新获取access_token的时间
            if (JSON.parse(responseText)["access_token"] == undefined) {
                var obj = {
                    corpid: corpid,
                    corpsecret: corpsecret,
                    access_token: "",
                    update_time: update_time
                }
            } else {
                var obj = {
                    corpid:  corpid,
                    corpsecret: corpsecret,
                    access_token: JSON.parse(responseText)["access_token"],
                    update_time: Date.now()
                }
            }

            accountInfo = obj;

            // 将获取到的基本信息，写入服务器本地文件中存储起来
            fs.writeFile('./token.json', JSON.stringify(obj), function() {
                resolveFunc(accountInfo);
            })

        });
    })

    // 监听'error'，若失败则输出错误信息
    req.on("error", function(e) {
        console.log(e);
    });

    req.end();        
}

function isAccessTokenValid(accountInfo) {
    // 基本信息为空
    if (!accountInfo) {
        return false;
    }

    // access_token为空，即从未获取或获取失败
    if (accountInfo.access_token == undefined || accountInfo.access_token.length == 0) {
        return false;
    }

    // 以现在的时间判断是否过期
    if (Date.now() - accountInfo.update_time >= 7000 * 1000) {
        return false;
    }
    
    return true;     
}