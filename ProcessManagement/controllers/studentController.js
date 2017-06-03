var https = require("https");
var cryptoComm = require('../common/algorithm');

var TokenController = require('./tokenController');
var access_token = '';
var studentId = '';
var student;
/**
 * [getStudentId 获取用户学号]
 * @param  {[type]} request     [description]
 * @param  {[type]} response    [description]
 * @param  {[type]} code        [用户扫码后，微信返回的code]
 * @param  {[type]} encryptCode [加密后的ID]
 * @return {[type]}             [description]
 */
function getStudentId(request,response,code,encryptCode,type,callback){
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
                if(type=='one'){
                    changeStatus(request,response,encryptCode,0);
                }else if(type=='list'){
                    getStatus(request,response,callback);
                }
                console.log(studentId);
            }else{
                //当学号读取失败，重新读取数据库中的access token
                if(type=='one'){
                    getAccessToken(request,response,code,encryptCode,1,callback);
                }else if(type=='list'){

                }
                
                console.dir(body);
                
            }
        });
    });

    req.on('error',function(e){
        console.log('Error: ' + e.message);
    });
};

function changeStatus(req,res,encryptCode,type){
    console.log(type);
    var id = cryptoComm.decryptUrl(encryptCode);
    if(!type){
        res.render('processSuccess', { 
            title: '流程确认成功', 
            user: studentId,
            //process: process,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        }); 
    }else{
        res.render('processFail', { 
            title: '流程确认失败', 
            //process: process,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        }); 
    }
     
};

function tipPage(res,req){

}

function getStatus(request,response,callback){
    var token = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    var options = {
        hostname : "api.mysspku.com",
        path : "/index.php/V2/Ssbd/getinfo?stuid="+ studentId +"&token=" + token
    };
    console.log('getStatus:'+studentId);
    //根据options获取信息
    var req = https.get(options,function(res){
        var bodyChunks = '';
        res.on('data',function(chunk){
            bodyChunks += chunk;
        });
        res.on('end',function(){
            //解析数据
            var body = JSON.parse(bodyChunks);
            if(body.errcode == 0){
                student = body.data;
                callback(response,request,student);
            }else{
                
                console.dir('test:'+body);
                
            }
        });
    });

    req.on('error',function(e){
        console.log('Error: ' + e.message);
    });
}


/**
 * [getAccessToken 从数据库中读取access token]
 * @param  {[type]} req         [description]
 * @param  {[type]} res         [description]
 * @param  {[type]} code        [用户扫码后，微信返回的code]
 * @param  {[type]} encryptCode [加密后的ID]
 * @param  {[type]} type        [0初始 1存在access token]
 * @return {[type]}             [description]
 */
function getAccessToken(req,res,code,encryptCode,type,from,callback){
    TokenController.findAccessToken(req).then(function(data){
        access_token = data;
        if(!type){ getStudentId(req,res,code,encryptCode,from,callback); }
        else{
            //当access token失效 或 用户刷新页面导致code实效
            changeStatus(req,res,encryptCode,1)
        }
    });
}

module.exports = {
    handleCode: function(req,res){
        var code = req.query.code;
        var encryptCode = req.query.codeUrl;
        //当access token不存在时，去数据库中读取
        if(access_token.length<=0){
            getAccessToken(req,res,code,encryptCode,0);
        }else{
            //如果有 则直接读取学号
            getStudentId(req,res,code,encryptCode,'one');
        }
    },
    getStudentProcessStatus: function(req,res,callback){
        var code = req.query.code;
        var encryptCode = req.query.codeUrl;
        //当access token不存在时，去数据库中读取
        if(access_token.length<=0){
            getAccessToken(req,res,code,encryptCode,0,'list',callback);
        }else{
            //如果有 则直接读取学号
            getStudentId(req,res,code,encryptCode,'list',callback);
        }
    }
}