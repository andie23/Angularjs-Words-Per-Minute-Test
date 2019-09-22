const textToCopy = $('#text_to_copy');
const TEXT_TO_COPY_ID_PREFIX = "txt_to_copy_"

function buildTextElements(sentenceArray)
{
    for(var i=0; i < sentenceArray.length; ++i){
        id = TEXT_TO_COPY_ID_PREFIX + i;
        $("<span id='" + id + "'> " + sentenceArray[i] + " </span>")
            .appendTo('#text_to_copy');
    }
}
function getTextElement(idPrefix, index){
    return $("#" + idPrefix + index);
}

function applyCssClass(element, cssClass) {
    element.attr('class', cssClass);
}

function removeCssClass(element, cssClass){
    element.removeClass(cssClass);
}

function getTextElementInTextToCopy(index)
{
    return getTextElement(TEXT_TO_COPY_ID_PREFIX, index);
}

function markTextAsActive(index)
{
    applyCssClass(getTextElementInTextToCopy(index), 'marked_txt');
}

function makeTextInactive(index)
{
    removeCssClass(getTextElementInTextToCopy(index), 'marked_txt');
}

function markTextAsCorrect(index)
{
    applyCssClass(getTextElementInTextToCopy(index), 'correct_txt');
}

function markTextAsIncorrect(index)
{
    applyCssClass(getTextElementInTextToCopy(index), 'incorrect_txt');
}
