Zepto(function($){
    var stuid = localStorage.getItem('stuid');

    var personalPage_vm = new Vue({
        el: '#container',
        data: {
            studentName: '未知',
            code: '',
            available: true,
            distributed: false,
            buildingNo: '',
            roomNo: '',
            bedNo: ''
        },
        methods: {
            goToCheckDorm: function(event) {
                window.location.href = "./checkDorm.html";
            }
        }
    });

    if (stuid != undefined) {
        $('#loadingMsg').html('加载中');
        $('#loadingToast').css('opacity', 1);
        $('#loadingToast').show();

        $.ajax({  
            type: 'POST',
            url: 'http://localhost:4000/fetchStudentInfo',
            data: { stuid: stuid },
            dataType: 'json',
            success: function(data){

                if (data.isConnect == false) {
                    alert('数据库连接失败！');
                } else {
                    if (data.isSuccess == false) {
                        alert('查询失败！');
                    } else {
                        personalPage_vm.studentName = data.studentInfo[0].studentName;                           
                        personalPage_vm.code = data.studentInfo[0].code;     

                        $.ajax({  
                            type: 'POST',
                            url: 'http://localhost:4000/checkStudentStatus',
                            data: {stuid: stuid},
                            dataType: 'json',
                            success: function(data){
       
                                if (data.isConnect == false) {
                                    alert('数据库连接失败！');
                                } else {
                                    if (data.isSuccess == false) {
                                        alert('查询失败！');
                                    } else {
                                        if (data.dormStatus != undefined) {
                                            personalPage_vm._data.buildingNo = data.dormStatus.buildingNo;
                                            personalPage_vm._data.roomNo = data.dormStatus.roomNo;
                                            personalPage_vm._data.bedNo = data.dormStatus.bedNo;
                                            personalPage_vm._data.distributed = true;    
                                            
                                            $('#loadingToast').css('opacity', 0);
                                            $('#loadingToast').hide();                           
                                        } else {
                                            $.ajax({  
                                                type: 'POST',
                                                url: 'http://localhost:4000/checkOpenTime',
                                                dataType: 'json',
                                                success: function(data){
                        
                                                    if (data.isConnect == false) {
                                                        alert('数据库连接失败！');
                                                    } else {
                                                        if (data.isSuccess == false) {
                                                            alert('查询失败！');
                                                        } else {
                                                            var d = new Date(data.time.limitTime).getTime() - Date.now();

                                                            if (d < 0) {
                                                                personalPage_vm.available = true;
                                                            }                                                                           
                                                        }
                                                    }

                                                    $('#loadingToast').css('opacity', 0);
                                                    $('#loadingToast').hide();       
                                                },
                                                error: function(xhr, type){
                                                    console.log(xhr);
                                                    alert('Ajax error!')
                                                }
                                            }); 
                                        }             
                                    }
                                }
                            },
                            error: function(xhr, type){
                                console.log(xhr);
                                alert('Ajax error!')
                            }
                        });                                                                        
                    }
                }
            },
            error: function(xhr, type){
                console.log(xhr);
                alert('Ajax error!')
            }
        });
    } else {
        alert('请从企业号进入！');
    }
});