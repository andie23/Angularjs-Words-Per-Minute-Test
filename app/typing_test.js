var typingTest = angular.module('TypingTest', []);
var controllers = {};

controllers.TypingTestController = function($scope){
    const TEXT_ELEMENT_PREFIX = 'txt_'; 
    var sentence = "After all, you're only an immortal until someone manages to kill you. After that, you were just long-lived.";
    var sentenceArray = sentence.split(' ');
    var sentenceIndex = 0; 
    var typedSentenceArray = [];
    var typedWord = "";
    var initTimer = false;

    buildSentenceArrayAsHtmlElements = function(){
        for(var i=0; i < sentenceArray.length; ++i){
            sentenceId = TEXT_ELEMENT_PREFIX + i;
            $("<span id='" + sentenceId + "'> " + 
                sentenceArray[i] +
              " </span>").appendTo('#passage_to_copy');
        }
    }()

    getTxtElement = function(index){
        return $("#" + TEXT_ELEMENT_PREFIX + sentenceIndex);
    }

    setTxtCssClass = function(element, css){
        element.attr('class', css);
    } 

    rmvTxtCssClass = function(css){
        element = getTxtElement();
        element.removeClass(css);
    }

    applyCssToTxt = function(index, css){
        setTxtCssClass(getTxtElement(sentenceIndex), css);
    }

    $scope.correctInputCount = 0;
    $scope.inCorrectInputCount = 0;
    $scope.charCount = 0;
    $scope.checkInput = function($event, inputElementId) {  
        inputField = $('#' + inputElementId);
        charCode = $event.charCode;
        charTyped = String.fromCharCode(charCode);
        wordToType = sentenceArray[sentenceIndex];

        if(!initTimer){
            startTimer();
            setTimeout(stopTimer, 60000);
            initTimer = true;
        }

        if (charTyped=== " "){
            if(typedWord.length <= 0){
                return;
            }
            if (typedWord.trim() === wordToType.trim()){
                applyCssToTxt(sentenceIndex, 'correct_txt');
                ++$scope.correctInputCount;
            }else{
                applyCssToTxt(sentenceIndex, 'incorrect_txt');
                ++$scope.inCorrectInputCount;
            }
            $scope.charCount += typedWord.length;
            typedSentenceArray[sentenceIndex] = typedWord;
            typedWord = "";
            rmvTxtCssClass('marked_txt');
            ++sentenceIndex;
            applyCssToTxt(sentenceIndex, 'marked_txt');
            inputField.val('');
        }else{
            typedWord+=charTyped;
        }
    }
    applyCssToTxt(sentenceIndex, 'marked_txt');

}

typingTest.controller(controllers);
