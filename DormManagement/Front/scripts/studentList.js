Zepto(function($){

    var studentInfosBackup = {};

    var studentInfo_vm = new Vue({
        el: '#studentInfo',
        data: {
            studentInfos: {},
            alreadyCount: 0
        },
        methods: {

        }
    }); 

    $.ajax({
        type: 'POST',
        url: 'http://localhost:4000/checkLogin',
        success: function(data){
            if (data.isSuccess == true) {
                $.ajax({
                    type: 'POST',
                    url: 'http://localhost:4000/getErrorMsg',
                    data: { from: 'student' },
                    dataType: 'json',
                    success: function(data){
                        if (data.hasContent == true) {
                            alert(data.errorMsg);
                        }
                    },
                    error: function(xhr, type){
                        console.log(xhr);
                        alert('Ajax error!')
                    }
                });

                $.ajax({  
                    type: 'POST',
                    url: 'http://localhost:4000/getStudentInfos',
                    dataType: 'json',
                    success: function(data){
                        if (data.isConnect == false) {
                            alert('数据库连接失败！');
                        } else {
                            if (data.isSuccess == false) {
                                alert('查询失败！');
                            } else {
                                studentInfo_vm._data.studentInfos = data.studentInfos.concat();                           
                                studentInfosBackup = data.studentInfos.concat();                                                          
                                studentInfo_vm._data.alreadyCount = data.alreadyCount;
                            }
                        }
                    },
                    error: function(xhr, type){
                        console.log(xhr);
                        alert('Ajax error!')
                    }
                });
            } else {
                window.location.href = './index.html';
            }
        },
        error: function(xhr, type){
            console.log(xhr);
            alert('Ajax error!')
        }
    });

    // 清空
    $('.js-empty').on('click', function() {
        var emptyCheck = confirm("确认清空吗？");
        if (emptyCheck == true) {
            $.ajax({
                type: 'POST',
                url: 'http://localhost:4000/emptyStudents',
                dataType: 'json',
                success: function(data){
                    if (data.isConnect == false) {
                        alert('数据库连接失败！');
                    } else {
                        if (data.isSuccess == false) {
                            if (data['errorMsg'] != undefined) {
                                alert(data['errorMsg']);
                            } else {
                                alert('清空失败！');
                            }              
                        } else {
                            studentInfo_vm._data.studentInfos = [];
                            studentInfosBackup = [];
                            alert('已成功清空！');
                        }
                    }
                },
                error: function(xhr, type){
                    console.log(xhr);
                    alert('Ajax error!')
                }
            });   
        }

    });

    // 返回功能选择
    $('.js-func').on('click', function() {
        window.location.href = './chooseFunc.html';
    });

    // 注销并退出
    $('.js-logout').on('click', function() {
        var logoutCheck = confirm("确认退出吗？");
        if (logoutCheck == true) {
            $.ajax({
                type: 'POST',
                url: 'http://localhost:4000/logout',
                dataType: 'json',
                success: function(data){
                    if (data.isSuccess == true) {
                        window.location.href = './index.html';
                    } else {
                        alert('注销失败，请重试！');
                    }
                },
                error: function(xhr, type){
                    console.log(xhr);
                    alert('Ajax error!')
                }
            });    
        }
    });

    // 冒泡捕获
    $('.js-tbody').on('click', function(e) {
        if (e.target.tagName == 'TD') {
            cancelChecked();
            $(e.target).parents('tr').find('.js-selectOne')[0].checked ? 
                $(e.target).parents('tr').find('.js-selectOne')[0].checked = false :
                $(e.target).parents('tr').find('.js-selectOne')[0].checked = 'checked';
            e.stopPropagation();
        }
        
    })

    // 上传要导入的excel文件
    $('.js-upload').on('click', function(e) {
        e.preventDefault();

        $('#uploadDormInfo').trigger('click');
    });

    $('#uploadDormInfo').on('change', function(e) {
        var path = $('#uploadDormInfo').val();

        var tempArr = path.split('\\');
        
        if (tempArr[tempArr.length - 1].indexOf('.xlsx') != -1) {
            $('#uploadDormInfoForm').submit();
        } else {
            alert('上传文件格式有误！');
        }
    })

    $('.js-delete').on('click', function() {
        var checkboxs = $('.js-selectOne').filter(function() {
            return this.checked == true;
        })

        if (checkboxs.length == 0) {
            alert("请选择一个学生！");
            return;
        }

        if (checkboxs.length > 1) {
            alert("只能选择一个学生！");
            return;
        }
        
        var studentInfoBlock = $(checkboxs[0]).parents('tr');

        var deleteCheck = confirm('确认删除吗？');
        if (deleteCheck == true) {
       
            var index = studentInfoBlock.data('index'),
                studentInfoObj = studentInfo_vm._data.studentInfos[index];
            
            $.ajax({
                type: 'POST',
                url: 'http://localhost:4000/deleteStudent',
                data: studentInfoObj,
                dataType: 'json',
                success: function(data){
                    if (data.isConnect == false) {
                        alert('数据库连接失败！');
                    } else {
                        if (data.isSuccess == false) {
                            if (data['errorMsg'] != undefined) {
                                alert(data['errorMsg']);
                            } else {
                                alert('删除失败！');
                            }              
                        } else {
                            var backupIndex = studentInfosBackup.indexOf(studentInfoObj);
                            
                            studentInfo_vm._data.studentInfos.splice(index, 1);
                            studentInfosBackup.splice(backupIndex, 1);

                            alert('已成功删除该学生信息！');
                            cancelChecked();
                        }
                    }
                },
                error: function(xhr, type){
                    console.log(xhr);
                    alert('Ajax error!')
                }
            });            
        }
    })

    $('.js-output').on('click', function() {

    });
    
    $('.js-add').on('click', function(e) {
        $('.modal').show();
        e.stopPropagation();
    });

    $('.js-cancel').on('click', function(e) {
        clearModal();
        $('.modal').hide();
        e.stopPropagation();
    });

    //清空模态框内容
    function clearModal() {
        $('.js-studentNo').val('');
        $('.js-studentName').val('');
    }

    $('.js-submit').on('click', function() {

        var studentNo = $('.js-studentNo').val().trim(),
            studentName = $('.js-studentName').val().trim(),
            sex = parseInt($('.js-sex').val());
        
        if (studentNo.length == 0 || studentName.length == 0 || sex.length == 0) {
            alert('输入信息不完全！');
            return;
        }

        // var re = /^\d{10}$/;
        // if (!re.test(studentNo)) {
        //     alert('学号输入有误。')
        //     return;
        // }

        $.ajax({
            type: 'POST',
            url: 'http://localhost:4000/addStudent',
            data: { studentNo: studentNo, studentName: studentName, sex: sex },
            dataType: 'json',
            success: function(data){
                if (data.isConnect == false) {
                    alert('数据库连接失败！');
                } else {
                    if (data.isSuccess == false) {
                        if (data['errorMsg'] != undefined) {
                            alert(data['errorMsg']);
                        } else {
                            alert('新增失败！');
                        }              
                    } else {
 
                        studentInfo_vm._data.studentInfos.push({ studentNo: studentNo, studentName: studentName, sex: sex });
                        studentInfosBackup.push({ studentNo: studentNo, studentName: studentName, sex: sex });

                        clearModal();
                        $('.modal').hide();
                        alert('新增学生成功！');
                    }
                }
            },
            error: function(xhr, type){
                console.log(xhr);
                alert('Ajax error!')
            }
        });

    });


    $('.js-studentNo-search').on('click', function() {
        var studentNo = $('#studentNo-input').val().trim();

        if (studentNo.length == 0) {
            studentInfo_vm._data.studentInfos = studentInfosBackup.concat();
            alert('请输入要查询的学号。');
            return;
        }

        var studentInfos = studentInfo_vm._data.studentInfos.filter(function(elem) {
            return elem.studentNo.indexOf(studentNo) != -1;
        });

        if (studentInfos.length != 0) {
            studentInfo_vm._data.studentInfos = studentInfos;
        } else {
            alert('查无此学号。');
        }
    });

    $('#studentNo-input').on('keypress', function(e) {
        var e = e || window.event;

        if (e.keyCode == 13) {
            $('.js-studentNo-search').trigger('click');
        } 

    });

    $('#studentNo-input').on('input', function(e) {
        var studentNoInput = $(this);

        if (studentNoInput.val().trim().length == 0) {
            studentInfo_vm._data.studentInfos = studentInfosBackup.concat();
        }
    })
    
    function cancelChecked() {
        var checkboxs = $('.js-selectOne').filter(function() {
            return this.checked == true;
        });

        checkboxs.forEach(function(element) {
            element.checked = false;
        });  
    }
});
