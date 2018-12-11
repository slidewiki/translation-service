/*
These are routes as defined in https://docs.google.com/document/d/1337m6i7Y0GPULKLsKpyHR4NRzRwhoxJnAZNnDFCigkc/edit#
Each route implementes a basic parameter/payload validation and a swagger API documentation description
*/
'use strict';

const Joi = require('joi'),
    handlers = require('./controllers/handler');

module.exports = function(server) {

    server.route({
        method: 'GET',
        path: '/supported',
        handler: handlers.getSupported,
        config: {
            tags: ['api']
        }
    });

    server.route({
        method: 'POST',
        path: '/translate/{targetLang}',
        handler: handlers.translateText,
        config: {
            validate: {
                params: {
                    targetLang: Joi.string().lowercase(),
                },
                payload: {
                    content: Joi.array().items(Joi.string().allow('')).single().required(),
                    language: Joi.string().lowercase().required(),
                    html: Joi.boolean().default(false),
                },
            },
            tags: ['api'],
            description: 'Translate a series of strings between languages',
        }
    });

};
