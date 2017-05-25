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
        // TODO: 校验宿舍号信息是否为空，否则要先导入
        window.location.href = './bedInfo.html';
    });
});