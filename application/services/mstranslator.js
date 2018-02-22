'use strict';

const async = require('async');
const translator = require('mstranslator');
const { mstranslatorApiKey, mockTranslation } = require('../configuration');
const htmlHandler = require('../controllers/htmlHandler.js');

// a mockup tranlsator
let mockClient = {

    translate: (params, callback) => {
        let result = 'Lorem Ipsum';

        // add some delay for debugging / testing purposes
        setTimeout(() => {
            callback(null, result);
        }, 1000);
    },

    getLanguagesForTranslate: (callback) => {
        let result = ['ru', 'nl', 'de', 'es', 'ar', 'en', 'it', 'fr', 'sr', 'ca', 'el'];
        callback(null, result);
    },

    getLanguageNames: (params, callback) => {
        let result = ['Russian', 'Dutch', 'German', 'Spanish', 'Arabic', 'English', 'Italian', 'French', 'Serbian', 'Catalan', 'Greek'];

        callback(null, result);
    }
};

let client;
if (mockTranslation) {
    client = mockClient;
} else {
    client = new translator({
        api_key: mstranslatorApiKey,
    }, true);
}

let languagesAndNames = [];

let service = module.exports = {
    client: client,
    languagesAndNames: languagesAndNames,

    getLanguagesAndNames: function(callback) {
        if (service.languagesAndNames.length){
            callback(null, service.languagesAndNames);
        }else{
            let result = [];
            client.getLanguagesForTranslate((err, codes) => {
                if (err) {
                    console.log(err);
                }
                let filtered = codes.map((code) => { //removing 'complex' languages
                    if (code.length >2){
                        let splitted = code.split('-')[0];
                        if (splitted.length === 2) return splitted;
                        else return ;
                    }else{
                        return code;
                    }
                });
                let unigue = uniq(filtered); //removing duplicates which appeared after simplifying the languages
                let params = {locale:'en', languageCodes: unigue};
                client.getLanguageNames(params, (err, names) => {
                    async.eachOf(codes, (value, key, cbEach) => {
                        if (unigue[key]){
                            result.push({'name': names[key], 'code': unigue[key]});
                            cbEach();
                        }else{
                            cbEach();
                        }
                    }, (err) => {
                        service.languagesAndNames = result;
                        callback(err, result);
                    });
                });
            });
        }
    },

    check_language_code: function(code, callback) {
        service.getLanguagesAndNames((err, languages) => {
            if (err) callback(err);
            let result = languages.map((a) => {return a.code;});
            callback(null, result.includes(code));
        });
    },

    translateLine: function(line, source, target, callback, isHTML = false) {
        let toBeTranslated = line, html;

        if (isHTML) {
            let o = htmlHandler.htmlToText(line);
            toBeTranslated = o.text; //string with the special syntax but without html
            html = o.html; //enhanced html for later updating of texts
        }

        let params = {
            text: toBeTranslated,
            from: source,
            to: target,
            contentType: isHTML ? 'text/html' : 'text/plain'
        };
        console.log('now send the following to the API:', params);
        client.translate(params, (err, data) => {
            if (isHTML && !err) {
                let translatedHtml = htmlHandler.setTranslatedTextInHtml(data, html);
                callback(err, translatedHtml);
            }
            else
                callback(err, data);
        });
    },

};

function uniq(a) { //returns an array of unique values
    let prims = {'boolean':{}, 'number':{}, 'string':{}}, objs = [];

    return a.filter((item) => {
        if (item){
            let type = typeof item;
            if(type in prims)
                return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
            else
                return objs.indexOf(item) >= 0 ? false : objs.push(item);
        }else{
            return false;
        }
    });
}
