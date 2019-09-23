TypingTestModule.controller('typingTestController', function($scope, 
    timerService, calculationService, wordsToTypeService, paginationService){
    const WORDS_PER_VIEW = 25; // Total words to display to the user
    const TEXT_ELEMENT_PREFIX = 'txt_'; 
    const txtInputElement = $('#typed_entry');
    let totalWords = 0; // Words to copy length
    let refTxtArray = []; // Hold an array of words
    let typedTxtArray = []; // All user typed entries
    let typedWordIndex = 0;
    let refWordIndex = 0; 
    let initTimer = false;
    let isActive = false;
    let page = paginationService;
    
    start = function () {
       // get the text the user is required to type
       let refTxt = wordsToTypeService.getWordsAsArray();
       totalWords = refTxt.length;
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
    $scope.typedWord = "";
    $scope.strTimer = "00:00:00";
    $scope.correctInputCount = 0;
    $scope.inCorrectInputCount = 0;
    $scope.wpm = 0;
    $scope.accuracy = 0;
    $scope.isComplete = function(){
        if (typedWordIndex >= totalWords){
            stop();
        }
    }
    $scope.checkInput = function($event) {  
        if (isActive === false){ return }
        const charCode = $event.which || $event.keyCode;
        const charTyped = String.fromCharCode(charCode);
        
        // start the timer as soon as the typing starts
        if(initTimer === false){
            initTimer = true;
            timerService.start(70000, stop);
        }

        // Go to the next word if spacebar is clicked
        if (charTyped === " " && charCode == 32)
        {
            // trim white spaces from the reference word and typed word
            let wordTotype =  refTxtArray[refWordIndex].replace(" ", "");
            typedWord = $scope.typedWord.replace(" ", "");
            // don't go to the next word if the current word is empty
            if (typedWord.length <= 0){ return }
            console.log(typedWord + " vs " + wordTotype);
            // Check if typed word is an exact match with reference word
            if (typedWord === wordTotype){
                markTextAsCorrect(refWordIndex);
                $scope.correctInputCount++;
            }else{
                markTextAsIncorrect(refWordIndex);
                $scope.inCorrectInputCount++;
            }
            // Go to next page if they're more words
            if (refWordIndex + 1 >= WORDS_PER_VIEW){
                refTxtArray = page.next();
                buildTextElements(refTxtArray);
                refWordIndex = 0;
                markTextAsActive(refWordIndex);
            }else{
                //Unhighlight current word and mark next word
                makeTextInactive(refWordIndex);
                markTextAsActive(++refWordIndex);
            }
            typedTxtArray[typedWordIndex] = typedWord;
            typedWord = "";
            $scope.wpm = calculationService.calcNetWPM(
                typedTxtArray.length + 1, $scope.inCorrectInputCount, 
                timerService.getTimeInMinutes()
            );
            $scope.accuracy = calculationService.calcAccuracy(
                $scope.correctInputCount, totalWords
            );
            txtInputElement.val('');
            ++typedWordIndex;
        }
    }
    start();
})
