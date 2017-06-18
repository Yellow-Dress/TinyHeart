function manualConfirm(){
	var process = $('#process').val();
	var studentId = $('#studentId').val();
	console.log(process);
	console.log(studentId);
	var data = {
		'studentId':studentId,
		'process':process
	}
	var reg = /^\d{8,12}$/;
	//检验输入
	if(reg.test(studentId)&&process.length>0){
		$('.judge').css('display','none');
		$.ajax({
            type: "post",
            url: "/manualConfirm",
            data: JSON.stringify(data),
         	contentType: 'application/json; charset=utf-8',
            dataType: "json",
            success: function(data){
                window.location.href = "/manualConfirm";
            }
        }); 
	}else{
		$('.judge').css('display','inline-block');
	}
}