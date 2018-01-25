'use strict';

const cheerio = require('cheerio');
let $ = {};
let identifier = 101;
let existingIds = [];

module.exports = {
  htmlToText: (html) => {
    $ = cheerio.load('<div id="100">' + html + '</div>', {
      normalizeWhitespace: false,
      recognizeSelfClosing: true,
      withDomLvl1: false
    });

    // console.log('root node:', $.root(), "\n");
    // console.log('root children:', $.root().children(), '!!!!!!!!!!!!!', $('body').html(), "\n");
    // console.log('body children:', $('body').contents(), "\n");

    //get existing ids
    $('[id]').map((index, element) => {
      existingIds.push(parseInt($(element).attr('id')));
      return $(element).attr('id');
    });

    console.log('got all ids:', existingIds);

    let snippets = getTextSnippets_rec($('body').contents());
    console.log('unfiltered snippets:', snippets, "\n");
    let filteredSnippets = filterTextSnippets(snippets);
    console.log('filtered snippets:', filteredSnippets, "\n");
    // console.log('Did the html change?', $.root().html(), "\n");

    return {
      simpleText: extractValue($('body')),
      html: $('body').html(),
      text: makeTextOutOfSnippets(filteredSnippets)
    };
  },

  /*
  Precondition: translatedText is the plain translation of text of the return of htmlToText
                The current translation API transforms " :1:: A :2:: B" to ": 1:: A: 2:: b"
  */
  setTranslatedTextInHtml: (translatedText, html) => {
    console.log('Now insert translated text into html', "\n");
    let snippets = preparedTextToSnippets(translatedText);
    $ = cheerio.load(html, {
      normalizeWhitespace: false,
      recognizeSelfClosing: true,
      withDomLvl1: false
    });

    console.log('DEBUG: html:', html, "\n");

    let k = 0;
    for (k in snippets.ids) {
      $('body').find('#' + snippets.ids[k]).contents().each((index, element) => {
        console.log('Found child of element with id', snippets.ids[k], element, "\n");
        if (element.type === 'text') {
          console.log('Now setting text on', element.type, 'node, new text is: "', snippets.texts[k], '", old text was: "', element.data, "\"\n");
          //$(element).text(snippets.texts[k]);
          element.data = snippets.texts[k];
        }
      })
    }

    let translatedHtml = $('body').html(); //TODO check if this works with unescaped html stuff
    translatedHtml = translatedHtml.substring(14, translatedHtml.length - 6);
    return translatedHtml;
  }
};

//-------- htmlToText functions --------//

function filterTextSnippets(snippets) {
  //TODO also filter Maths, Code, ...
  // console.log('snippets type is', Object.prototype.toString.call(snippets), "\n");
  return snippets.filter(snippet => snippet.text.replace(/\r?\n|\r|\t|-|\+/g, '') !== '');
}

function getTextSnippets_rec(childs) {
  console.log('getTextSnippets_rec got', childs.length, 'child(s)', "\n");
  switch (childs.length) {
    case 0:
      return [];
      break;
    case 1:
      console.log('handle one child which type is', childs[0].type, "\n");
      if (childs[0].type === 'text')
        return [{text: extractValue(childs[0]), id: getId($(childs[0]))}];
      return getTextSnippets_rec(childs.contents());
      break;
    default:
      let result = [];
      // console.log('get child with another function:', $(childs[0]), $(childs[0]).attr('id'), "\n");
      childs.each((index, element) => {
        console.log('recursive now with each - current child:', element, "\n");
        if (element.children)
          result = result.concat(getTextSnippets_rec($(element.children)));
        else if (element.type === 'text')
          result = result.concat([{text: element.data, id: getId($(element))}]);
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
  id = node.parent().attr('id');//use id of parent because text nodes id attribtes are not writen to html
  if (!id) {
    id = generateNewId();
    node.parent().attr('id', id);
  }

  console.log('Got id', id, 'of node with type', node[0].type, 'and id', node.attr('id'), 'and parents id', node.parent().attr('id'), "\n");

  return id;
}

function checkAndHandleMultipleTextNodes(textNode) {

}

function generateNewId() {
  let id = identifier;
  identifier++;

  while (existingIds.includes(id)) {
    id = identifier;
    identifier++;
  }

  return id;
}

//-------- setTranslatedTextInHtml functions --------//

function preparedTextToSnippets(text) {
  let translatedTexts = text.split(/\:\s\d{3,12}\:\:\s/g);
  translatedTexts.shift(); //first element is nulll thus should be removed
  let ids = text.match(/\:\s\d{3,12}\:\:\s/g).reduce((a, id) => {
    a.push(parseInt(id.substring(2, id.length - 3)));
    return a;
  }, []);

  return {
    ids: ids,
    texts: translatedTexts
  };
}
