//点击响应事件
function signIn() {
    var name = $('#inputName').val();
    var id = $('#inputID').val();
    var latitude = $('#latitude').text();
    var longitude = $('#longitude').text();
    var speed = $('#speed').text();
    var accuracy = $('#accuracy').text();
    var data = "name="+name+"&id="+id+"&latitude="+latitude+"&longitude="+longitude;
    //ajax请求
    $.ajax({ 
        url: '/signin',
        type: 'post',
        data: data,
        success: function(data,status){ 
          console.log(data);
          $('#tips').css('display','true');
          //根据回传的信息值，在页面打印出不同的反馈
          if(data.message == -1){ 
            $('#tips').html('该学号已取号');
          }else if(data.message == 0){ 
            $('#tips').html('签到成功');
            window.location.href='/info';
          }else if(data.message == -2){ 
            $('#tips').html('请在学校范围内取号');
          }else{
            $('#tips').html('签到失败');
          }
        },
        error: function(data,err){ 
        }
    }); 
	
}


