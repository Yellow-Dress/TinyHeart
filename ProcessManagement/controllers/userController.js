var crypto = require('crypto');
module.exports = {
    login: function(req,res){
        var email =  req.body.email;
        var password = req.body.password;
        var md5 = crypto.createHash('md5');
        console.log('test');
        password = md5.update(password).digest('hex');
        req.models.user.find({user_name: email}).exec(function(err, user){
            if (user.length==0) {
                req.flash('error', '用户不存在!'); 
                return res.redirect('/');//用户不存在则跳转到登录页
            }
            console.log(user.user_password);
            if (user[0].user_password != password) {
                req.flash('error', '密码错误!'); 
                return res.redirect('/');
            }
            req.session.user = user[0];
            req.flash('success', '登录成功!');
            return res.redirect('/home');
        });
    },
    register: function(req,res){
        var email = req.body.email,
            password = req.body.password,
            password_re = req.body['password-repeat'],
            captcha = req.body.captcha;
        if(password != password_re) {
            req.flash('error','两次输入的密码不一致！');
            return res.redirect('/register');
        }
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        var User = {
            user_password : password,
            user_name : email
        };
        //console.log(newUser);
        //检查用户名是否已经存在 
        req.models.user.find({user_name: email}).exec(function(err, user){
            if (user.length!=0) {
                req.flash('error', '用户已存在！');
                console.log('already exited! ');
              
                return res.redirect('/register');//返回注册页
            }
            if (err) {
              req.flash('error', err);
              console.log('error'+err);
              return res.redirect('/');
            }
            if (captcha != req.session.captcha){
              req.flash('error', '验证码输入错误！');
              console.log('captcha wrong! ');
              
              return res.redirect('/register');//返回注册页
            }
            //如果不存在则新增用户
            req.models.user.create(User).exec(function(err,result){
                if (err) {
                    req.flash('error', err);
                    console.log('error'+err);
                    return res.redirect('/register');//注册失败返回注册页
                }
                //req.session.user = newUser;//用户信息存入 session
                console.log('success');
                req.flash('success', '注册成功!');
                return res.redirect('/');//注册成功后返回主页
            });

        });
    }
}