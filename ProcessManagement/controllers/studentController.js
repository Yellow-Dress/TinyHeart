var https = require("https");

var TokenController = require('./tokenController');
var access_token = '';
var studentId = '';

/**
 * [getStudentId 获取用户学号]
 * @param  {[type]} request     [description]
 * @param  {[type]} response    [description]
 * @param  {[type]} code        [用户扫码后，微信返回的code]
 * @param  {[type]} encryptCode [加密后的ID]
 * @return {[type]}             [description]
 */
function getStudentId(request,response,code,encryptCode){
    var options = {
        hostname : "qyapi.weixin.qq.com",
        path : "/cgi-bin/user/getuserinfo?access_token=" + access_token + '&code=' + code
    };
    //根据options获取信息
    var req = https.get(options,function(res){
        console.log('studentId');
        var bodyChunks = '';
        res.on('data',function(chunk){
            bodyChunks += chunk;
        });
        res.on('end',function(){
            //解析数据
            var body = JSON.parse(bodyChunks);
            if(body.UserId){
                studentId = body.UserId;
                changeStatus(request,response,encryptCode);
                console.log(studentId);
            }else{
                //当学号读取失败，重新读取数据库中的access token
                getAccessToken(request,response,code,encryptCode);
                console.dir(body);
            }
        });
    });

    req.on('error',function(e){
        console.log('Error: ' + e.message);
    });
};

function changeStatus(req,res,encryptCode){
    res.render('processSuccess', { 
        title: '流程确认成功', 
        user: studentId,
        //process: process,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    }); 
};

/**
 * [getAccessToken 从数据库中读取access token]
 * @param  {[type]} req         [description]
 * @param  {[type]} res         [description]
 * @param  {[type]} code        [用户扫码后，微信返回的code]
 * @param  {[type]} encryptCode [加密后的ID]
 * @return {[type]}             [description]
 */
function getAccessToken(req,res,code,encryptCode){
    TokenController.findAccessToken(req).then(function(data){
        access_token = data;
        getStudentId(req,res,code,encryptCode);
    });
}

module.exports = {
    handleCode: function(req,res){
        var code = req.query.code;
        var encryptCode = req.query.codeUrl;
        //当access token不存在时，去数据库中读取
        if(access_token.length<=0){
            getAccessToken(req,res,code,encryptCode);
        }else{
            //如果有 则直接读取学号
            getStudentId(req,res,code,encryptCode);
        }
    }
}