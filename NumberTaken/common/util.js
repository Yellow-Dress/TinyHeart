var Token = require('../models/tokens.js');
var Ticket = require('../models/tickets.js');
var https = require("https");

var nonceStr = 'Skiagjvoiawejpogadm';
var sign = require('./sign.js');
var token = require('./token.js');


var request = require('request');

/**
 * [getapiTicket 从数据库中读取API Ticket]
 * @param  {Function} callback [回调函数]
 * @param    res      
 * @param    req      
 */
function getapiTicket(callback,res,req){
	var apiTicket = 'sM4AOVdWfPE4DxkXGEs8VE0UvuokXuPPmGE3enziI7lX5bqbmu03QjO4xyQiGgwrY8uifsTYEMbDeqRBgW3bUQ';
	Ticket.get('wechat', function (err, ticket) {
        if (!ticket) {
          console.log('null');
        }
        console.log(ticket);
        apiTicket = ticket.apiTicket;
        dd = checkSignature(apiTicket,req);
        console.log("hahahha");
        console.log(dd);
        callback(res,dd);
    });
}

/**
 * [checkSignature 获取签名]
 * @param   apiTicket 
 * @param   req       
 */
function checkSignature(apiTicket,req){
	var timestamp = Date.now();
	var url = "http://xixi.lilingkun.com:3000"+req.originalUrl;
	var key = ["jsapi_ticket="+apiTicket,"timestamp="+parseInt(timestamp/1000),"noncestr="+nonceStr,"url="+url].sort().join('&');
 	//调用sign方法获取签名
    var data = sign(apiTicket,url);
    console.log("test:"+key);
 	return data;
}

exports.getapiTicket = getapiTicket;
