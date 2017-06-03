var PORT = 9529;
var http = require('http');
var qs = require('qs');

var TOKEN = 'sspku';

/**
 * [checkSignature 签名校验]
 * @param  {[type]} params [description]
 * @param  {[type]} token  [随机定义的值 这里是sspku]
 * @return {[boolean]}        [true | false]
 */
function checkSignature(params,token){
	var key = [token,params.timestamp,params.nonce].sort().join('');
 	var sha1 = require('crypto').createHash('sha1');
 	//sha1加密
 	sha1.update(key);

 	return sha1.digest('hex') == params.signature;
}

var server = http.createServer(function(request,response){
	var query = require('url').parse(request.url).query;
	//将字符串转化为对象
	var params = qs.parse(query);

	console.log(params);
	console.log("token-->",TOKEN);
	//校验
	if(checkSignature(params,TOKEN)){
		response.end(params.echostr);
	}else{
		response.end('signature fail');
	}

});

server.listen(PORT);
console.log("Server running at port: " + PORT + ".");