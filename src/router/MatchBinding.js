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
                this._binder = binder;
            }
            if (location === '') {
                this.pattern = pattern.replace(/^\(\/\)/g, '').replace(/^\/|$/g, '');
            } else {
                this.pattern = pattern;
            }

            let route = this.pattern.replace(MatchBinding.ESCAPE_PARAM, '\\$&')
                .replace(MatchBinding.OPTIONAL_PARAM, '(?:$1)?')
                .replace(MatchBinding.NAMED_PARAM, function(match, optional) {
                    return optional ? match : '([^\/]+)';
                }).replace(MatchBinding.SPLAT_PARAM, '(.*?)');

            this.patternRegExp = new RegExp('^' + route);

            this.routeHandler = [];
            this.leaveHandler = [];
            this.queryHandler = [];
            this.routes = [];
            this._active = false;
        }

        onBind() {
        };

        setOnBind(onBinding) {
            this.onBind = onBinding
        };

        rebind() {
            if (this.onBind !== undefined) {
                this.onBind();
            }
        };

        setRoutes(routes) {
            this.routes.push(routes);
            return this;
        };

        getRoutes() {
            return this.routes;
        };

        match(match) {
            var subBinder = this.getSubBinder();
            match(subBinder.match.bind(subBinder))
            return this;
        };

        to(routeHandler) {
            this.routeHandler.push({handler: routeHandler, done: false});
            return this;
        };

        leave(leaveHandler) {
            var args = utils.getArgs(leaveHandler);
            this.leaveHandler.push({handler: leaveHandler, done: (args.length > 0 && args[0] === 'done')});
            return this;
        };

        query(queryHandler) {
            this.queryHandler.push({handler: queryHandler, done: false});
            return this;
        };

        remove() {
            this.routes.splice(0, this.routes.length);
            this.routeHandler.splice(0, this.routeHandler.length);
            this.leaveHandler.splice(0, this.leaveHandler.length);
            this.queryHandler.splice(0, this.queryHandler.length);
            return this;
        };

        test(location) {
            return this.patternRegExp.test(location);
        };

        getFragment(location) {
            let subLocation = this.applyParams(location);
            return location.replace(subLocation, '');
        };

        applyParams(location) {
            let matches = this.pattern.replace(/\((.*?)\)/g, '$1').split('/');
            let matches2 = location.split('/');
            return matches2.splice(0, matches.length).join('/');
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
            let subBinder = new MatchBinder(pattern);
            this.subBinder = subBinder;
            if (typeof mapHandler === 'function') {
                mapHandler(subBinder.match.bind(subBinder));
            }
            return subBinder;
        };

        getSubBinder() {
            return this.subBinder;
        };

        getHandler() {
            return this.routeHandler;
        };

        getLeaveHandler() {
            return this.leaveHandler;
        };

        getQueryHandler() {
            return this.queryHandler;
        };

        getHandlers(name) {
            let map = {
                to: 'getHandler', leave: 'getLeaveHandler', query: 'getQueryHandler'
            }
            return this[map[name]]();
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
                    status = this.getSubBinder().checkStatus(matched.slice(pattern.length), params);
                } else if (equals) {
                    status = this.getSubBinder().clearActive(params);
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

            return active.concat(this.getSubBinder().clearActive());
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
                    let subBinder = this.getSubBinder();
                    if (subBinder && subBinder.bindings && subBinder.bindings.length > 0) {
                        subBinder.trigger(fragment, params);
                    }
                }
            }
        };

        triggerLeave(params) {
            return (cb)=> {
                let handlers = this.getLeaveHandler(),
                    loc = utils.getLocation(params, this.prevLoc),
                    items = 0,
                    stopped = false;
                handlers.forEach((item)=> {
                    if (item.done) {
                        items++;
                    }
                    let caller = (done = true)=> {
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
                    }
                    item.handler(caller, loc);

                });
                if (items === 0) {
                    cb(true);
                }


            }
        }

        trigger(name, params, location) {
            if (name === 'to') {
                this.prevLoc = location;
            }
            let args = this.extractParams(location).concat(utils.getLocation(params, location)),
                handlers = this.getHandlers(name);
            this.applyHandlers(handlers, args)
        };

        applyHandlers(handlers, args = []) {
            if (handlers && handlers.length > 0) {
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