/* eslint promise/always-return: "off" */

'use strict';

const boom = require('boom'), //Boom gives us some predefined http codes and proper responses
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
