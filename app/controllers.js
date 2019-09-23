TypingTestModule.controller('typingTestController', function($scope, 
    timerService, calculationService, wordsToTypeService, paginationService){
    const WORDS_PER_VIEW = 25;
    const TEXT_ELEMENT_PREFIX = 'txt_';
    const txtInputElement = $('#typed_entry');
    let wordLimit = 0;
    let refTxtArray = [];
    let typedTxtArray = [];
    let typedWordIndex = 0;
    let refWordIndex = 0; 
    let typedWord = "";
    let initTimer = false;
    let isActive = false;
    let page = paginationService;
    
    start = function () {
       let refTxt = wordsToTypeService.getWordsAsArray();
       wordLimit = refTxt.length;
        // paginate reference words to be typed
       page.paginate(refTxt , WORDS_PER_VIEW);
       // get current list of words/first page of words
       refTxtArray = page.getList();
       // Wrap each word as an Html Element with unique id
       buildTextElements(refTxtArray);
       // initially highlight word element
       markTextAsActive(refWordIndex);
       txtInputElement.attr('disabled', false);
       isActive = true;
    }
    stop = function () {
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
        if (typedWordIndex >= wordLimit){
            stop();
        }
    }
    $scope.checkInput = function($event) {  
        if (isActive === false){ return }
        console.log(refWordIndex + " vs " + WORDS_PER_VIEW);
        const charCode = $event.which || $event.keyCode;
        const charTyped = String.fromCharCode(charCode);
        let wordTotype = refTxtArray[refWordIndex].trim();
        typedWord = typedWord.trim();
        
        if(initTimer === false){
            initTimer = true;
            timerService.start(60000, stop);
        }
        if (charTyped === " ")
        {
            if (typedWord.length <= 0){ return }
            if (typedWord === wordTotype){
                markTextAsCorrect(refWordIndex);
                $scope.correctInputCount++;
            }else{
                markTextAsIncorrect(refWordIndex);
                $scope.inCorrectInputCount++;
            }
            
            if (refWordIndex + 1 >= WORDS_PER_VIEW){
                refTxtArray = page.next();
                buildTextElements(refTxtArray);
                refWordIndex = 0;
                markTextAsActive(refWordIndex);
            }else{
                makeTextInactive(refWordIndex);
                refWordIndex++;
                markTextAsActive(refWordIndex);
            }
            
            typedTxtArray[typedWordIndex] = typedWord;
            typedWord = "";
            ++typedWordIndex;
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
