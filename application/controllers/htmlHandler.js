'use strict';

const cheerio = require('cheerio');
let $ = {};
let identifier = 100;
let existingIds = [];

module.exports = {
  htmlToText: (html) => {
    $ = cheerio.load(html, {
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
    let filteredSnippets = filterTextSnippets(snippets);
    console.log('recursive result:', filteredSnippets, "\n");
    // console.log('Did the html change?', $.root().html(), "\n");

    return {
      simpleText: extractValue($('body')),
      html: $.root().html(),
      text: makeTextOutOfSnippets(filteredSnippets)
    };
  },

  setTranslatedTextInHtml: (translatedText, html) => {
    let snippets = preparedTextToSnippets(translatedText);
    $ = cheerio.load(html, {
      normalizeWhitespace: false,
      recognizeSelfClosing: true,
      withDomLvl1: false
    });

    let k = 0;
    for (k in snippets.ids) {
      $('#' + snippets.ids[k]).contents().each((index, element) => {
        console.log('Found element with id', snippets.ids[k]);
        if (element.type === 'text') {
          console.log('Now setting text on', element, ', text is:', snippets.texts[k]);
          //$(element).text(snippets.texts[k]);
          element.data = snippets.texts[k];
        }
      })
    }
    $.root().html();
    return $('body').html(); //TODO check if this works with unescaped html stuff
  }
};

//-------- htmlToText functions --------//

function filterTextSnippets(snippets) {
  //TODO also filter Maths, Code, ...
  console.log('snippets type is', Object.prototype.toString.call(snippets), "\n");
  return snippets.filter(snippet => snippet.text.replace(/\r?\n|\r|\t|-|\+/g, '') !== '');
}

function getTextSnippets_rec(childs) {
  console.log('getTextSnippets_rec got', childs.length, 'childs:', childs, "\n");
  switch (childs.length) {
    case 0:
      return [];
      break;
    case 1:
      console.log('handle node with one child which type is', childs[0].type, "\n");
      if (childs[0].type === 'text')
        return [{text: extractValue(childs[0]), id: getId($(childs[0]))}];
      return getTextSnippets_rec(childs.contents());
      break;
    default:
      let result = [];
      // console.log('get child with another function:', $(childs[0]), $(childs[0]).attr('id'), "\n");
      childs.each((index, element) => {
        console.log('recursive now with each - current element:', element, "\n");
        if (element.children)
          result = result.concat(getTextSnippets_rec($(element.children)));
        else if (element.type === 'text')
          result = result.concat([{text: element.data, id: getId($(element))}]);
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
  id = node.parent().attr('id');//ned id of parent because text nodes id attribtes are not writen to html
  if (!id) {
    id = generateNewId();
    node.parent().attr('id', id);
  }

  console.log('Got id', id, 'of node', node, node.attr('id'), node.parent().attr('id'), "\n");

  return id;
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
  let translatedTexts = text.split(/\s\:\d{3,12}\:\:\s/g);
  translatedTexts.shift(); //first element is nulll thus should be removed
  let ids = text.match(/\s\:\d{3,12}\:\:\s/g).reduce((a, id) => {
    a.push(parseInt(id.substring(2, id.length - 3)));
    return a;
  }, []);

  return {
    ids: ids,
    texts: translatedTexts
  };
}
