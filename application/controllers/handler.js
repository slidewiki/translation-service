/*
Handles the requests by executing stuff and replying to the client. Uses promises to get stuff done.
*/

'use strict';

const boom = require('boom'), //Boom gives us some predefined http codes and proper responses
    slideDB = require('../database/slideDatabase'), //Database functions specific for slides
    deckDB = require('../database/deckDatabase'), //Database functions specific for decks
    helper = require('../database/helper'),
    co = require('../common');


module.exports = {
    //Get slide from database or return NOT FOUND
    translateObject: function(request, reply) {
        let db_linker = '';
        switch (request.params.type) {
            case 'slide' : db_linker = slideDB;
                break;
            case 'deck' : db_linker = deckDB;
                break;
        }
        //console.log(request.payload.user);
        db_linker.translate(encodeURIComponent(request.params.id), encodeURIComponent(request.payload.target), encodeURIComponent(request.payload.user)).then((translatedObject) => {
            if (co.isEmpty(translatedObject))
                reply(boom.notFound());
            else
                reply(translatedObject);
        }).catch((error) => {
            console.log('error', error);
            reply(boom.badImplementation());
        });
    },

    getSupported: function(request, reply){
        helper.getLanguagesAndNames((err, languages) => {
            reply(languages);
        });
    }

    //Create Slide with new id and payload or return INTERNAL_SERVER_ERROR
    // newSlide: function(request, reply) {
    //     slideDB.insert(request.payload).then((inserted) => {
    //         if (co.isEmpty(inserted.ops[0]))
    //             throw inserted;
    //         else
    //         reply(co.rewriteID(inserted.ops[0]));
    //     }).catch((error) => {
    //         request.log('error', error);
    //         reply(boom.badImplementation());
    //     });
    // },
    //
    // //Update Slide with id id and payload or return INTERNAL_SERVER_ERROR
    // replaceSlide: function(request, reply) {
    //     slideDB.replace(encodeURIComponent(request.params.id), request.payload).then((replaced) => {
    //         if (co.isEmpty(replaced.value))
    //             throw replaced;
    //         else
    //         reply(replaced.value);
    //     }).catch((error) => {
    //         request.log('error', error);
    //         reply(boom.badImplementation());
    //     });
    // },
};
