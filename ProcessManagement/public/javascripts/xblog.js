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
