# Translation Microservice #
[![Build Status](https://travis-ci.org/slidewiki/translation-service.svg?branch=master)](https://travis-ci.org/slidewiki/translation-service)
[![License](https://img.shields.io/badge/License-MPL%202.0-green.svg)](https://github.com/slidewiki/translation-service/blob/master/LICENSE)
[![Language](https://img.shields.io/badge/Language-Javascript%20ECMA2015-lightgrey.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Framework](https://img.shields.io/badge/Framework-NodeJS%206.11.0-blue.svg)](https://nodejs.org/)
[![Webserver](https://img.shields.io/badge/Webserver-Hapi%2016.4.0-blue.svg)](http://hapijs.com/)
[![Coverage Status](https://coveralls.io/repos/github/slidewiki/translation-service/badge.svg?branch=master)](https://coveralls.io/github/slidewiki/translation-service?branch=master)

This repository handles translation of presentation files which are transformed to appropiate HTML for creation of deck and slides (sent to deck-service).

You want to **check out this cool service**? Simply start the service and head over to: [http://localhost:3000/documentation](http://localhost:3000/documentation). We're using  [swagger](https://www.npmjs.com/package/hapi-swagger) to have this super cool API discovery/documentation tool.
BTW.: Did you already discoverd the super easy swagger integration inside [/application/routes.js](https://github.com/slidewiki/Microservice-Template/blob/master/application/routes.js)? Tags 'api' and 'description' were everything we needed to add.

### Use Docker to run/test your application ###
---
You can use [Docker](https://www.docker.com/) to build, test and run your application locally. Simply edit the Dockerfile and run:

```
docker build -t MY_IMAGE_TAG ./
docker run -it --rm -p 8880:3000 MY_IMAGE_TAG
```

Alternatively you can use [docker-compose](https://docs.docker.com/compose/) to run your application in conjunction with a (local) mongodb instance. Simply execute:

```
docker-compose up -d
```

### Install NodeJS ###
---
Please visit the wiki at [**Install NodeJS**](https://github.com/slidewiki/microservice-template/wiki/Install-NodeJS).
