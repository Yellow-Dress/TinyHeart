var cryptoComm = require('../common/algorithm');
var StudentController = require('./studentController');
var StatusController = require('./statusController');

var processList;
var processOne;

function storeCodeUrl(req,res,id,url){
	req.models.process.update({id:id},{code_url:url}).exec(function(err,result){
        var judge = 1;
        if (err) {
            judge = 2;
        }
        return judge;
    });
};

function getStudent(res,req,data,type){
    console.log(data);
    var studentid = data.studentid;
    //资格审核状态23
    var enrollcomplete = data.enrollcomplete;
    //新生缴费状态24
    var financecomplete = data.financecomplete;
    //教务注册状态25
    var jwbcomplete = data.jwbcomplete;

    var statusList;
    if(type=='list'){
	    StatusController.getStatusListById(req,res,studentid).then(function(data){
	        statusList = data;
	        console.log('test');
	        console.log(data);
	        //接口状态显示
		    for(var process of processList){
		    	if(process.id==23){
		    		process.status = enrollcomplete;
		    	}else if(process.id==24){
		    		process.status = financecomplete;
		    	}else if(process.id==25){
		    		process.status = financecomplete;
		    	}else if(statusList){ 
		    		for(var status of statusList){
		    			if(process.id == status.pid){
		    				process.status = status.process_status;
		    			}
		    		}
		    		
	        	}
		    }
	        res.render('mobileHome', { 
		        title: '流程列表', 
		        student: studentid,
		        posts: processList
		    });
	        
	    });
	}
      
};
function processSuccess(req,res,studentId){
    res.render('processSuccess', { 
        title: '流程确认成功', 
        user: studentId,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    }); 
};
function processFail(req,res){
	res.render('processFail', { 
        title: '流程确认失败', 
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    }); 
};

module.exports = {
	pid: null,
	getProcessList: function(req, res,from) {
	    var allPosts = [];
	    if(from == 'web'){
	    	req.models.process.find({user_name:req.session.user.user_name})
		    .sort('sequence')
		    .exec(function(err, process){
	            res.render('home', { 
		            title: '主页', 
		            user: req.session.user,
		            posts: process,
		            success: req.flash('success').toString(),
		            error: req.flash('error').toString()
		        });             
	        });   
	    }else{
	    	req.models.process.find()
		    .sort('sequence')
		    .exec(function(err, process){
		    	processList = process;
		    	StudentController.getStudentProcessStatus(req,res,getStudent); 	            
	        }); 
	    }  
	},
	getProcessDetailById: function(req, res, from) {
	    console.log(req.query.id);
	    
	    req.models.process.findOne({id:req.query.id}).exec(function(err, process){
            console.log(process);
            var title = '流程修改';
            if(err){
	            process = [];
	        }
	        if(from == 'mobile'){
	        	res.render('mobileDetail', { 
		            title: '流程详情', 
		            post: process,
		            type: 'detail'		        
		        }); 
	        }else{
		        if(from == 'detail'){
		        	title = '流程详情';
		        }else pid = req.query.id;
	            res.render(from, { 
		            title: title, 
		            user: req.session.user,
		            post: process,
		            success: req.flash('success').toString(),
		            error: req.flash('error').toString()
		        }); 
	        }
        });   
	},
	addProcess: function (req, res) {
		var judge = 1;
	    var sequence = '0';
	    var currentUser = req.session.user;
	    var Process = {
	    		user_name : currentUser.user_name,
	    		title : req.body.title,
	    		content : req.body.content,
	    		process_type : req.body.type,
	    		sequence : 0
	    	};
	    var url = '';
    	req.models.process.create(Process).exec(function(err,result){
            if (err) {
                req.flash('error', err);
                judge = 0;
            }else {
            	url = cryptoComm.encryptUrl(String(result.id));
            	//根据id加密，生成code
            	req.models.process.update({id:result.id},{code_url:url}).exec(function(err,result){
			        judge = 1;
			        if (err) {
			            judge = 2;
			            req.flash('success', '二维码生成失败!');
			        }else{
			        	req.flash('success', '发布成功!');
			        }
			        return res.json({type: judge});
			    });
            	
            }
            
        });
	},
	updateProcessSeq: function(req,res){
		var judge = 1;
		var seqList = req.body.list;
		
		for(var i=0;i<seqList.length;i++){
			var seq = seqList[i];
			req.models.process.update({id: seq} , {sequence: i+1}).exec(function(err,result){
	            if (err) {
	                req.flash('error', err);
	                console.log('error'+err);
	                judge = 0;
	            }
	        });
		}
		req.flash('success', '顺序调整成功!');
	    res.json({type: judge});
	},
	updateProcess: function(req,res){
		var judge = 1;
		req.models.process.update({id:pid},{title:req.body.title,content:req.body.content}).exec(function(err,result){
            if (err) {
                req.flash('error', err);
                console.log('error'+err);
                judge = 0;
            }else {
            	req.flash('success', '修改成功!');
       		}
            return res.json({type: judge});
        });
	},
	deleteProcess: function(req,res){
		req.models.process.destroy({id:req.body.id}).exec(function(err,result){
			var judge = 1;
			if (err) {
                req.flash('error', err);
                console.log('error'+err);
                judge = 0;
            }else{
            	req.flash('success', '删除成功!');
            }
            return res.json({type: judge});
		});
	},
    processConfirm: function(req,res){
    	var studentid = req.query.id;
    	var code = req.query.code;
    	var pid = cryptoComm.decryptUrl(code);
    	console.log(studentid+' '+pid);
    	StatusController.getStatusListByPidSid(req,res,studentid,pid).then(function(data){
            console.log(data);
            if(data!=null){
                req.models.status.update({studentid:studentid,pid:pid},{process_status:1}).exec(function(err,result){
		            if (err) {
		                console.log('error'+err);
		                req.flash('error', err);
		                processFail(req,res);
		            }else {
		            	processSuccess(req,res,studentid); 
					}
		        });
            }else{
            	var Status = {
		    		studentid : studentid,
		    		pid : pid,
		    		process_status : 1
		    	};
		    	console.log('Status');
		    	console.log(Status);
			    req.models.status.create(Status).exec(function(err,result){
		            if (err) {
		                req.flash('error', err);
		                processFail(req,res);
		            }else {
		            	processSuccess(req,res,studentid); 
		            }
		            
		        });
            }
        });
    }
}