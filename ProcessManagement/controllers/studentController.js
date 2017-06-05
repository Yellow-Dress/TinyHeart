var https = require("https");
var cryptoComm = require('../common/algorithm');

var TokenController = require('./tokenController');
var StatusController = require('./statusController');
var access_token = '';
var studentId = '';
var student;
var processOne;
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
                    StatusController.getStatus(request,response,type,studentId,callback);
                }
                console.log(studentId);
            }else{
                //当学号读取失败，重新读取数据库中的access token
                getAccessToken(request,response,code,encryptCode,1,type,callback);
                

                console.dir(body);

            }
        });
    });

    req.on('error',function(e){
        console.log('Error: ' + e.message);
    });
};

function getStudent(res,req,data,type){
    var studentid = data.studentid;
    //资格审核状态23
    var enrollcomplete = data.enrollcomplete;
    //新生缴费状态24
    var financecomplete = data.financecomplete;
    //教务注册状态25
    var jwbcomplete = data.jwbcomplete;
    if(processOne.id==23){
        processOne.status = enrollcomplete;
    }else if(processOne.id==24){
        processOne.status = financecomplete;
    }else if(processOne.id==25){
        processOne.status = financecomplete;
    }

    if(type == 'one'){
        res.render('mobileDetail', { 
            title: '流程确认', 
            post: processOne,
            student: studentid,
            type: 'confirm'             
        }); 
    }
      
};
function getProcessDetailByCode(req, res, id, studentId ) {
    console.log('test');
    req.models.process.findOne({id:id}).exec(function(err, process){
        var process_type;
        if(err){
            process = [];
        }else if(process){
            processOne = process;
            process_type = process.process_type;
            //扫描内置流程
            if(process_type == 0){
                StatusController.getStatus(req,res,'one',studentId,getStudent);
            }else{
                StatusController.getStatusListByPidSid(req,res,studentId,id).then(function(data){
                    if(data!=null){
                        var status = data[0].process_status;
                        processOne.status = status
                        console.log(processOne);
                        console.log(status);
                    }
                    
                    res.render('mobileDetail', { 
                        title: '流程确认', 
                        post: processOne,
                        student: studentId,
                        type: 'confirm'             
                    });

                });
            }
        }    
    });   
};
function changeStatus(req,res,encryptCode,type){
    
    if(!type){
        var id = cryptoComm.decryptUrl(encryptCode);
        getProcessDetailByCode(req,res,id,studentId);
    }else{
        pageFail(req,res);
    }

};

function pageFail(req,res){
    res.render('processFail', { 
        title: '访问失败', 
        from: 'page',
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
        var encryptCode = req.query.codeurl;
        var callback;
        //当access token不存在时，去数据库中读取
        if(access_token.length<=0){
            getAccessToken(req,res,code,encryptCode,0,'one',callback);
        }else{
            //如果有 则直接读取学号
            getStudentId(req,res,code,encryptCode,'one',callback);
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