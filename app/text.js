const TEXT_TO_COPY_ID_PREFIX = "txt_to_copy_";
const TYPED_TXT_ID_PREFIX = "typed_txt_";

function createTxtElement(id, text, parent)
{
    $("<span id='" + id + "'> " + text + " </span>")
        .appendTo(parent);
}
function createTypedTextElement(id, text){
    createTxtElement(TYPED_TXT_ID_PREFIX + id, text, '#typedd_paragraph');
}
function buildTextElements(sentenceArray)
{
    for(var i=0; i < sentenceArray.length; ++i){
        id = TEXT_TO_COPY_ID_PREFIX + i;
        createTxtElement(id, sentenceArray[i], '#text_to_copy');
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

function getTextElementInTypedParagraph(index){
    return getTextElement(TYPED_TXT_ID_PREFIX, index);
}

function markTextAsActive(index)
{
    applyCssClass(getTextElementInTextToCopy(index), 'marked_txt');
}

function makeTextInactive(index)
{
    removeCssClass(getTextElementInTextToCopy(index), 'marked_txt');
}

function markTextAsCorrect(typedIndex ,refIndex)
{
    applyCssClass(getTextElementInTypedParagraph(typedIndex), 'correct_txt');
    applyCssClass(getTextElementInTextToCopy(refIndex), 'correct_txt');
}

function markTextAsIncorrect(typedIndex, refIndex)
{
    applyCssClass(getTextElementInTypedParagraph(typedIndex), 'incorrect_txt');
    applyCssClass(getTextElementInTextToCopy(refIndex), 'incorrect_txt');
}
