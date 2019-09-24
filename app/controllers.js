TypingTestModule.controller('TypingTestController', function($scope, 
    timerService, calculationService, wordsToTypeService, paginationService){
        
    const WORDS_PER_VIEW = 25; // Total words to display in text_to_copy
    const wordInputElement = $('#word_input');
    const typedWordsMainContainer = $("#typed_paragraph_preview_container");
    const originalParagraphMainContainer = $('#original_paragraph_main_container');
    const referenceParagraphTextContainer = $('#to_type_text_elements_container'); 
    const typedWordsContainer = $('#typed_text_elements_container');
    const originalParagraphTextContainer = $('#original_paragraph_text');
    const typingTestMainContainer = $('#typing_test_main_container');
    const continueBtn = $('#continue_btn');

    let totalWords; // from the original paragraph
    let originalParagraph; // Text from the original
    let paragraphWordList; // Array of words from paragraph
    let typedWordList; // Array of words typed
    let typedIndex; // Current typed word position
    let paragraphIndex; // Current word position in paragraph
    let isInit; // When typing is initiated, set to True
    let isActive; // If typing is active, set to True
    let page;   // Word pagination object

    $scope.start = function () {
       // Assign initial values
       totalWords = 0;
       originalParagraph = '';
       paragraphWordList = [];
       typedWordList = [];
       typedIndex = 0;
       paragraphIndex = 0; 
       isInit = false;
       isActive = false;
       page = paginationService;
       
       $scope.typedWord = "";
       $scope.correctInputCount = 0;
       $scope.inCorrectInputCount = 0;
       $scope.wpm = 0;
       $scope.accuracy = 0;
        
       // Clear Html elements incase they have previous values..
       typedWordsContainer.html("");
       referenceParagraphTextContainer.html("");
       originalParagraphTextContainer.html("");

       // reset the timer incase it was previously active
       timerService.clear();

       paragraph = wordsToTypeService;
       originalParagraph = paragraph.getWordsAsTxt();
       paragraphWordList = paragraph.getWordsAsArray();
       totalWords = paragraphWordList.length;
        // paginate reference words to be typed
       page.paginate(paragraphWordList, WORDS_PER_VIEW);
       // get current list of words/first page of words
       paragraphWordList = page.getList();
       // Wrap each word as an Html Element with unique id
       buildTextElements(paragraphWordList);
       // highlight the first word in the paragraph
       markTextAsActive(paragraphIndex);
       continueBtn.addClass('hidden');
       typedWordsMainContainer.addClass('hidden');
       typingTestMainContainer.show();
       originalParagraphMainContainer.hide();
       wordInputElement.attr('disabled', false);
       wordInputElement.focus();
       isActive = true;
    }

    $scope.stop = function () {
        timerService.stop();
        isActive = false;
        isInit = false;
        typingTestMainContainer.hide();
        originalParagraphMainContainer.removeClass('hidden');
        originalParagraphMainContainer.show();
        originalParagraphTextContainer.html('"' + originalParagraph + '"');
        wordInputElement.attr('disabled', true);
        continueBtn.removeClass('hidden');
    }

    $scope.isComplete = function(){
        if (typedIndex >= totalWords){
            alert("Congratuations, you've completed challenge in time...");
            $scope.stop();
        }
    }

    $scope.checkInput = function($event) {  
        if (isActive === false){ return }
        const charCode = $event.which || $event.keyCode;
        const charTyped = String.fromCharCode(charCode);
        
        // start the timer as soon as the typing starts
        if(isInit === false){
            isInit = true;
            typedWordsMainContainer.removeClass('hidden');
            timerService.start(6000, function(){
                alert("You're time is up!");
                $scope.stop();
            });
        }

        // Go to the next word if spacebar is clicked
        if (charTyped === " " && charCode == 32)
        {
            // trim white spaces from the reference word and typed word
            let wordTotype =  paragraphWordList[paragraphIndex].replace(" ", "");
            typedWord = $scope.typedWord.replace(" ", "");
            
            // don't go to the next word if the current word is empty
            if (typedWord.length <= 0){ return }

            createTypedTextElement(typedIndex, typedWord);
            
            // Check if typed word is an exact match with reference word
            if (typedWord === wordTotype){
                markTextAsCorrect(typedIndex, paragraphIndex);
                $scope.correctInputCount++;
            }else{
                markTextAsIncorrect(typedIndex, paragraphIndex);
                $scope.inCorrectInputCount++;
            }
            // Go to next page if they're more words
            if (paragraphIndex + 1 >= WORDS_PER_VIEW){
                referenceParagraphContainer.html("");
                paragraphWordList = page.next();
                buildTextElements(paragraphWordList);
                paragraphIndex = 0;
                markTextAsActive(paragraphIndex);
            }else{
                //Unhighlight current word and mark next word
                makeTextInactive(paragraphIndex);
                markTextAsActive(++paragraphIndex);
            }
            typedWordList[typedIndex] = typedWord;
            typedWord = "";
            $scope.wpm = calculationService.calcNetWPM(
                typedWordList.length + 1, $scope.inCorrectInputCount, 
                timerService.getTimeInMinutes()
            );
            $scope.accuracy = calculationService.calcAccuracy(
                $scope.correctInputCount, totalWords
            );
            wordInputElement.val('');
            ++typedIndex;
        }
    }
    $scope.start();
})
