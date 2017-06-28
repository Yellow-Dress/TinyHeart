function changeCode() {
    //alert("xx");
    $("#kaptchaImage").attr("src", "/captcha.png?rand=" + Math.random());
}

/**
 * [adjustFin 调整状态s]
 * @return {[type]} [description]
 */
function adjustFin() {
	var adjustList = [];
    $('.adjust').attr('disabled', 'true');
    $('.adjust-fin').css('display', 'none');
    $("tbody tr").each(function() {
        var seq = $(this).find("td").eq(1).html();
    	adjustList.push(Number(seq));
    });
    console.log(adjustList);
    var data = {
        'list' : adjustList
    };
    $.ajax({
         type: "post",
         url: "/updateSeq",
         data: JSON.stringify(data),
         contentType: 'application/json; charset=utf-8',
         dataType: "json",
         success: function(data){
            window.location.href = '/home'
        }
     });
}

/**
 * [adjustSeq 调整按钮状态]
 * @return {[type]} [description]
 */
function adjustSeq() {
    $('.adjust').removeAttr('disabled');
    $('.adjust-fin').css('display', 'inline-block');
}
/**
 * [up 上移]
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
function up(obj) {
    var objParentTR = $(obj).parent().parent();
    var prevTR = objParentTR.prev();
    if (prevTR.length > 0) {
        prevTR.insertAfter(objParentTR);
    }
}
/**
 * [down 下移]
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
function down(obj) {
    var objParentTR = $(obj).parent().parent();
    var nextTR = objParentTR.next();
    if (nextTR.length > 0) {
        nextTR.insertBefore(objParentTR);
    }
}
/**
 * [deleteProcess 删除流程]
 * @param  {[type]} id [流程ID]
 * @return {[type]}    [description]
 */
function deleteProcess(id){
    var data = {
        'id': id
    };
    $.ajax({
        type : 'post',
        url : '/deleteProcess',
        data : JSON.stringify(data),
        contentType: 'application/json; charset=utf-8',
        dataType: "json",
        success: function(data){
            window.location.href = '/home'
        }
    })
}

var url = '';
function seeCode(code){
    console.log(code);
    var host = 'xixi.lilingkun.com:3000/';
    // var redirctUrl = "http://"+host+"/handleCode?code="+code;
    // //var wxUrl =  "https://qy.weixin.qq.com/cgi-bin/loginpage?corp_id=wx1d3765eb45497a18&redirect_uri="+redirctUrl+"&state=xxxx&usertype=member"
    // var wxUrl = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx1d3765eb45497a18&redirect_uri="+redirctUrl+"&response_type=code&scope=snsapi_base&state=1#wechat_redirect";
    // url = "http://www.kuaizhan.com/common/encode-png?large=true&data="+wxUrl;
    url = "http://"+host+"qrcode?code="+code
    $("#imgSrc").attr('src',url); 
}

function downloadPic(){
    var alink = document.createElement("a");
    alink.href = url;
    alink.download = "code.jpg";
    alink.click();
}
