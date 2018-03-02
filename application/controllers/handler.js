/* eslint promise/always-return: "off" */

'use strict';

const boom = require('boom'), //Boom gives us some predefined http codes and proper responses
    async = require('async'),
    slideTranslator = require('../lib/slideTranslator'),
    deckTranslator = require('../lib/deckTranslator'),
    translationImpl = require('../services/mstranslator'),
    co = require('../common');

module.exports = {

    getSupported: function(request, reply){
        translationImpl.getLanguagesAndNames((err, languages) => {
            reply(languages);
        });
    },

    translateText: function(request, reply) {
        // check if languages are supported
        let targetLang = request.params.targetLang,
            targetCode = targetLang.substring(0, 2),
            sourceLang = request.payload.language,
            sourceCode = sourceLang.substring(0, 2);

        translationImpl.getLanguagesAndNames((err, languages) => {
            if (err) {
                request.log('error', err);
                return reply(boom.badImplementation());
            }

            if (languages.every((lang) => lang.code !== targetCode)) {
                // not found
                return reply(boom.notFound());
            }

            if (languages.every((lang) => lang.code !== sourceCode)) {
                // not found in payload, bad data
                return reply(boom.badData(`unsupported source language code: ${sourceLang}`));
            }

            // TODO merge with HTML strip-recombine work (?)

            async.concatSeries(request.payload.content, (line, done) => {
                translationImpl.translateLine(line, sourceCode, targetCode, done, request.payload.html);
            }, (err, translations) => {
                if (err) {
                    request.log('error', err);
                    return reply(boom.badImplementation());
                }

                reply({sourceCode, targetCode, translations});
            });

        });

    },

    //Get slide from database or return NOT FOUND
    translateObject: function(request, reply) {
        let translator;
        if (request.params.type === 'slide') {
            translator = slideTranslator;
        } else if (request.params.type === 'deck') {
            translator = deckTranslator;
        }

        //console.log(request.payload.user);
        translator.translate(request.params.id, request.payload.target, request.payload.user).then((translatedObject) => {
            //if (err) console.log(err);
            if (co.isEmpty(translatedObject))
                reply(boom.notFound());
            else
                reply(translatedObject);
        }).catch((err) => {
            request.log('error', err);
            reply(boom.badImplementation());
        });
    },

};
