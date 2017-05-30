var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var UserController = require('../controllers/userController');
var ProcessController = require('../controllers/processController');

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
router.get('/home', ProcessController.getProcessList);

/**
 * 流程详情页
 */
router.get('/detail*',checkLogin);
router.get('/detail*', function(req,res){
    ProcessController.getProcessDetailById(req,res,'detail');
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

router.post('/deleteProcess',checkLogin);
router.post('/deleteProcess',ProcessController.deleteProcess);
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

