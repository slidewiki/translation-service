'use strict';

const cheerio = require('cheerio');
let $ = {};
let identifier = 100;
let existingIds = [];

module.exports = {
  htmlToText: (html) => {
    return maskHtmlTags(html);
  }
};

function maskHtmlTags(html) {
  $ = cheerio.load(html, {
    normalizeWhitespace: false,
    recognizeSelfClosing: true
  });

  // console.log('root node:', $.root(), "\n");
  // console.log('children:', $('body').children(), "\n");

  // console.log('body nodevalue:', $('body').contents(), "\n");

  // let firstNodes = $('body').contents();

  //get existing ids
  $('[id]').map((index, element) => {
    existingIds.push(parseInt($(element).attr('id')));
    return $(element).attr('id');
  });

  console.log('get all ids:', existingIds);

  let snippets = extractValue_rec($('body').contents());
  console.log('recursive result:', filterTextSnippets(snippets), "\n");
  // console.log('Did the html change?', $.root().html(), "\n");

  return {text: extractValue($('body')), html: $.root().html()};
}

function filterTextSnippets(snippets) {
  console.log('snippets type is', Object.prototype.toString.call(snippets), "\n");
  return snippets.filter(snippet => snippet.text.replace(/\r?\n|\r|\t|-|\+/g, '') !== '');
}

function extractValue_rec(childs) {
  // let childs = node.contents();
  console.log('extractValue_rec got', childs.length, 'childs:', childs, "\n");
  switch (childs.length) {
    case 0:
      return [];
      break;
    case 1:
      console.log('handle node with one child which type is', childs[0].type, "\n");
      if (childs[0].type === 'text')
        return [{text: childs[0].nodeValue || childs[0].text(), id: getId($(childs[0]))}];
      return extractValue_rec(childs.contents());//TODO check if this works
      break;
    default:
      let result = [];
      // console.log('get child with another function:', $(childs[0]), $(childs[0]).attr('id'), "\n");
      childs.each((index, element) => {
        console.log('recursive now with each - current element:', element, "\n");
        if (element.children)
          result = result.concat(extractValue_rec($(element.children)));
        else if (element.type === 'text')
          result = result.concat([{text: element.data, id: getId($(element))}]);
      });
      return result;
  }
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
