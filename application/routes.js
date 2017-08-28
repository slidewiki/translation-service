/*
These are routes as defined in https://docs.google.com/document/d/1337m6i7Y0GPULKLsKpyHR4NRzRwhoxJnAZNnDFCigkc/edit#
Each route implementes a basic parameter/payload validation and a swagger API documentation description
*/
'use strict';

const Joi = require('joi'),
    handlers = require('./controllers/handler');

module.exports = function(server) {
    //Get an object with id id from database and translate it to the target language (when not available, return NOT FOUND). Validate id
    server.route({
        method: 'POST',
        path: '/{type}/{id}',
        handler: handlers.translateObject,
        config: {
            validate: {
                params: {
                    id: Joi.string(),
                    type: Joi.string().valid(['slide', 'deck'])
                },
                payload: {
                    target: Joi.string().min(5).max(5).required(),
                    user: Joi.number().integer(),
                }
            },
            tags: ['api'],
            description: 'Translate an object'
        }
    });

    server.route({
        method: 'GET',
        path: '/supported',
        handler: handlers.getSupported,
        config: {
            tags: ['api']
        }

    });

    //Create new slide (by payload) and return it (...). Validate payload
    // server.route({
    //     method: 'POST',
    //     path: '/slide/new',
    //     handler: handlers.newSlide,
    //     config: {
    //         validate: {
    //             payload: Joi.object().keys({
    //                 title: Joi.string(),
    //                 body: Joi.string(),
    //                 user_id: Joi.string().alphanum().lowercase(),
    //                 root_deck_id: Joi.string().alphanum().lowercase(),
    //                 parent_deck_id: Joi.string().alphanum().lowercase(),
    //                 no_new_revision: Joi.boolean(),
    //                 position: Joi.number().integer().min(0),
    //                 language: Joi.string()
    //             }).requiredKeys('title', 'body'),
    //         },
    //         tags: ['api'],
    //         description: 'Create a new slide'
    //     }
    // });

    //Update slide with id id (by payload) and return it (...). Validate payload
    // server.route({
    //     method: 'PUT',
    //     path: '/slide/{id}',
    //     handler: handlers.replaceSlide,
    //     config: {
    //         validate: {
    //             params: {
    //                 id: Joi.string().alphanum().lowercase()
    //             },
    //             payload: Joi.object().keys({
    //                 title: Joi.string(),
    //                 body: Joi.string(),
    //                 user_id: Joi.string().alphanum().lowercase(),
    //                 root_deck_id: Joi.string().alphanum().lowercase(),
    //                 parent_deck_id: Joi.string().alphanum().lowercase(),
    //                 no_new_revision: Joi.boolean(),
    //                 position: Joi.number().integer().min(0),
    //                 language: Joi.string()
    //             }).requiredKeys('title', 'body'),
    //         },
    //         tags: ['api'],
    //         description: 'Replace a slide'
    //     }
    // });
};
