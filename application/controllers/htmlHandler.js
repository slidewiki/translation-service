/*eslint quotes: "warn"*/
/*eslint no-useless-escape: "warn"*/
/*eslint no-case-declarations: "warn"*/
'use strict';

const cheerio = require('cheerio'),
    REGEX_MASK_AFTER_TRANSLATION = /\:\s\d{3,12}\-?\d{0,5}\:\:\s/g,
    REGEX_EMPTY_STRING = /\r?\s|\n|\r|\t|-|\+*/g;


let $ = {};
let identifier = 101;
let existingIds = [];

module.exports = {
    /*
    Transforms a slides content (HTML) into:
       a basic text extraction (simpleText),
       a modified html version (html) and
       a text which contains a map of string to identifier (text - string representation) <- should be used for translation API

		Attention:
		   Text with special characters (like code) could be modified even if they will not be translated. E.g.: ' -> &apos;   or   &nbsp; -> &#xA0;
    */
    htmlToText: (html) => {
        $ = cheerio.load('<div id="100">' + html + '</div>', {
            normalizeWhitespace: false,
            recognizeSelfClosing: true,
            withDomLvl1: false,
            decodeEntities: false
        });

        // console.log('root node:', $.root(), "\n");
        // console.log('root children:', $.root().children(), '!!!!!!!!!!!!!', $('body').html(), "\n");
        // console.log('body children:', $('body').contents(), "\n");

        //get existing ids
        $('[id]').map((index, element) => {
            existingIds.push($(element).attr('id'));
            return $(element).attr('id');
        });

        // console.log('got all ids:', existingIds);

        let snippets = getTextSnippets_rec($('body').contents());
        // console.log('unfiltered snippets:', snippets, "\n");
        let filteredSnippets = filterTextSnippets(snippets);
        // console.log('filtered snippets:', filteredSnippets, "\n");
        let deduplicatedSnippets = checkAndHandleMultipleIdsInSNippets(filteredSnippets);
        console.log('deduplicated snippets:', deduplicatedSnippets, "\n");
        // console.log('Did the html change?', $.root().html(), "\n");

        return {
            simpleText: extractValue($('body')),
            html: $('body').html(),
            text: makeTextOutOfSnippets(deduplicatedSnippets)
        };
    },

    /*
    Takes the translated text and modifierd html return of htmlToText and returns the translated html version
    Precondition: translatedText is the plain translation of the return (text) of htmlToText
                  The current translation API transforms " :1:: A :2:: B" into ": 1:: A: 2:: b", thats why the regex differ from whats created in makeTextOutOfSnippets
    */
    setTranslatedTextInHtml: (translatedText, html) => {
        console.log('Now insert translated text into html', "\n");
        let snippets = preparedTextToSnippets(translatedText);
        $ = cheerio.load(html, {
            normalizeWhitespace: false,
            recognizeSelfClosing: true,
            withDomLvl1: false,
            decodeEntities: false
        });

        // console.log('DEBUG: html:', html, "\n");

        //going throw snippets array and try to set text of html tag with this id
        //Two differentiations: Ids in snippet could have an additional information which text element should be exchanged.
        //   First case: one text per id - thus change only the first text node;
        //   Second case: multiple text nodes per id - additional index is given for the number of the text node which should be edited
        let k = 0;
        for (k in snippets.ids) {
            if (snippets.ids[k].indexOf('-') === -1) { //first text node
                let counter = 0;
                $('body').find('#' + snippets.ids[k]).contents().each((index, element) => {
                    // console.log('Found child of element with id', snippets.ids[k], element, "\n");
                    if (element.type === 'text' && counter === 0) {
                        // console.log('Now setting text on', element.type, 'node, new text is: "', snippets.texts[k], '", old text was: "', element.data, "\"\n");
                        element.data = snippets.texts[k];
                        counter++;
                    }
                });
            } else { //not first text node
                const index = snippets.ids[k].indexOf('-');
                let counter = 0;
                const target = parseInt(snippets.ids[k].substring(index + 1, snippets.ids[k].length));
                console.log('Searching now node with multiple texts. target text node has the number', target, "\n");
                $('body').find('#' + snippets.ids[k].substring(0, index)).contents().each((index, element) => {
                    // console.log('Found child of element with id', snippets.ids[k], element, "\n");
                    if (element.type === 'text') {
                        counter++;
                        if (counter === target) {
                            // console.log('Now setting text on', element.type, 'node, new text is: "', snippets.texts[k], '", old text was: "', element.data, "\"\n");
                            element.data = snippets.texts[k];
                        }
                    }
                });
            }
        }

        let translatedHtml = $('body').html(); //TODO check if this works with unescaped html stuff
        translatedHtml = translatedHtml.substring(14, translatedHtml.length - 6); //Remove added root div tag
        return translatedHtml;
    }
};

//-------- htmlToText functions --------//

function filterTextSnippets(snippets) {
    // console.log('snippets type is', Object.prototype.toString.call(snippets), "\n");
    return snippets.filter((snippet) => snippet !== undefined && snippet.text.replace(REGEX_EMPTY_STRING, '') !== '');
}

function getTextSnippets_rec(childs) {
    // console.log('getTextSnippets_rec got', childs.length, 'child(s)', "\n");
    switch (childs.length) {
        case 0:
            return [];
        case 1:
            // console.log('handle one child which type is', childs[0].type, ', name is', childs[0].name, ' and attributes are', childs[0].attribs, "\n");
            if (childs[0].type === 'text')
                return [{
                    text: extractValue(childs[0]),
                    id: getId($(childs[0]))
                }];
            else if (childs[0].attribs && childs[0].attribs.class && (childs[0].attribs.class === 'math-tex' || childs[0].attribs.class.startsWith('language-') )) {
                console.log('Skipping children because this element needs no translation - class:', childs[0].attribs.class, "\n");
            }
            else
                return getTextSnippets_rec(childs.contents());
            break;
        default:
            let result = [];
            // console.log('get child with another function:', $(childs[0]), $(childs[0]).attr('id'), "\n");
            childs.each((index, element) => {
                let children = element.children;
                try {
                    children = element.children();
                } catch (e) {
                    //nothing
                }
                // console.log('recursive now with each - current child:', element.type, element.name, element.attribs, '', children);
                if (children) {
                    // console.log('getTextSnippets_rec: try get class attribute:', (element.attr) ? element.attr('class') : 'unknown', (element.attribs && element.attribs.class) ? element.attribs.class : 'unknown', "\n");

                    if (element.attribs && element.attribs.class && (element.attribs.class === 'math-tex' || element.attribs.class.startsWith('language-') )) {
                        console.log('Skipping children because this element needs no translation - class:', element.attribs.class, "\n");
                    }
                    else
                        result = result.concat(getTextSnippets_rec($(children)));
                }
                else if (element.type === 'text')
                    result = result.concat([{
                        text: element.data,
                        id: getId($(element))
                    }]);
                else
                    console.log('ERROR: element is no text and has no children!!!!', "\n");
            });
            return result;
    }
}

function makeTextOutOfSnippets(snippets) {
    return snippets.reduce((a, s) => {
        a += ' :' + s.id + ':: ' + s.text;
        return a;
    }, '');
}

function extractValue(node) {
    return node.nodeValue || node.text();
}

function getId(node) {
    let id = 0;
    id = node.parent().attr('id'); //use id of parent because text nodes id attribtes are not writen to html
    if (!id) {
        id = generateNewId();
        node.parent().attr('id', id);
        console.log('id', id, 'was new generated', "\n");
    }

    // console.log('Got id', id, 'of node with type', node[0].type, 'and id', node.attr('id'), 'and parents id', node.parent().attr('id'), "\n");

    return id;
}

function checkAndHandleMultipleIdsInSNippets(snippets) {
    let ids = {};
    return snippets.reduce((a, snippet) => {
        if (ids[snippet.id]) {
            ids[snippet.id]++;
            snippet.id += '-' + ids[snippet.id];
        } else {
            ids[snippet.id] = 1;
        }

        a.push(snippet);

        return a;
    }, []);
}

function generateNewId() {
    let id = identifier;
    identifier++;

    while (existingIds.includes(id)) {
        id = identifier;
        identifier++;
    }

    existingIds.push(id + '');
    return id + '';
}

//-------- setTranslatedTextInHtml functions --------//

function preparedTextToSnippets(text) {
    let translatedTexts = text.split(REGEX_MASK_AFTER_TRANSLATION);
    translatedTexts.shift(); //first element is nulll thus should be removed
    let matches = text.match(REGEX_MASK_AFTER_TRANSLATION);
    let ids = [];
    if (matches && matches.length > 0)
        ids = text.match(REGEX_MASK_AFTER_TRANSLATION).reduce((a, id) => {
            a.push(id.substring(2, id.length - 3)); //REGEX_MASK_AFTER_TRANSLATION defines the indexes
            return a;
        }, []);

    return {
        ids: ids,
        texts: translatedTexts
    };
}
