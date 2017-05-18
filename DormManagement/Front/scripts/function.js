Zepto(function($){
    $('.js-dorm').on('click', function() {
        window.location.href = './dormInfo.html';
    });

    $('.js-bed').on('click', function() {
        // TODO: 校验宿舍号信息是否为空，否则要先导入
        window.location.href = './bedInfo.html';
    });
});