var Token = require('../models/tokens.js');
var Ticket = require('../models/tickets.js');
var https = require("https");

var nonceStr = 'Skiagjvoiawejpogadm';
var sign = require('./sign.js');


var request = require('request');

/**
 * [getapiTicket 从数据库中读取API Ticket]
 * @param  {Function} callback [回调函数]
 * @param    res      
 * @param    req      
 */
function getapiTicket(callback,res,req){
	var apiTicket = 'kgt8ON7yVITDhtdwci0qeWuGDHT1lV2r96xhNURymc9qWbwmGa30rszLRWIeg0Jl9Qk2WfnAzXo8NvvztPrzXw';
	Ticket.get('wechat', function (err, ticket) {
        if (!ticket) {
          console.log('null');
        }
        //apiTicket = ticket.apiTicket;
        dd = checkSignature(apiTicket,req);
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
	var url = "http://pku.xixi.kkxixi.com:3000"+req.originalUrl;
	var key = ["jsapi_ticket="+apiTicket,"timestamp="+parseInt(timestamp/1000),"noncestr="+nonceStr,"url="+url].sort().join('&');
 	//调用sign方法获取签名
    var data = sign(apiTicket,url);
    console.log("test:"+key);
 	return data;
}

exports.getapiTicket = getapiTicket;
