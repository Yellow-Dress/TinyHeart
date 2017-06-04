var later = require("later");
var https = require("https");

var corpid = "*";
var corpsecret = "*";
var access_token = '';
var judge = 0;

var mysql = require('mysql');
//建立连接
var connection = mysql.createConnection({
  host: '*',
  user: 'root',
  password: '*',
  database: 'db_node'
});

later.date.localTime();
console.log("Now:"+new Date());
//定时任务
var sched = later.parse.recur().every(1).hour();
//var sched = later.parse.recur().every(60).second();
next = later.schedule(sched).next(10);
console.log(next);

/**
 * 启动执行
 * setTimeout: 设置一段时间后运行，只运行1次
 * setInterval: 循环运行
 */
var timer = later.setInterval(getAccessToken,sched);
setTimeout(getAccessToken,2000);
/**
 * [getAccessToken 获取access_token]
 * @return {[type]} [description]
 */
function getAccessToken(){
    var options = {
        hostname : "qyapi.weixin.qq.com",
        path : "/cgi-bin/gettoken?corpid=" + corpid + '&corpsecret=' + corpsecret
    };
    //根据options获取信息
    var req = https.get(options,function(res){
        console.log('access_token');
        var bodyChunks = '';
        res.on('data',function(chunk){
            bodyChunks += chunk;
        });
        res.on('end',function(){
            //解析数据
            var body = JSON.parse(bodyChunks);
            if(body.access_token){
                access_token = body.access_token;
                console.log(access_token);
                saveToken();
            }else{
              getAccessToken();
              console.dir(body);
            }
        });
    });

    req.on('error',function(e){
      getAccessToken();
      console.log('Error: ' + e.message);
    });
};

function saveToken(){
  var userModSql = 'UPDATE token SET access_token = ? WHERE id = ?';
  var userModSql_Params = [access_token,1];
  //改 up
  connection.query(userModSql,userModSql_Params,function (err, result) {
     if(err){
           console.log('[UPDATE ERROR] - ',err.message);
           return;
     }       
    console.log('----------UPDATE-------------');
    console.log('UPDATE affectedRows',result.affectedRows);
    console.log('******************************');
  });
}

