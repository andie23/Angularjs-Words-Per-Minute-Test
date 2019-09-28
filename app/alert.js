var appAlert = {};

appAlert.setAlert = function(message, styleClass){
    $('<div class="alert ' + styleClass + ' alert-dismissible fade show text-center" role="alert">'+
            message +
        '<button type="button" class="close" data-dismiss="alert" aria-label="Close">'+
        '<span aria-hidden="true">&times;</span>' +
        '</button>'  +
        '</div>').appendTo('#alert-section');
}
appAlert.success= function(message){
    appAlert.setAlert(message, 'alert-success');
}

appAlert.error = function(message){
    appAlert.setAlert(message, 'alert-danger');
}