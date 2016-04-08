## URL Manager [![Build Status](https://api.travis-ci.org/gunins/urlmanager.svg?branch=master)](https://travis-ci.org/gunins/urlmanager)

Library for managing urls.

## Why "URL Manager"

Url manager is library for manipulating Urls in javascript. Works on browser and nodejs. It parses url, aplit to chunks, and executes any particular part from url.

## Prerequisites

You need to install [**nodejs**](http://nodejs.org/) and **grunt CLI** globally `npm -g install grunt-cli`

## Installation

Using npm

    npm install urlmanager

Using Bower

    bower install urlmanager

## How to use

using `AMD`

    define(['router/Router'], function (Router) {

        var router = new Router;
         ... Routes Goes here ...
        router.start();
    });

Using as global in html file add.

    <script src="node_modules/urlmanager/prod/Router"></script>

In Code use

    <script>
        var router = new UrlManager.Router();
         ... Routes Goes here ...
        router.start();
    </script>

### Route triggering

To use for Window hash changes add this in to your main file, after router is initialised.

    (function(window){
        var hash='';
        function onHashChange() {
            var match = window.location.href.match(/#(.*)$/);
            router.trigger(match ? match[1] : '');
            router.setListener(function(location) {
                if(match[1]!==location){
                    window.location.href = match[0] + '#' + location;
                }
            });
        };
        window.addEventListener('hashchange', onHashChange, false);
        onHashChange();
    })(window);
### To routes joined

Function `to` will bind when route is triggered

        match('/levelA').to(function () {
            ... Your Function execution
        });

In this case function will be triggered when location hash `#/levelA` will be triggered

### When Routes Leaved

        match('/levelA').leave(function () {
            ... Your Function execution
        });

In this case function will be triggered when location hash `#/levelA` will be changed to any other.

#### Asynchronus leaving

        match('/levelA').leave(function (done) {
            ... Your Function execution
            done(true); // Boolean true or false
        });

In this case function will be triggered when location hash `#/levelA` will be changed to any other, and function `done()` executed. this is handy for forms, if you want to confirm, leaving.

### When Query will be changed

        match('/levelA').query(function (param) {
            param.getQuery(); Will give you query
            ... Your Function execution
        });

In this case function will be triggered when location hash `#/levelA?a=15` query param will added, it triggers any time query is changed.

### Dynamic params

        match('/:a/:b').to(function (a,b) {
            //a and b is url params
            ... Your Function execution
        });

In this case function will be triggered when location hash `#/item/5` will be triggered params `a = item` and `b=5`


###Optional params

        match('/:a(/:b)').to(function (a,b) {
            //a and b is url params
            ... Your Function execution
        });

In this case function will be triggered when location hash `#/item` and `#/item/5` will be triggered

###Splat params

        match('/file/*file').to(function (file) {
            /file 
            ... Your Function execution
        });

In this case function will be triggered when location hash `#/file/file/location/file.txt` will be triggered and `file/location/file.txt` will return as extension

### Chaining Methods

        match('/levelA').to(function () {
            ... Your Function execution
        }).leave(function () {
              ... Your Function execution
         }).query(function (param) {
                param.getQuery(); Will give you query
                ... Your Function execution
        });

You can chain the methods

### Nested routes

        match('/levelA', function(match){
                match('/levelB').to(function () {
                    ... Your Function for levelB execution
                });
        }).to(function () {
            ... Your Function execution
        });

In this case function will be triggered when location hash `#/levelA`, and when triggering `#/levelA/levelB` levelB function will be triggered.

Nested Routes not limited, how deep you go in.

- Live examples you can see in examples section. For see how to start, go in [examples](https://github.com/gunins/urlmanager/tree/master/examples).



