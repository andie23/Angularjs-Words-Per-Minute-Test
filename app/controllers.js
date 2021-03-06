TypingTestModule.run(function($rootScope, $timeout, $interval, $location, authService){
    $rootScope.$on('$routeChangeStart', function(event) {
        if ($rootScope.timeoutPromise !== undefined){
            $timeout.cancel($rootScope.timeoutPromise);
        }
        if ($rootScope.intervalPromise !== undefined){
            $interval.cancel($rootScope.intervalPromise);
        }
        if (!authService.isLoggedIn()){
            $location.url('/');
        }
    })
})
TypingTestModule.controller('MenuController', function($scope, authService){
    $scope.participantName = authService.getParticipantName();
})
TypingTestModule.controller('LoginController', function($scope, $location, authService){
    if(authService.isLoggedIn()){
        authService.loggout();
    }
    $scope.isRequesting = false;
    $scope.referenceCode = "";
    $scope.authenticate = function(){
        if($scope.referenceCode.length <= 0){
            appAlert.error('Cannot submit empty reference code!');
        }else{
            $scope.isRequesting = true;
            authService.login(
                $scope.referenceCode,
                function(data){
                    $location.url('/typing-test');
                }, 
                function(error){
                    $scope.isRequesting = false;
                }
            )
        }
    }
})
TypingTestModule.controller('TypingTestController', function($scope, $location, 
    timerService, calculationService, challengeService, paginationService, 
    submissionService, authService){
        
    const WORDS_PER_VIEW = 25; // Total words to display in text_to_copy
    const wordInputElement = $('#word_input');
    const typedWordsMainContainer = $("#typed_paragraph_preview_container");
    const referenceParagraphTextContainer = $('#to_type_text_elements_container'); 
    const typedWordsContainer = $('#typed_text_elements_container');
    const typingTestMainContainer = $('#typing_test_main_container');

    let totalWords; // from the original paragraph
    let originalParagraph; // Text from the original
    let paragraphWordList; // Array of words from paragraph
    let typedWordList; // Array of words typed
    let mistakeList;
    let typedIndex; // Current typed word position
    let paragraphIndex; // Current word position in paragraph
    let page;   // Word pagination object
    let limitInMilsecs;
    let limitInSecs;
    let challengeID;
    let resultData;

    setResultData = function(isTimeOut){
        resultData = {
            'challenge_id' : challengeID,
            'net_wpm': $scope.wpm,
            'gross_wpm': $scope.grsswpm,
            'accuracy' : $scope.accuracy,
            'correct_words' : $scope.correctInputCount,
            'incorrect_words' : $scope.inCorrectInputCount,
            'typed_list' : typedWordList,
            'mistake_list' : mistakeList,
            'minutes' : $scope.curMinutes,
            'seconds' : $scope.curSeconds,
            'is_time_out' : isTimeOut
        };
    }

    $scope.start = function (title, passage, limit, id) {
       challengeID = id;
       typedWordList = [];
       mistakeList = [];
       typedIndex = 0;
       paragraphWordList = passage.split(' ');
       originalParagraph = passage;
       paragraphIndex = 0; 
       page = paginationService;
       limitInSecs = limit * 60;
       limitInMilsecs = limit * 60000; // convert limitInMilsecs from minutes to milliseconds
       totalWords = paragraphWordList.length;
       resultData = {}
      
       $scope.timeLimit = limitInSecs;
       $scope.participantName = authService.getParticipantName() || 'Anonymous';
       $scope.isInit = false;
       $scope.isReady = false;
       $scope.originalParagraph = passage;
       $scope.isActive = false;
       $scope.curSeconds = 0;
       $scope.curMinutes = 0.0;
       $scope.title = title;
       $scope.typedWord = "";
       $scope.correctInputCount = 0;
       $scope.inCorrectInputCount = 0;
       $scope.wpm = 0;
       $scope.accuracy = 0;
       $scope.grsswpm = 0;
       $scope.isSubmitting = false;

       // Clear Html elements incase they have previous values..
       typedWordsContainer.html("");
       referenceParagraphTextContainer.html("");
       //start at the first index of the page
       page.resetIndex();
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
       $scope.isActive = true;
       $scope.isReady = true;
    }

    $scope.deterCopyAndPaste = function(){
        wordInputElement.focus();
    }

    $scope.submitResults = function(){
        $scope.isSubmitting = true;
        submissionService.submit(resultData, function(score){
            appAlert.success('Your score: ' + score + ' points!');
            $location.url('/');
        }, function(error){
            $scope.isSubmitting = false;
        });
    }

    $scope.stop = function () {
        timerService.stop();
        $scope.isActive = false;
    }

    $scope.isComplete = function(){
        if (typedIndex >= totalWords){
            $scope.stop();
            setResultData(0);
        }
    }

    $scope.checkInput = function($event) {  
        if ($scope.isActive === false){ return }
        const charCode = $event.which || $event.keyCode;
        const charTyped = String.fromCharCode(charCode);
        
        // start the timer as soon as the typing starts
        if($scope.isInit === false){
            $scope.isInit = true;
            onTimeChange = function(seconds, minutes){
                $scope.curSeconds = seconds;
                $scope.curMinutes = minutes;
            }
            onTimeout = function(){
                appAlert.error('Your time is up!');
                $scope.stop();
                setResultData(1);
            }
            timerService.start(limitInMilsecs, onTimeChange, onTimeout);
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
                mistakeList.push({
                    'wordIndex' : typedIndex,
                    'typed' : typedWord,
                    'reference' : wordTotype
                });
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
                typedWordList.length, $scope.curMinutes
            )
            $scope.wpm = calculationService.calcNetWPM(
                $scope.correctInputCount, $scope.inCorrectInputCount, $scope.curMinutes
            );
            $scope.accuracy = calculationService.calcAccuracy(
                $scope.correctInputCount, totalWords
            );
            wordInputElement.val('');
            ++typedIndex;
        }
    }
    challengeService.init($scope.start, function(error, status){
            $location.url('/');
        }
    );
})
