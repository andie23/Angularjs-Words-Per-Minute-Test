TypingTestModule.service('wordsToTypeService', function(){
    this.getWordsAsTxt = function () {
        return "Sometimes I feel like I don't belong anywhere, & it's gonna take so long for me to get to somewhere, Sometimes I feel so heavy hearted, but I can't explain cuz I'm so guarded. But that's a lonely road to travel, and a heavy load to bear. And it's a long, long way to heaven but I gotta get there Can you send an angel? Can you send me an angel...to guide me.";
    };
    this.getWordsAsArray = function() {
        return this.getWordsAsTxt().split(' ');
    }
})
TypingTestModule.service('paginationService', function(){
    this.index = 0;
    this.paginatedList = [];
    this.getList = function(){
        return this.paginatedList[this.index];
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
        return (inputCount) / minutes;
    }
    this.calcNetWPM = function(inputCount, incorrectInputCount, minutes){
        grossWPM = this.calcGrossWPM(inputCount, minutes);
        return Math.floor(grossWPM - (incorrectInputCount / minutes));
    }
    this.calcAccuracy = function(validCount, invalidCount){
        return Math.floor((validCount / invalidCount) * 100);
    }
})
TypingTestModule.service('timerService', function($interval, $timeout){
    timerElement = $('#timer');
    timer = [0, 0, 0, 0];
    timerRunning = false;
    timerMins = 0.0;
    intervalPromise = null;
    timeoutPromise = null;

    // Add leading zero to numbers 9
    leadingZero = function (time) {
        if (time <= 9) {
            time = "0" + time;
        }
        return time;
    }

    // Create a Clock
    runTimer = function () {
        let currentTime = leadingZero(timer[0]) + ":" + leadingZero(timer[1]) + ":" + leadingZero(timer[2]);
        timerElement.text(currentTime);
        timer[3]++;
        timerMins = (timer[3] / 100) / 60;
        timer[0] = Math.floor(timerMins); 
        timer[1] = Math.floor((timer[3] / 100) - (timer[0] * 60));
        timer[2] = Math.floor(timer[3] - (timer[1] * 100) - (timer[0] * 6000));
    }
    
    //get timer in words
    this.getStrTime = function () {
       return leadingZero(timer[0]) + ":" + leadingZero(timer[1]) + ":" + leadingZero(timer[2]);
    }
    
    // get numberical number
    this.getTimeInMinutes = function() {
        return timerMins;
    }
    
    //Reset Everthing
    this.stop = function () {
        if (timerRunning) {
            $interval.cancel(intervalPromise);
            $timeout.cancel(timeoutPromise);
            intervalPromise = null;
            timeoutPromise = null;
            timerRunning = false;
        }
    }

    this.clear = function() {
        timer = [0, 0, 0, 0];
        timerRunning = false;
        timerMins = 0.0;
        intervalPromise = null;
        timeoutPromise = null;
        timerElement.text(this.getStrTime());
    }
    
    // Start the timer
    this.start = function (limit, callback) {
        timerRunning = true;
        intervalPromise = $interval(runTimer, 10);
        timeoutPromise = $timeout( function (){
            this.stop();
            callback();
        } , limit);
    }
})