var https = require("https");

var corpid = "*";
var corpsecret = "*";
var access_token = '';
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
            }else{
                console.dir(body);
            }
        });
    });

    req.on('error',function(e){
        console.log('Error: ' + e.message);
    });
};

module.exports = {
    findAccessToken : function(req){
        console.log('token');
        return req.models.token.find().then(function(token){
            if(token.length>0){
                return token[0].access_token;
            }else
                return null;
        }).catch(function (err) {
            console.log('err');
        }); 
    }
}