/*
This is a demo application implementing some interfaces as described in https://docs.google.com/document/d/1337m6i7Y0GPULKLsKpyHR4NRzRwhoxJnAZNnDFCigkc/edit#
*/

'use strict';

//This is our webserver framework (instead of express)
const hapi = require('hapi'),
    co = require('./common');

//Initiate the webserver with standard or given port
const server = new hapi.Server();

let port = (!co.isEmpty(process.env.APPLICATION_PORT)) ? process.env.APPLICATION_PORT : 3000;
server.connection({
    port: port
});
let host = (!co.isEmpty(process.env.VIRTUAL_HOST)) ? process.env.VIRTUAL_HOST : server.info.host;

//Export the webserver to be able to use server.log()
module.exports = server;

//Plugin for sweet server console output
let plugins = [
    require('inert'),
    require('vision'), {
        register: require('good'),
        options: {
            ops: {
                interval: 1000
            },
            reporters: {
                console: [{
                    module: 'good-squeeze',
                    name: 'Squeeze',
                    args: [{
                        log: '*',
                        response: '*',
                        request: '*'
                    }]
                }, {
                    module: 'good-console'
                }, 'stdout']
            }
        }
    }, { //Plugin for swagger API documentation
        register: require('hapi-swagger'),
        options: {
            host: host,
            info: {
                title: 'Deck and Slide Translation API',
                description: 'Powered by node, hapi, joi, hapi-swaggered, hapi-swaggered-ui and swagger-ui',
                version: '0.1.0'
            }
        }
    }
];

//Register plugins and start webserver
server.register(plugins, (err) => {
    if (err) {
        console.error(err);
        global.process.exit();
    } else {
        server.start(() => {
            server.log('info', 'Server started at ' + server.info.uri);
            //Register routes
            require('./routes.js')(server);
        });
    }
});
