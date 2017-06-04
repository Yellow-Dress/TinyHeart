var express = require('express');
var router = express.Router();
var User = require('../models/users');
var Tokens = require('../models/tokens');
var util = require('../common/util');
var request = require('request');
var studentId = '';
var studentName = '';
var number = 0;
var access_token = 'APdhdzRGv6ZV-XDx2xwNwFrlumlcrKbpI0dgQENvuiAg7nQYJ4bG0gThXVOnsZvK';

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

// function getaccessToken(res,req){
//   Tokens.get('wechat', function (err, tokens) {
//         if (!tokens) {
//           console.log('null');
//         }
//         console.log(tokens);
//         access_token = tokens.access_token;
//     });
// }

/* GET home page. */
router.get('/', function(req, res, next) {
  //首先获取apiTicket，并渲染在页面上
	var data = util.getapiTicket(rendPage,res,req);

  var code = req.query.code;
    request.get(
        {   
            url:'https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token=' + access_token + '&code=' + code,
        },
        function(error, response, body){
            if(response.statusCode == 200){

            // 第四步：根据获取的用户信息进行对应操作
            var userinfo = JSON.parse(body);
            console.log(userinfo);
            studentId = userinfo.UserId;
            console.log('获取微信信息成功！');
            console.log(studentId);               

            }else{
                console.log(response.statusCode);
            }

        }
    );
    var token = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    request.get(
        {   
            url:'https://api.mysspku.com/index.php/V2/StudentInfo/getDetail?stuid=' + studentId + '&token=' + token,
        },
        function(error, response, body){
            if(response.statusCode == 200){

            // 第四步：根据获取的用户信息进行对应操作
            var student = JSON.parse(body);
            console.log(student);
            studentName = student.data.name;
            console.log(studentName);               

            }else{
                console.log(response.statusCode);
            }

        }
    );
});

//响应signin请求
router.post('/signin',function(req,res){
    console.log(studentId);

	  var message = 0;
    //从页面获取需要存储的信息
    var id = studentId,
        name = studentName,
        latitude = req.body.latitude,
        longitude = req.body.longitude;
    number+=1;

    var newUser = new User({
        id : studentId,
        name: studentName,
        number: number,
        latitude : latitude,
        longitude : longitude
    });
    //根据ID，查询数据库中有无记录
    User.get(id, function (err, user) {
      if (err) {
        console.log('error'+err);
        message = -3;
      }
      
      // if (longitude<116.3491||longitude>116.3526||latitude<39.75685||latitude>39.75772) {
      //   //定位不在学校
      //   console.log('wrong location!');
      //   message = -2;
        
      // }else 
      if (!user) {
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
    });
});

router.get('/info',function(req,res){
  
    console.log('查看取号信息！');

    User.get(studentId, function (err, user) {
        if (!user) {
          console.log('null');
        }
        console.log(user);
        if(err){
          console.log(err);
        }

        if(user){
           res.render('info',{
           user: user
           });
        }
    });
  
});

module.exports = router;
