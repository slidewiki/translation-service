'use strict';

//require
let Ajv = require('ajv');
let ajv = Ajv({
    verbose: true,
    allErrors: true
    //v5: true  //enable v5 proposal of JSON-schema standard
}); // options can be passed, e.g. {allErrors: true}

//build schema
const objectid = {
    type: 'integer',
    maxLength: 24,
    minLength: 1
};
const contributor = {
    type: 'object',
    properties: {
        user: objectid,
        count: {
            type: 'integer',
            minimum: 1
        }
    },
    required: ['user']
};
//build schema
const contentItem = {
    type: 'object',
    properties: {
        order: {
            type: 'integer',
            minimum: 1
        },
        kind: {
            type: 'string',
            enum: ['deck', 'slide']
        },
        ref: {
            type: 'object',
            properties: {
                id: objectid,
                revision: {
                    type: 'integer',
                    minimum: 1
                } //if not given use the last revision
            },
            required: ['id']
        }
    },
    required: ['kind', 'ref']
};
const deckRevision = {
    type: 'object',
    properties: {
        id: { //increment with every new revision
            type: 'number',
            minimum: 1
        },
        title: {
            type: 'string'
        },
        timestamp: {
            type: 'string',
            format: 'date-time'
        },
        user: objectid,
        parent: {
            type: 'object',
            // properties: {
            //     id: {
            //         type: 'integer'
            //     },
            //     revision: {
            //         type: 'integer'
            //     }
            // }
        },
        popularity: {
            type: 'number',
            minimum: 0
        },
        theme: {
            type: 'object',
            properties: {
                default: objectid
            }
        },
        transition: {
            type: 'object',
            properties: {
                default: objectid
            }
        },
        comment: {
            type: 'string'
        },
        abstract: {
            type: 'string'
        },
        footer: {
            type: 'string'
        },
        // license: {
        //     type: 'string',
        //     enum: ['CC0', 'CC BY', 'CC BY-SA']
        // },
        isFeatured: {
            type: 'number'
        },
        priority: {
            type: 'number'
        },
        visibility: {
            type: 'boolean'
        },
        language: {
            type: 'string'
        },
        translation: {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    enum: ['original', 'google', 'revised']
                },
                source: {
                    type: 'object'
                }
            }
        },
        tags: {
            type: 'array',
            items: {
                type: 'string'
            }
        },
        preferences: {
            type: 'array',
            items: {
                type: 'object'
            }
        },
        contentItems: {
            type: 'array',
            items: contentItem
        },
        dataSources: { //is filled out automatically from the slides
            type: 'array',
            items: {
                type: 'string'
            }
        },
        usage: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: objectid,
                    revision: {
                        type: 'number',
                        minimum: 1
                    }
                },
                required: ['id','revision']
            }
        }
    },
    translated_from: { //if this deck_revision is a result of translation
        type: 'object',
        properties: {
            status: {
                type: 'string',
                enum: ['original', 'google', 'revised', null]
            },
            source: {
                type: 'object',
                properties: {
                    id: {
                        type: 'number'
                    },
                    revision: {
                        type: 'number'
                    }
                }
            },
            translator: {
                type: 'object',
                properties: {
                    id: {
                        type: 'number',
                    },
                    username:{
                        type: 'string'
                    }
                }
            }
        }
    },
    required: ['id', 'timestamp', 'user']
};
const deck = {
    type: 'object',
    properties: {
        timestamp: {
            type: 'string',
            format: 'date-time'
        },
        user: objectid,
        // kind: {
        //     type: 'string'
        // },
        description: {
            type: 'string'
        },
        // language: {
        //     type: 'string'
        // },
        // translation: {
        //     type: 'object'
        // },
        lastUpdate: {
            type: 'string',
            format: 'date-time'
        },
        revisions: {
            type: 'array',
            items: deckRevision
        },
        tags: {
            type: 'array',
            items: {
                type: 'string'
            }
        },
        contributors: {
            type: 'array',
            items: {
                contributor
            }
        },
        active: {
            type: 'integer'
        },
        datasource: {
            type: 'string'
        },
        license: {
            type: 'string',
            enum: ['CC0', 'CC BY', 'CC BY-SA']
        },
        translations: { //put here all translations explicitly - deck ids
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    language: {
                        type: 'string'
                    },
                    deck_id: objectid
                }
            }
        },
        translated_from: { //if this deck is a result of translation
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    enum: ['original', 'google', 'revised', null]
                },
                source: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'number'
                        },
                        revision: {
                            type: 'number'
                        }
                    }
                },
                translator: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'number',
                        },
                        username:{
                            type: 'string'
                        }
                    }
                }
            }
        }
    },
    required: ['timestamp', 'user']
};

//export
module.exports = ajv.compile(deck);
