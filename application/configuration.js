/* This module is used for configuring the service */
'use strict';

module.exports = {

    mockTranslation: process.env.SERVICE_TRANSLATION_MSAPI_KEY ? false : true,

    mstranslatorApiKey: process.env.SERVICE_TRANSLATION_MSAPI_KEY ? process.env.SERVICE_TRANSLATION_MSAPI_KEY : '',

};
