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
        constructor(location, params, command) {
            this.bindings = [];
            this._activeBindings = [];
            this.location = location || '';
            this.command = command;
            this.params = params;
            this._active = false;

        }

        match(pattern, mapHandler) {
            if (typeof pattern === 'function') {
                mapHandler = pattern;
                pattern = false;
            }
            if (pattern === '') {
                pattern = false;
            }
            return this.getMatchBinding(pattern, mapHandler);
        };

        getMatchBinding(pattern, mapHandler) {
            let binding = new MatchBinding(pattern, this.location, this);
            binding.setSubBinder(MatchBinder, this.location + (pattern || ''), mapHandler);
            this.bindings.push(binding);
            return binding;

        };

        filter(location) {
            let bindings = this.bindings.filter(function(binding) {
                return binding.test(location);
            });
            return bindings;
        };

        clearActive(params, location) {
            if (this._activeBindings.length > 0) {
                this._activeBindings.forEach((binding)=> binding.clearActive(params, location));
                this._activeBindings = [];
            }
        };

        checkStatus(matched, params) {
            if (this._activeBindings.length > 0) {
                this._activeBindings = this._activeBindings.filter((binding)=> {
                    return binding.checkSegment(matched, params);
                });
            }
        };

        trigger(params, location) {
            let matched = location.replace(/^\/|$/g, '').split('/');
            this.checkStatus(matched, params);
            this.onBinding(location, params);
        };

        onBinding(location, params) {
            let bindings = this.filter(location);
            if (bindings.length > 0) {
                bindings.forEach(binding=> {
                    this.runHandler(location, params, binding);
                    let fragment = binding.getFragment(location);
                    if (fragment.trim() !== '') {
                        let subBinder = binding.getSubBinder();
                        if (subBinder && subBinder.bindings && subBinder.bindings.length > 0) {
                            subBinder.trigger(params, fragment);
                        }
                    }
                });
            }
        };

        runHandler(location, params, binding) {
            if (this._activeBindings.indexOf(binding) === -1) {
                binding.trigger('to', params, location);
                this._activeBindings.push(binding);
            }
            binding.trigger('query', params, location);
        };

        run() {
            this.command(this);
        };
    }

    return MatchBinder;
}));
