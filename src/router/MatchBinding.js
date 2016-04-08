(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            './utils'
        ], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('./utils'));
    }
}(this, function(utils) {
    'use strict';


    class MatchBinding {
        constructor(pattern, location, binder) {
            if (binder) {
                this.binder = binder;
            }
            if (location === '') {
                this.pattern = pattern.replace(/^\(\/\)/g, '').replace(/^\/|$/g, '');
            } else {
                let match = pattern.match(/^(\/|\(\/)/g);
                if (match === null) {
                    pattern = pattern[0] === '(' ? '(/' + pattern.substring(1) : '/' + pattern;
                }
                this.pattern = pattern;
            }

            let route = this.pattern.replace(MatchBinding.ESCAPE_PARAM, '\\$&')
                .replace(MatchBinding.OPTIONAL_PARAM, '(?:$1)?')
                .replace(MatchBinding.NAMED_PARAM, function(match, optional) {
                    return optional ? match : '([^\/]+)';
                }).replace(MatchBinding.SPLAT_PARAM, '(.*)');

            this.patternRegExp = new RegExp('^' + route);

            this.routeHandler = new Set();
            this.leaveHandler = new Set();
            this.queryHandler = new Set();
            this._active = false;
        }

        setRoutes(mapHandler) {
            var subBinder = this.subBinder;
            mapHandler({
                match: subBinder.match.bind(subBinder)
            });
            return this;
        };

        reTrigger() {
            this.binder.reTrigger();
        }

        match(match) {
            var subBinder = this.subBinder;
            match(subBinder.match.bind(subBinder));
            return this;
        };

        to(routeHandler) {
            this.routeHandler.add({handler: routeHandler, done: false});
            this.reTrigger();
            return this;
        };

        leave(leaveHandler) {
            var args = utils.getArgs(leaveHandler);
            this.leaveHandler.add({handler: leaveHandler, done: (args.length > 0 && args[0] === 'done')});
            return this;
        };

        query(queryHandler) {
            this.queryHandler.add({handler: queryHandler, done: false});
            return this;
        };

        remove() {
            this.routeHandler.clear();
            this.leaveHandler.clear();
            this.queryHandler.clear();
            return this;
        };

        test(location) {
            return this.patternRegExp.test(location);
        };

        getFragment(location) {
            let matches = location.match(this.patternRegExp);
            return matches === null ? '' : location.substring(matches[0].length);
        };

        extractParams(fragment) {
            let params = this.patternRegExp.exec(fragment)
            if (params && params.length > 0) {
                return params.slice(1).map(function(param) {
                    return param ? decodeURIComponent(param) : null;
                });
            } else {
                return [];
            }
        };

        setSubBinder(MatchBinder, pattern, mapHandler) {
            let subBinder = new MatchBinder(pattern, this);
            this.subBinder = subBinder;
            if (typeof mapHandler === 'function') {
                mapHandler(subBinder.match.bind(subBinder));
            }
            return subBinder;
        };


        checkSegment(matched, params) {
            let status = [];
            if (this._active) {
                let pattern = this.pattern.replace(/\((.*?)\)/g, '$1').replace(/^\//, '').split('/'),
                    prevLoc = this.prevLoc.replace(/^\//, '').split('/'),
                    currSegment = matched.slice(0, pattern.length),
                    prevSegment = prevLoc.slice(0, pattern.length),
                    equals = (utils.equals(currSegment, prevSegment));

                if (!equals) {
                    status = this.clearActive(params);
                } else if (matched.length > 1) {
                    status = this.subBinder.checkStatus(matched.slice(pattern.length), params);
                } else if (equals) {
                    status = this.subBinder.clearActive(params);
                }
            }
            return status;
        }

        clearActive(params) {
            let active = [];
            if (this._active) {
                active.push(this.triggerLeave(params));
                this._active = false;
            }

            return active.concat(this.subBinder.clearActive());
        }

        triggerTo(location, params) {
            if (this.test(location)) {
                if (!this._active) {
                    this.trigger('to', params, location);
                    this._active = true;
                }
                this.trigger('query', params, location);
                let fragment = this.getFragment(location);
                if (fragment.trim() !== '') {
                    let subBinder = this.subBinder;
                    if (subBinder) {
                        subBinder.trigger(fragment, params);
                    }
                }
            }
        };

        triggerLeave(params) {
            return (cb)=> {
                let handlers = this.leaveHandler,
                    location = utils.getLocation(params, this.prevLoc),
                    items = 0,
                    stopped = false;
                if (handlers && handlers.size > 0) {
                    handlers.forEach((item)=> {
                        if (item.done) {
                            items++;
                        }
                        item.handler((done = true)=> {
                            if (done) {
                                items--;
                                if (items === 0 && !stopped) {
                                    cb(true);
                                }
                            } else if (!done && !stopped) {
                                stopped = true;
                            }
                            if (stopped) {
                                cb(false);
                            }
                        }, location);

                    });
                }
                if (items === 0) {
                    cb(true);
                }
            }
        }

        getHandlers(name) {
            let map = {
                to: 'routeHandler', leave: 'leaveHandler', query: 'queryHandler'
            }
            return this[map[name]];
        };

        trigger(name, params, location) {
            if (name === 'to') {
                this.prevLoc = location;
            }

            let args = this.extractParams(location).concat(utils.getLocation(params, location)),
                handlers = this.getHandlers(name);
            this.applyHandlers(handlers, args)
        };

        applyHandlers(handlers, args = []) {
            if (handlers && handlers.size > 0) {
                handlers.forEach((item)=> {
                    item.handler.apply(this, args);
                });
            }
        }
    }

    Object.assign(MatchBinding, {
        OPTIONAL_PARAM: /\((.*?)\)/g,
        NAMED_PARAM:    /(\(\?)?:\w+/g,
        SPLAT_PARAM:    /\*\w+/g,
        ESCAPE_PARAM:   /[\-{}\[\]+?.,\\\^$|#\s]/g
    });

    return MatchBinding;
}));