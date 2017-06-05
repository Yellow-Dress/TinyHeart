//获取用户信息接口，暂时未实现
var express = require('express');
var router = express.Router();
var request = require('request');

/* 微信登陆 */
var corpid = "wx1d3765eb45497a18";
var corpsecret = "QEr6U8_nqdz9zlo4SsXtmy8JNWuYVlIDT76VisdwTCkAjgw280jdcPEKN98fgkd4";
router.get('/', function(req,res, next){
    //console.log("oauth - login")

    // 第一步：用户同意授权，获取code
    var router = '/code';
    // 这是编码后的地址
    var return_uri = 'http://xixi.lilingkun.com:3000/'+router;  
    var scope = 'snsapi_base';

    res.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid='+corpid+'&redirect_uri='+return_uri+'&response_type=code&scope='+scope+'&state=STATE#wechat_redirect');

});


router.get('/get_wx_access_token', function(req,res, next){
    //console.log("get_wx_access_token")
    //console.log("code_return: "+req.query.code)

    // 第二步：通过code换取网页授权access_token
    var code = req.query.code;
    request.get(
        {   
            url:'https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token=' + 'hzy4DgfDsnVkdUpLPmQzlGOKgGDETjBcCwBCIzfylr1pg0SM8lbAElhu8zVN6C6p' + '&code=' + code,
        },
        function(error, response, body){
            if(response.statusCode == 200){

            // 第四步：根据获取的用户信息进行对应操作
            var userinfo = JSON.parse(body);
            studentId = userinfo.UserId;
            console.log('获取微信信息成功！');
            console.log(studentId);               

            }else{
                console.log(response.statusCode);
            }

        }
    );
    
    return res.redirect('/signin');
});
module.exports = router;