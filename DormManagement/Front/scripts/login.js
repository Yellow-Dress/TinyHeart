Zepto(function($){

    window.G = window.G || {};
    
    var vm = new Vue({
        el: '#login',
        data: {

        }
    });

    $('.js-login').on('click', function(e) {
        var username = $('.js-username').val();
        var password = $('.js-password').val();

        if (username.trim() == '' || password.trim() == '') {
            alert("请输入用户名和密码");
            return;
        }

        $.ajax({
            type: 'POST',
            url: 'http://localhost:4000/login',
            data: { 
                username: username,
                password: password
            },
            dataType: 'json',
            success: function(data){
                if (data.isConnect == false) {
                    alert('数据库连接失败！');
                } else {
                    if (data.isSuccess == false) {
                        alert('用户名或密码输入错误！');
                    } else {
                        window.location.href = './chooseFunc.html';
                    }
                }
            },
            error: function(xhr, type){
                console.log(xhr);
                alert('Ajax error!')
            }
        });
    })
});

