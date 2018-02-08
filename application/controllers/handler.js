/*
Handles the requests by executing stuff and replying to the client. Uses promises to get stuff done.
*/

'use strict';

const boom = require('boom'), //Boom gives us some predefined http codes and proper responses
    jobDB = require('../database/jobDatabase'),
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
        translator.translate(request.params.id, request.payload.target, request.payload.user, request.payload.jobId).then((translatedObject) => {
            //if (err) console.log(err);
            if (co.isEmpty(translatedObject))
                reply(boom.notFound());
            else
                reply(translatedObject);
        }).catch((error) => {
            console.log('error', error);
            reply(boom.badImplementation());
        });
    },

    getJobByNewId: function(request, reply) {
        jobDB.getJobByNewId(request.params.newId)
            .then((job) => {
                reply(job);
            })
            .catch((err) => {
                console.log('error', err);
                reply(boom.notFound());
            }            );

    }

};
