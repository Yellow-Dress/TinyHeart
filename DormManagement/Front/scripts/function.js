Zepto(function($){
    $.ajax({
        type: 'POST',
        url: 'http://localhost:4000/checkLogin',
        success: function(data){
            console.log(data)
            if (data.isSuccess == true) {

            } else {
                window.location.href = './index.html';
            }
        },
        error: function(xhr, type){
            console.log(xhr);
            alert('Ajax error!')
        }
    });

    $('.js-dorm').on('click', function() {
        window.location.href = './dormInfo.html';
    });

    $('.js-bed').on('click', function() {
        // TODO: 校验宿舍号信息是否为空，否则要先导入\
        $.ajax({
            type: 'POST',
            url: 'http://localhost:4000/checkDormInfo',
            success: function(data){
                if (data.isConnect == false) {
                    alert('数据库连接失败！');
                } else {
                    if (data.isSuccess == false) {
                        alert('宿舍编号信息为空，请先录入，才可以进行床位信息管理。')
                    } else {
                        window.location.href = './bedInfo.html';
                    }
                }
            },
            error: function(xhr, type){
                console.log(xhr);
                alert('Ajax error!')
            }
        });
    });

    $('.js-list').on('click', function() {
        window.location.href = './studentList.html';
    });
});