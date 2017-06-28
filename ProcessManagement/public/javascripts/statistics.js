$(document).ready(getStudentList());


function getStudentList(){
	var processId = $('#processName').val();
	var processStatus = $('#processStatus').val();
	console.log(processId);
	console.log(processStatus);
	var data = {
		processId : processId,
		processStatus : processStatus
	}
	$.ajax({
		type: "get",
        url: "/getStudentList",
        data: data,
        success: function(data){
        	console.log(data);
        	var students = data.data;
            var len = students.length;
        	var html = '';
        	for(var i=0;i<students.length;i++){
        		html += '<tr>'+
        				'<td>'+students[i].sid+'</td>'+
        				'<td>'+students[i].sname+'</td>'+
        				'<td>'+students[i].title+'</td>'+
        				'</tr>'
        	}
            $('#stuNum').html(len);
        	
        	$('#studentData').html(html)
            //window.location.href = '/home'
        }
	});
}