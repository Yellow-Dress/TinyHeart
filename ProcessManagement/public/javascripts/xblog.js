function changeCode() {
    //alert("xx");
    $("#kaptchaImage").attr("src", "/captcha.png?rand=" + Math.random());
}

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

function adjustSeq() {
    $('.adjust').removeAttr('disabled');
    $('.adjust-fin').css('display', 'inline-block');
}

function up(obj) {
    var objParentTR = $(obj).parent().parent();
    var prevTR = objParentTR.prev();
    if (prevTR.length > 0) {
        prevTR.insertAfter(objParentTR);
    }
}

function down(obj) {
    var objParentTR = $(obj).parent().parent();
    var nextTR = objParentTR.next();
    if (nextTR.length > 0) {
        nextTR.insertBefore(objParentTR);
    }
}
