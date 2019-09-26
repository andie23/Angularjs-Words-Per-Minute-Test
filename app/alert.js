var appAlert = {};

appAlert.success= function(message){
    $('#alert-section').html(
        '<div class="alert alert-success alert-dismissible fade show text-center" role="alert">'+
            message +
        '<button type="button" class="close" data-dismiss="alert" aria-label="Close">'+
        '<span aria-hidden="true">&times;</span>' +
        '</button>'  +
        '</div>'
    );
}

appAlert.error = function(message){
    $('#alert-section').html(
        '<div class="alert alert-danger alert-dismissible fade show text-center" role="alert">'+
            message +
        '<button type="button" class="close" data-dismiss="alert" aria-label="Close">'+
        '<span aria-hidden="true">&times;</span>' +
        '</button>'  +
        '</div>'
    );
}