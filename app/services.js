TypingTestModule.service('backendService', function($http){
    const API = '//localhost/texting-championship/textingAppBackend/api/v0.1/';
    this.getUrl = function(url){
        return API + url; 
    }
    this.request = function(config, onSuccess, onError){
        try{
            $http(config).then(function(successResponse){
                onSuccess(successResponse);
            }, function(errorResponse){
                onError(errorResponse);
            })
        }catch(error){
            console.log(error);
            onError(error);
        }
    }
    this.post = function(url, data, onSuccess, onError){
        this.request({ url: this.getUrl(url), method: 'POST', data: data}, onSuccess, onError);
    }
    this.get = function(url, onSuccess, onError) {
        this.request({ url: this.getUrl(url), method: 'GET'}, onSuccess, onError );
    }
})

TypingTestModule.service('authService', function(backendService){
    var participantName = '';
    var refCode = '';
    var isLogged = false;

    this.getParticipantName = function(){
        return participantName;
    }
    this.getReferenceCode = function() {
        return refCode;
    }
    this.isLoggedIn = function (){
        return isLogged;
    }
    this.loggout = function (){
        participantName =  '';
        refCode = '';
        isLogged = false;
    }
    this.login = function (referenceCode, onSuccess, onError) {
        backendService.post('auth', {code : referenceCode}, function(response){
            if (response.data.error === undefined){
                onSuccess(response.data);
                participantName = response.data.fullname;
                refCode = referenceCode;
                isLogged = true
            }else{
                onError()
            }
        }, function(response){
                onError();
        });
    }
})

TypingTestModule.service('submissionService', function(authService, backendService){
    this.submit = function(results, onSuccess, onError){
        if (authService.isLoggedIn()){
            results['code'] = authService.getReferenceCode();
            backendService.post('submission', results, function(response){
                if (response.status == 201){
                    onSuccess(response.data.score);
                }
            }, function(response){
                onError();
            })
        }
    }
})

TypingTestModule.service('challengeService', function(authService, backendService){
    this.init = function(onSuccess, onError){
        backendService.post('challenge', {'code' : authService.getReferenceCode()}, function(response){
            if (response.data.error === undefined){
                onSuccess(
                    response.data.title, 
                    response.data.passage, 
                    response.data.limit, 
                    response.data.id
                )
            }else{
                onError();
            }
        }, function(response){
            onError();
        })
    }
})

TypingTestModule.service('paginationService', function(){
    this.index = 0;
    this.paginatedList = [];
    this.getList = function(){
        return this.paginatedList[this.index];
    }
    this.resetIndex = function(){
        this.index = 0;
    }
    this.next = function(){
        if (this.index + 1 < this.paginatedList.length){
            ++this.index; 
        }
        return this.paginatedList[this.index];
    }
    this.paginate = function(list, itemsPerview) {
        var listLength = list.length;
        var pageIndex = 0;
        var itemCounter = 0;
        var group = [];
        
        if (listLength > itemsPerview){
            for(var i=0; i < listLength; ++i)
            {
                if(itemCounter >= itemsPerview)
                {
                    group = [];
                    itemCounter = 0;
                    pageIndex++;
                }   
                group[itemCounter] = list[i];
                this.paginatedList[pageIndex] = group
                ++itemCounter;
            }
        }else{
            this.paginatedList[0] = list;
        }
    }
})
TypingTestModule.service('calculationService', function(){
    this.calcGrossWPM = function(inputCount, minutes){
        return inputCount / minutes;
    }
    this.calcNetWPM = function(inputCount, incorrectInputCount, minutes){
        grossWPM = this.calcGrossWPM(inputCount, minutes);
        return Math.floor(grossWPM - (incorrectInputCount / minutes));
    }
    this.calcAccuracy = function(validCount, invalidCount){
        return Math.floor((validCount / invalidCount) * 100);
    }
})
TypingTestModule.service('timerService', function($rootScope, $interval, $timeout){
    seconds = 0;
    timerRunning = false;
    $rootScope.intervalPromise =undefined;
    $rootScope.timeoutPromise = undefined;
    onTimeChange = null;

    runTimer = function () {
        ++seconds;
        onTimeChange(Math.floor(seconds/10), seconds / 10 / 60);
    }

    this.getTimeInMinutes = function() {
        return seconds / 10 / 60;
    }
    
    this.stop = function () {
        if (timerRunning) {
            $interval.cancel($rootScope.intervalPromise);
            $timeout.cancel($rootScope.timeoutPromise);
            $rootScope.intervalPromise =undefined;
            $rootScope.timeoutPromise = undefined;
            timerRunning = false;
        }
    }

    this.clear = function() {
        seconds = 0;
        timerRunning = false;
        $rootScope.intervalPromise = undefined;
        $rootScope.timeoutPromise = undefined;
    }
    
    // Start the timer
    this.start = function (limit, onTimeChange, onTimeout) {
        timerRunning = true;
        onTimeChange = onTimeChange;
        $rootScope.intervalPromise = $interval(runTimer, 100);
        $rootScope.timeoutPromise = $timeout( function (){
            this.stop();
            onTimeout();
        } , limit);
    }
})