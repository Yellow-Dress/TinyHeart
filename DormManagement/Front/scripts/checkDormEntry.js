Zepto(function($){

    var code = getQueryString('code');

    localStorage.removeItem('stuid');

    if (code != null) {
        $('#loadingMsg').html('身份校验中');
        $('#loadingToast').css('opacity', 1);
        $('#loadingToast').show();
        $.ajax({  
            type: 'POST',
            url: 'http://localhost:4000/validateStudent',
            dataType: 'json',
            data: { code: code },
            success: function(data){
                if (data.isSuccess != undefined && data.isSuccess == false) {
                    alert('服务器连接出现问题，请重新进入。');
                    return;
                } 
               
                if (data.isValidate != undefined && data.isValidate == false) {
                    alert('您尚未完成企业号身份验证。');
                    return;
                }

                if (data.isConnect != undefined && data.isConnect == false) {
                    alert('数据库连接失败！');
                    return;
                }              
                
                if (data.isValid != undefined && data.isValid == true) {
                    $('#loadingToast').css('opacity', 0);
                    $('#loadingToast').hide();    
                    localStorage.setItem('stuid', data.stuid);
                    window.location.href = "./personalPage.html";
                    return;
                }

                $('#loadingToast').css('opacity', 0);
                $('#loadingToast').hide();    
            },
            error: function(xhr, type){
                console.log(xhr);
                alert('Ajax error!')
            }
        });
    } else {
        alert('请从企业号进入！');
    }

    function getQueryString(name) {
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");

        var r = decodeURI(window.location.search).substr(1).match(reg);

        if(r != null) return r[2]; return null;
    }
});