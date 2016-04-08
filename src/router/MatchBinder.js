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
        constructor(location, parent) {
            this._parent = parent;
            this.bindings = new Set();
            this.location = location || '';
            this._active = false;

        }

        reTrigger() {
            this._parent.reTrigger();
        };

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
            if (pattern) {
                let binding = new MatchBinding(pattern, this.location, this);
                binding.setSubBinder(MatchBinder, this.location + (pattern || ''), mapHandler);
                this.bindings.add(binding);
                return binding;
            } else {
                if (typeof mapHandler === 'function') {
                    mapHandler(this.match.bind(this));
                }
                return {
                    match: this.match.bind(this)
                }
            }
        };

        clearActive(params, location) {
            let active = [];
            if (this.bindings.size > 0) {
                this.bindings.forEach((binding)=> {
                    active = active.concat(binding.clearActive(params, location));
                });
            }
            return active;
        };

        checkStatus(matched, params) {
            let active = []
            if (this.bindings.size > 0) {
                this.bindings.forEach((binding)=> {
                    active = active.concat(binding.checkSegment(matched, params));
                });
            }
            return active;
        };

        trigger(location, params, move) {
            if (this.bindings.size > 0) {
                let matched = location.replace(/^\/|$/g, '').split('/'),
                    active = this.checkStatus(matched, params);
                if (active.length > 0) {
                    let index = 0;
                    active.forEach((fn)=> {
                        fn((applied)=> {
                            if (applied) {
                                index++;
                            } else if (move) {
                                move(false);
                            }
                            if (active.length === index) {
                                this.triggerRoutes(location, params);
                                if (move) {
                                    move(true);
                                }

                            }
                        });

                    });
                } else {
                    this.triggerRoutes(location, params);
                    if (move) {
                        move(true);
                    }
                }
            }
        };

        triggerRoutes(location, params) {
            if (this.bindings.size > 0) {
                this.bindings.forEach(binding=>binding.triggerTo(location, params))
            }
        }
    }

    return MatchBinder;
}));
