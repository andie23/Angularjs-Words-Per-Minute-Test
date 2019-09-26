TypingTestModule.controller('MenuController', function($scope, requestService, authService){
    $scope.participantName = authService.getParticipantName();
})
TypingTestModule.controller('LoginController', function($scope, requestService, authService){
    if(authService.isLoggedIn()){
        authService.loggout();
        appAlert.success('Good goodbye!');
    }
    $scope.referenceCode = "";
    $scope.authenticate = function(){
        if($scope.referenceCode.length <= 0){
            appAlert.error('Cannot submit empty reference code!');
        }else{
            authService.login(
                $scope.referenceCode,
                function(data){
                    appAlert.success('Welcome '+ data.fullname);
                    window.location = requestService.getAppUrl('menu');
                }, 
                function(error){
                    appAlert.error(error);
                }
            )
        }
    }
})
TypingTestModule.controller('TypingTestController', function($scope, 
    timerService, calculationService, challengeService, paginationService,
    requestService, submissionService){
        
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
    let mistakeList;
    let typedIndex; // Current typed word position
    let paragraphIndex; // Current word position in paragraph
    let isInit; // When typing is initiated, set to True
    let isActive; // If typing is active, set to True
    let page;   // Word pagination object
    let timeLimit;
    let challengeID;

    submitResults = function(isTimeOut){
        let data = {
            'challenge_id' : challengeID,
            'net_wpm': $scope.wpm,
            'gross_wpm': $scope.grsswpm,
            'accuracy' : $scope.accuracy,
            'correct_words' : $scope.correctInputCount,
            'incorrect_words' : $scope.inCorrectInputCount,
            'typed_list' : typedWordList,
            'mistake_list' : mistakeList,
            'minutes' : timerService.getTimeInMinutes(),
            'is_time_out' : isTimeOut
        };

        submissionService.submit(data, function(){}, function(e, c){
            appAlert.error('Failed to submit result scores!');
        });
    }

    $scope.start = function (title, passage, limit, id) {
       challengeID = id;
       typedWordList = [];
       mistakeList = [];
       typedIndex = 0;
       paragraphWordList = passage.split(' ');
       originalParagraph = passage;
       paragraphIndex = 0; 
       isInit = false;
       isActive = false;
       page = paginationService;
       timeLimit = limit * 60000; // convert timelimit from minutes to milliseconds
       totalWords = paragraphWordList.length;
       
       $scope.title = title;
       $scope.typedWord = "";
       $scope.correctInputCount = 0;
       $scope.inCorrectInputCount = 0;
       $scope.wpm = 0;
       $scope.accuracy = 0;
       $scope.grsswpm = 0;
        
       // Clear Html elements incase they have previous values..
       typedWordsContainer.html("");
       referenceParagraphTextContainer.html("");
       originalParagraphTextContainer.html("");

       // reset the timer incase it was previously active
       timerService.clear();
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
            appAlert.success('You have completed the passage in Time!');
            $scope.stop();
            submitResults(0);
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
            timerService.start(timeLimit, function(){
                appAlert.error('Your time is up!');
                $scope.stop();
                submitResults(1);
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
                mistakeList[typedIndex] = {
                    typed : typedWord,
                    reference : wordTotype
                };
                markTextAsIncorrect(typedIndex, paragraphIndex);
                $scope.inCorrectInputCount++;
            }
            // Go to next page if they're more words
            if (paragraphIndex + 1 >= WORDS_PER_VIEW){
                referenceParagraphTextContainer.html("");
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
            $scope.grsswpm = calculationService.calcGrossWPM(
                typedWordList.length + 1, timerService.getTimeInMinutes()
            )
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
    challengeService.init($scope.start, function(error, status){
            appAlert.error(error);
            window.location = requestService.getAppUrl('menu');
        }
    );
})
