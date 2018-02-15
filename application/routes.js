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

};
