/*globals define*/
(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            './MatchBinder',
            './utils'
        ], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('./MatchBinder'), require('./utils'));
    }
}(this, function(MatchBinder, utils) {
        'use strict';

        class Router {
            constructor(location) {
                if (location !== undefined && location !== '') {
                    this._location = location.replace(/^\/|\/$/g, '') + '/';
                }
                this.root = this.getBinder();
                this._listeners = new Set();
                this._handlers = new Set();
            };

            getBinder() {
                return new MatchBinder('', this);
            };

            test(loc) {
                return new RegExp('^' + this._location, 'g').test(loc);
            }

            getLocation(loc) {
                let location = loc.replace(/^\/|$/g, '');
                if (this._location !== undefined) {
                    if (this.test(location)) {
                        return location.replace(this._location, '');
                    } else {
                        return false;
                    }
                }
                return location;
            };

            reTrigger() {
                if (this.currLocation) {
                    this.trigger(this.currLocation);
                }
            };


            trigger(location) {
                if (this.started && location) {
                    this.started = false;
                    this.currLocation = location;
                    let parts = location.split('?', 2),
                        segments = this.getLocation(parts[0]);
                    if (segments || segments === '') {
                        let query = utils.setQuery(parts[1]),
                            params = {
                                root:  segments,
                                query: query
                            };
                        this.execute(segments, params);
                    }
                }
            };

            execute(location, params) {
                let matched = location.replace(/^\/|$/g, '').split('/'),
                    binder = this.root,
                    active = binder.checkStatus(matched, params);
                if (active.length > 0) {
                    active.forEach((item)=> {
                        item.handler((applied)=> {
                            if (!item.triggered) {
                                item.triggered = true;
                                item.applied = applied;
                                if (active.filter(item=>item.applied).length === active.length) {
                                    active.forEach(item=>item.disable());
                                    this.setRoutes(true, location, params);
                                } else if (active.filter(item=>item.triggered).length === active.length) {
                                    this.setRoutes(false);
                                }
                            }
                        });
                    });

                } else {
                    this.setRoutes(true, location, params);
                }

            };

            setRoutes(move, location, params) {
                if (move) {
                    this._handlers.forEach(handler=>handler());
                    this.root.triggerRoutes(location, params);
                }
                this.setLocation(move);

            };

            setListener(listener) {
                let listeners = this._listeners;
                listeners.add(listener);
                return {
                    remove(){
                        listeners.delete(listener);
                    }
                }
            };

            onRouteChange(handler) {
                let handlers = this._handlers;
                handlers.add(handler);
                return {
                    remove(){
                        handlers.delete(handler);
                    }
                }
            };


            setLocation(move) {
                let location = move ? this.currLocation : this.prevLocation;
                this.prevLocation = location;
                this.started = true;
                this._listeners.forEach(listener=>listener(location, move));
            };

            match(mapHandler) {
                mapHandler(this.root.match.bind(this.root));
            };

            start() {
                this.started = true;
            };

            stop() {
                this.started = false;
            };
        }
        return Router;
    }
));
