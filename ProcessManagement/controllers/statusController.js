var https = require("https");



module.exports = {
    getStatus: function(request,response,type,studentId,callback){
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
                    callback(response,request,student,type);
                }else{
                    
                    console.dir('test:'+body);
                    
                }
            });
        });

        req.on('error',function(e){
            console.log('Error: ' + e.message);
        });
    },
    getStatusListById: function(req,res,studentid){
        return req.models.status.find({studentid:studentid}).then(function(status){
            if(status.length>0){
                return status;
            }else
                return null;
        }).catch(function (err) {
            console.log('err');
        }); 
    },
    getStatusListByPidSid: function(req,res,studentid,pid){
        return req.models.status.find({studentid:studentid,pid:pid}).then(function(status){
            if(status.length>0){
                return status;
            }else
                return null;
        }).catch(function (err) {
            console.log('err');
        }); 
    }
}