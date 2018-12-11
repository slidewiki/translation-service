/* eslint promise/always-return: "off" */

'use strict';

const boom = require('boom');
const async = require('async');
const translationImpl = require('../services/mstranslator');

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

};
