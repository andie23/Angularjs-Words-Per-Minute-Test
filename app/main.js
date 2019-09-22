var typingTest = angular.module('TypingTest', []);
var controllers = {};

controllers.TypingTestController = function($scope){
    const TEXT_ELEMENT_PREFIX = 'txt_'; 
    var sentence = "After all, you're only an immortal until someone manages to kill you. After that, you were just long-lived.";
    var sentenceArray = sentence.split(' ');
    var wordIndex = 0; 
    var typedSentenceArray = [];
    var typedWord = "";
    var initTimer = false;
    var isActive = true;

    $scope.correctInputCount = 0;
    $scope.inCorrectInputCount = 0;
    $scope.charCount = 0;

    stop = function(){
        stopTimer();
        isActive = false;
    }
    $scope.isComplete = function(){
        if (wordIndex >= sentenceArray.length){
            stop();
        }
    }
    $scope.checkInput = function($event, inputElementId) {  
        inputField = $('#' + inputElementId);
        charCode = $event.charCode;
        charTyped = String.fromCharCode(charCode);
        wordToType = sentenceArray[wordIndex];
        
        if (!isActive){
            return;
        }

        if(!initTimer){
            startTimer();
            setTimeout(stopTimer, 60000);
            initTimer = true;
        }

        if (charTyped=== " "){
            //Do not go to the next word if the current one is empty
            if(typedWord.length <= 0){
                return;
            }
            //Check if the typed word matches current word
            if (typedWord.trim() === wordToType.trim()){
                markTextAsCorrect(wordIndex);
                ++$scope.correctInputCount;
            }else{
                markTextAsIncorrect(wordIndex);
                ++$scope.inCorrectInputCount;
            }
           
            $scope.charCount += typedWord.length;
            typedWord = "";
            makeTextInactive(wordIndex);
            ++wordIndex;
            markTextAsActive(wordIndex);
            inputField.val('');
        }else{
            typedWord+=charTyped;
        }
    }
    // show text to be typed
    buildTextElements(sentenceArray);
    // initialize first text to be marked
    markTextAsActive(wordIndex);
}

typingTest.controller(controllers);
