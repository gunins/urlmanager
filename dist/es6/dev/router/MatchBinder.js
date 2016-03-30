(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            './MatchBinding'
        ], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('./MatchBinding'));
    } else {
        // Browser globals (root is window)
        root.UrlManager = root.UrlManager || {};
        root.UrlManager.MatchBinder = factory(root.UrlManager.MatchBinding);
    }
}(this, function(MatchBinding) {
    'use strict';
    
    class MatchBinder {
        constructor(location, params, command, root) {
            this.bindings = [];
            this.location = root || location || '';
            this.command = command;
            this.params = params;

        }

        match(pattern, mapHandler) {

            if (typeof pattern === 'function') {
                mapHandler = pattern;
                pattern = false;
            }
            if (pattern === '') {
                pattern = false;
            }

            let binding = this.getMatchBinding(pattern, this.location);
            this.bindings.push(binding);

            let subBinder = this.getSubBinder(this.location + (pattern || ''));
            binding.setSubBinder(subBinder);

            if (mapHandler) {
                mapHandler(subBinder.match.bind(subBinder));
            }
            return binding;
        };

        getSubBinder(pattern) {
            return new MatchBinder(pattern);
        };

        getMatchBinding(pattern, root) {
            return new MatchBinding(pattern, root);
        };

        filter(location) {
            return this.bindings.filter(function(binding) {
                return binding.test(location);
            });
        };

        run() {
            this.command(this);
        };
    }

    return MatchBinder;
}));
