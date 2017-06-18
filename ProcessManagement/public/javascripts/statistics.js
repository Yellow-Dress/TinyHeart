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
        	var html = '';
        	for(var i=0;i<students.length;i++){
        		html += '<tr>'+
        				'<td>'+students[i].sid+'</td>'+
        				'<td>'+students[i].sname+'</td>'+
        				'<td>'+students[i].title+'</td>'+
        				'</tr>'
        	}
        	console.log(students.length);
        	$('#studentData').html(html)
            //window.location.href = '/home'
        }
	});
}