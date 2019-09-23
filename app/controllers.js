TypingTestModule.controller('typingTestController', function($scope, 
    timerService, calculationService, wordsToTypeService){
    const TEXT_ELEMENT_PREFIX = 'txt_';
    const txtInputElement = $('#typed_entry');
    var refTxtArray = [];
    var typedTxtArray = [];
    var wordIndex = 0; 
    var typedWord = "";
    var initTimer = false;
    var isActive = false;

    var start = function () {
       // Get reference sentence/words to be typed by participant
       refTxtArray = wordsToTypeService.getWordsAsArray();
       // Wrapp each word as an Html Element with unique id
       buildTextElements(refTxtArray);
       // initially highlight word element
       markTextAsActive(wordIndex);
       isActive = true;
       txtInputElement.attr('disabled', false);
    }
    var stop = function () {
        timerService.stop();
        isActive = false;
        initTimer = false;
        txtInputElement.attr('disabled', true);
    }
    $scope.strTimer = "00:00:00";
    $scope.timerInMinutes = timerService.getStrTime();
    $scope.correctInputCount = 0;
    $scope.inCorrectInputCount = 0;
    $scope.wpm = 0;
    $scope.accuracy = 0;
    $scope.isComplete = function(){
        if (wordIndex >= refTxtArray.length){
            stop();
        }
    }
    $scope.checkInput = function($event) {  
        if (isActive === false){ return }
        
        const charCode = $event.which || $event.keyCode;
        const charTyped = String.fromCharCode(charCode);
        let wordTotype = refTxtArray[wordIndex].trim();
        typedWord = typedWord.trim();
        
        if(initTimer === false){
            initTimer = true;
            timerService.start(60000, stop);
        }
        if (charTyped === " ")
        {
            if (typedWord.length <= 0){ return }
            if (typedWord === wordTotype){
                markTextAsCorrect(wordIndex);
                $scope.correctInputCount++;
            }else{
                markTextAsIncorrect(wordIndex);
                $scope.inCorrectInputCount ++;
            }
            typedTxtArray[wordIndex] = typedWord;
            makeTextInactive(wordIndex);
            typedWord = "";
            markTextAsActive(++wordIndex);
            $scope.wpm = calculationService.calcNetWPM(
                typedTxtArray.length + 1, $scope.inCorrectInputCount, 
                timerService.getTimeInMinutes()
            );
            $scope.accuracy = calculationService.calcAccuracy(
                $scope.correctInputCount, refTxtArray.length
            );
            txtInputElement.val('');
        } else {
            typedWord += charTyped;
        }
    }
    start();
})
