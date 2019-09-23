TypingTestModule.service('wordsToTypeService', function(){
    this.getWordsAsTxt = function () {
        return "Imagination is more important than knowledge. For knowledge is limited to all we now know and understand, while imagination embraces the entire world, and all there ever will be to know and understand.";
    }();
    this.getWordsAsArray = function() {
        return this.getWordsAsTxt.split(' ');
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
            timerRunning = false;
        }
    }

    // Start the timer
    this.start = function (limit, callback) {
        timerRunning = true;
        intervalPromise = $interval(runTimer, 10);
        $timeout( function (){
            this.stop();
            callback();
        } , limit);
        
    }
})