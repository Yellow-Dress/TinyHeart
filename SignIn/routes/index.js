var express = require('express');
var router = express.Router();
var User = require('../models/users');
var util = require('../common/util');

//回调函数 渲染页面
function rendPage(res,data) {
	console.log(data.signature);
	res.render('index',{
		title: 'Express',
		signature: data.signature,
		timestamp: data.timestamp,
		nonceStr: data.nonceStr,
	})
}



/* GET home page. */
router.get('/', function(req, res, next) {
  //首先获取apiTicket，并渲染在页面上
	var data = util.getapiTicket(rendPage,res,req);
});

//响应signin请求
router.post('/signin',function(req,res){
	  var message = 0;
    //从页面获取需要存储的信息
    var name = req.body.name,
        id = req.body.id,
        latitude = req.body.latitude,
        longitude = req.body.longitude;
    var newUser = new User({
        name : name,
        id : id,
        latitude : latitude,
        longitude : longitude
    });
    //根据ID，查询数据库中有无记录
    User.get(id, function (err, user) {
      if (err) {
        console.log('error'+err);
        message = -3;
      }
      //如果未填写ID和name
      if(!id||!name){
        message = -4
      }else if (!user) {
        //如果不存在则新增用户
        newUser.save(function (err, user) {
          if (err) {
            console.log('error'+err);
            message = -3
          }
          console.log('success');
        });
        
      }else{
        console.log('already exited! ');
        message = -1;
      }
      //回传给前端数据
      res.json({message: message});
    });、
});

module.exports = router;
