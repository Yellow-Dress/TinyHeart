/**
 * token验证
 */
var later = require("later");
var https = require("https");

var corpid = "wx1d3765eb45497a18";
var corpsecret = "QEr6U8_nqdz9zlo4SsXtmy8JNWuYVlIDT76VisdwTCkAjgw280jdcPEKN98fgkd4";
var access_token = '';

var Token = require('../models/tokens.js');
var Ticket = require('../models/tickets.js');

later.date.localTime();
console.log("Now:"+new Date());
//定时任务
var sched = later.parse.recur().every(1).hour();
//var sched = later.parse.recur().every(5).second();
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
 */
function getAccessToken(){
	console.log(new Date());
	var options = {
		hostname : "qyapi.weixin.qq.com",
		path : "/cgi-bin/gettoken?corpid=" + corpid + '&corpsecret=' + corpsecret
	};
	//根据options获取信息
	var req = https.get(options,function(res){
		var bodyChunks = '';
		res.on('data',function(chunk){
			bodyChunks += chunk;
		});
		res.on('end',function(){
			//解析数据
			var body = JSON.parse(bodyChunks);
			if(body.access_token){
				access_token = body.access_token;
				saveAccessToken(access_token);
				apiTicket(access_token);
			}else{
				console.dir(body);
			}
		});
	});

	req.on('error',function(e){
		console.log('Error: ' + e.message);
	});
}

/**
 * [apiTicket 获取apiTicket]
 * @param  access_token
 */
function apiTicket(access_token){
	console.log("test: "+access_token);
	var options = {
		hostname : "qyapi.weixin.qq.com",
		path : "/cgi-bin/get_jsapi_ticket?access_token=" + access_token
	};
	var req = https.get(options,function(res){
		var bodyChunks = '';
		res.on('data',function(chunk){
			bodyChunks += chunk;
		});
		res.on('end',function(){
			var body = JSON.parse(bodyChunks);
			if(body.ticket){
				saveApiTicket(body.ticket);
			}
		});
	});

	req.on('error',function(e){
		console.log('Error: ' + e.message);
	});
}

/**
 * [saveAccessToken 存储access_token]
 * @param access_token [token值]
 */
function saveAccessToken(access_token){
	Token.updateData(access_token,function (err) {
        if (err) {
          console.log('Error: ' + err.message);
        }
        console.log(access_token);
    });
}
/**
 * [saveApiTicket 存储apiTicket]
 * @param  apiTicket
 */
function saveApiTicket(apiTicket){
	Ticket.updateData(apiTicket,function (err) {
        if (err) {
          console.log('Error: ' + err.message);
        }
        console.log(apiTicket);
    });
}


