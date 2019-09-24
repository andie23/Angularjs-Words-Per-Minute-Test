TypingTestModule.controller('TypingTestController', function($scope, 
    timerService, calculationService, wordsToTypeService, paginationService){
    
    const WORDS_PER_VIEW = 25; // Total words to display in text_to_copy
    const txtInputElement = $('#typed_entry');  // Input area where words will be typed
    const refTxtElement = $('#text_to_copy'); // A paragraph a participant is supposed to copy
    const typedParagraphElement = $('#typed_paragraph'); // a view showing what was actually typed
    const refParagraphElement = $('#reference_paragraph');
    const refParagraphTxtBodyElement = $('#reference_paragraph_preview');
    const testingSectionElement = $('#testing_section'); //section holding the inputbox and paragraph to be copied
    
    let totalWords = 0; // Words to copy length
    let refTxt = '';
    let refTxtArray = []; // Hold an array of words
    let typedTxtArray = []; // All user typed entries
    let typedWordIndex = 0;
    let refWordIndex = 0; 
    let isInit = false;
    let isActive = false;
    let page = paginationService;
    
    start = function () {
       paragraph = wordsToTypeService;
       refTxt = paragraph.getWordsAsTxt();
       refTxtArray = paragraph.getWordsAsArray();
       totalWords = refTxtArray.length;
        // paginate reference words to be typed
       page.paginate(refTxtArray, WORDS_PER_VIEW);
       // get current list of words/first page of words
       refTxtArray = page.getList();
       // Wrap each word as an Html Element with unique id
       buildTextElements(refTxtArray);
       // highlight the first word in the paragraph
       markTextAsActive(refWordIndex);
       txtInputElement.attr('disabled', false);
       typedParagraphElement.addClass('hidden');
       testingSectionElement.show();
       refParagraphElement.hide();
       isActive = true;
    }
    stop = function () {
        timerService.stop();
        isActive = false;
        isInit = false;
        testingSectionElement.hide();
        refParagraphElement.removeClass('hidden');
        refParagraphElement.show();
        refParagraphTxtBodyElement.html('"' + refTxt + '"');
        txtInputElement.attr('disabled', true);
    }
    $scope.typedWord = "";
    $scope.correctInputCount = 0;
    $scope.inCorrectInputCount = 0;
    $scope.wpm = 0;
    $scope.accuracy = 0;
    $scope.isComplete = function(){
        if (typedWordIndex >= totalWords){
            alert("Congratuations, you've completed challenge in time...");
            stop();
        }
    }
    $scope.checkInput = function($event) {  
        if (isActive === false){ return }
        const charCode = $event.which || $event.keyCode;
        const charTyped = String.fromCharCode(charCode);
        
        // start the timer as soon as the typing starts
        if(isInit === false){
            isInit = true;
            typedParagraphElement.removeClass('hidden');
            timerService.start(6000, function(){
                alert("You're time is up!");
                stop();
            });
        }

        // Go to the next word if spacebar is clicked
        if (charTyped === " " && charCode == 32)
        {
            // trim white spaces from the reference word and typed word
            let wordTotype =  refTxtArray[refWordIndex].replace(" ", "");
            typedWord = $scope.typedWord.replace(" ", "");
            
            // don't go to the next word if the current word is empty
            if (typedWord.length <= 0){ return }

            createTypedTextElement(typedWordIndex, typedWord);
            
            // Check if typed word is an exact match with reference word
            if (typedWord === wordTotype){
                markTextAsCorrect(typedWordIndex, refWordIndex);
                $scope.correctInputCount++;
            }else{
                markTextAsIncorrect(typedWordIndex, refWordIndex);
                $scope.inCorrectInputCount++;
            }
            // Go to next page if they're more words
            if (refWordIndex + 1 >= WORDS_PER_VIEW){
                refTxtElement.html("");
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
