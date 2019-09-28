TypingTestModule.directive('loading', function(){
    return {
        restrict: 'E',
        replace: true,
        template: '<div class="loading"><img src="res/imgs/loading.gif"></div>',
        link: function (scope, element, attr){
            scope.$watch('activeCalls',function(newVal, oldVal){
                if(newVal >= 1){
                    $(element).fadeIn(300);
                }else{
                    $(element).fadeOut(300);
                }
            })
        }
    }
})