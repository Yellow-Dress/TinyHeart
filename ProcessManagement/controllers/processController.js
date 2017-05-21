module.exports = {
	pid: null,
	getProcessList: function(req, res) {
	    var allPosts = [];
	    req.models.process.find({user_name:req.session.user.user_name})
	    .sort('sequence')
	    .exec(function(err, process){
            //console.log(process);

            res.render('home', { 
	            title: '主页', 
	            user: req.session.user,
	            posts: process,
	            success: req.flash('success').toString(),
	            error: req.flash('error').toString()
	        }); 
        });   
	},
	getProcessDetailById: function(req, res, from) {
	    console.log(req.query.id);
	    pid = req.query.id;
	    req.models.process.findOne({id:req.query.id}).exec(function(err, process){
            console.log(process);
            var title = '流程修改';
            if(err){
	            process = [];
	        }
	        if(from == 'detail'){
	        	title = '流程详情';
	        }
            res.render(from, { 
	            title: title, 
	            user: req.session.user,
	            post: process,
	            success: req.flash('success').toString(),
	            error: req.flash('error').toString()
	        }); 
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
	    		sequence : 0
	    	};
    	req.models.process.create(Process).exec(function(err,result){
            if (err) {
                req.flash('error', err);
                console.log('error'+err);
                judge = 0;
            }
            req.flash('success', '发布成功!');
            res.json({type: judge});
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
		console.log(req.body.content);
		console.log(req.body.title);
		console.log(req.query.id);
		req.models.process.update({id:pid},{title:req.body.title,content:req.body.content}).exec(function(err,result){
            if (err) {
                req.flash('error', err);
                console.log('error'+err);
                judge = 0;
            }
            req.flash('success', '修改成功!');
            res.json({type: judge});
        });
	}
}