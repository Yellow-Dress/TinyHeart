var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var UserController = require('../controllers/userController');
var ProcessController = require('../controllers/processController');
var StudentController = require('../controllers/studentController');
var qr_image = require('qr-image');  

/**
 * 登录
 */
router.get('/',checkIsLogin);
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
      title: '流程管理系统',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
  });
});

router.post('/',UserController.login);

/**
 * 注册
 */
router.get('/register',checkIsLogin);
router.get('/register',function(req,res){
    res.render('register',{
        title:'注册',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
});
router.post('/register',UserController.register);

/**
 * 验证码
 * @param  {[type]} req    [description]
 * @param  {[type]} res){                 var captchapng [description]
 * @return {[type]}        [description]
 */
router.route('/captcha.png').get(function(req,res){
    var captchapng = require('captchapng');
    if(req.url.indexOf('/captcha.png')==0) {
        var num = parseInt(Math.random()*9000+1000);
        var p = new captchapng(80,30,num); // width,height,numeric captcha
        p.color(0, 0, 0, 0);  // First color: background (red, green, blue, alpha)
        p.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha)
        req.session.captcha = num;
        var img = p.getBase64();
        var imgbase64 = new Buffer(img,'base64');
        res.writeHead(200, {
            'Content-Type': 'image/png'
        });
        res.end(imgbase64);
    } else res.end('');
console.log('Web server started.\n http:\\\\127.0.0.1:8181\\captcha.png');
});

/**
 * 主页
 */
router.get('/home',checkLogin);
router.get('/home', function(req,res){
    ProcessController.getProcessList(req,res,'web');
});

/**
 * 流程详情页
 */
router.get('/detail*',checkLogin);
router.get('/detail*', function(req,res){
    ProcessController.getProcessDetailById(req,res,'detail');
});

/**
 * [移动端]
 * @param  {[type]} req    [description]
 * @param  {[type]} res){                 ProcessController.getProcessList(req,res,'mobile');} [description]
 * @return {[type]}        [description]
 */
router.get('/mobileHome',function(req,res){
    ProcessController.getProcessList(req,res,'mobile');
});
router.get('/mobileDetail*', function(req,res){
    ProcessController.getProcessDetailById(req,res,'mobile');
});
/**
 * 添加流程页
 */
router.get('/post',checkLogin);
router.get('/post', function(req, res) {

    res.render('post', { 
        title: '发布流程', 
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });

});

router.post('/postProcess', checkLogin);
router.post('/postProcess', ProcessController.addProcess);

/**
 * 更新流程排序
 */
router.post('/updateSeq', checkLogin);
router.post('/updateSeq', ProcessController.updateProcessSeq);

router.get('/edit',checkLogin);
router.get('/edit*',function(req,res) {
    ProcessController.getProcessDetailById(req,res,'edit')
});
/*
 * 更新流程
 */
router.post('/editProcess', checkLogin);
router.post('/editProcess',ProcessController.updateProcess);
/**
 * 删除流程
 */
router.post('/deleteProcess',checkLogin);
router.post('/deleteProcess',ProcessController.deleteProcess);

/**
 * 扫描二维码对应事件
 */
router.get('/handleCode',StudentController.handleCode);

router.get('/processConfirm',ProcessController.processConfirm);

/**
 * [生成二维码]
 * @param  {[type]} req    []
 * @param  {[type]} res){                 var code [加密后的ID]
 * @return {[type]}        [description]
 */
router.get('/qrcode*',function(req,res){
    var code = req.query.code;
    console.log(code);
    var host = 'xixi.lilingkun.com:3000';
    var redirectUrl = "http://"+host+"/handleCode?codeurl="+code;
    var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx1d3765eb45497a18&redirect_uri='+redirectUrl+'&response_type=code&scope=snsapi_base&state=1#wechat_redirect';
    var temp_qrcode = qr_image.image(url); 
    res.type('png');  
    
    temp_qrcode.pipe(res);  
}) 
/**
 * 注销
 */
router.get('/logout',checkLogin);
router.get('/logout',function(req,res){
    req.session.user = null;
    console.log('aa');
    req.flash('success','注销成功！');
    res.redirect('/');
   
});

/**
 * [checkLogin 判断是否登录]
 * @param  {[type]}   req  [request]
 * @param  {[type]}   res  [response]
 * @param  {Function} next [继续执行]
 */
function checkLogin(req, res, next){
    console.log("check1");
    if(!req.session.user){
        req.flash('error', '未登录！');
        res.redirect('/');
    }
    next();
}
/**
 * [checkIsLogin 判断是否已经登录]
 * @param  {[type]}   req  [request]
 * @param  {[type]}   res  [response]
 * @param  {Function} next [继续执行]
 */
function checkIsLogin(req, res, next){
    console.log("check2");
    if(req.session.user != null){
        req.flash('error', '已登录！');
        res.redirect('/home');
    }
    next();
}

/**
 * [judgeNamePassword 判断用户输入是否合法]
 * @param  {[type]} req      [request]
 * @param  {[type]} res      [response]
 * @param  {[type]} username [用户名]
 * @param  {[type]} password [密码]
 * @param  {[type]} url      [跳转地址]
 */
function judgeNamePassword(req,res,username,password,url){
	var regEx = /^[a-zA-Z0-9_]{3,20}$/;
	if(!regEx.test(username)){
		req.flash('error','用户名长度为3-20，只能是字母、数字、下划线的组合');
		return res.redirect(url);
	}

	var judge =  (/[a-z]/.test(password)&& /[A-Z]/.test(password) && /[0-9]/.test(password));
    if(!judge){
    	req.flash('error','密码长度不少于6，必须同时包含数字、小写字母、大写字母');
        return res.redirect(url);
    }
}

module.exports = router;

