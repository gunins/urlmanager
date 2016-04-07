/*globals define*/
(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define('router/utils',[], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    }
}(this, function() {
    'use strict';

    function parseParams(value) {
        try {
            return decodeURIComponent(value.replace(/\+/g, ' '));
        }
        catch (err) {
            // Failover to whatever was passed if we get junk data
            return value;
        }
    }

    function iterateQueryString(queryString, callback) {
        let keyValues = queryString.split('&');
        keyValues.forEach((keyValue)=> {
            let arr = keyValue.split('=');
            callback(arr.shift(), arr.join('='));
        });
    }

    function setQuery(parts) {
        let query = {};
        if (parts) {
            iterateQueryString(parts, (name, value)=> {
                value = parseParams(value);
                if (!query[name]) {
                    query[name] = value;
                }
                else if (typeof query[name] === 'string') {
                    query[name] = [query[name], value];
                }
                else {
                    query[name].push(value);
                }
            });
        }
        return query;
    }

    function serialize(obj) {
        let str = [];
        for (let p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        return str.join("&");
    };

    function getLocation(params, pattern) {
        return {
            getQuery() {
                return params.query;
            },
            getLocation(fragment = '', isQuery) {
                let current = params.root.substring(0, params.root.length - pattern.length),
                    newQuery;
                if (isQuery === true) {
                    newQuery = serialize(params.query);
                }
                else if (isQuery === false) {
                    newQuery = '';
                }
                else {
                    newQuery = serialize(isQuery);
                }
                return current + fragment + (newQuery.length === 0 ? '' : '?' + newQuery);
            }
        }
    };

    // attach the .equals method to Array's prototype to call it on any array
    function equals(arr1, arr2) {
        // if the other arr2 is a falsy value, return
        if (!arr2)
            return false;
        // compare lengths - can save a lot of time
        if (arr1.length !== arr2.length)
            return false;

        for (let i = 0, l = arr1.length; i < l; i++) {
            // Check if we have nested arrays
            if (arr1[i] instanceof Array && arr2[i] instanceof Array) {
                // recurse into the nested arrays
                if (!equals(arr1[i], arr2[i]))
                    return false;
            }
            else if (arr1[i] !== arr2[i]) {
                // Warning - two different object instances will never be equal: {x:20} != {x:20}
                return false;
            }
        }
        return true;
    };
    const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
        ARGUMENT_NAMES = /(?:^|,)\s*([^\s,=]+)/g;

    function getArgs(func) {
        let fnStr = func.toString().replace(STRIP_COMMENTS, ''),
            argsList = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')),
            result = argsList.match(ARGUMENT_NAMES);
        return (result === null) ? [] : result.map(item=>item.replace(/[\s,]/g, ''));
    }

    return {
        serialize, getLocation, equals, setQuery, getArgs
    }

}));
(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define('router/MatchBinding',[
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
(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define('router/MatchBinder',[
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
            if (pattern) {
                let binding = new MatchBinding(pattern, this.location, this);
                binding.setSubBinder(MatchBinder, this.location + (pattern || ''), mapHandler);
                this.bindings.push(binding);
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
            let active = []
            if (this.bindings.length > 0) {
                this.bindings.forEach((binding)=> {
                    active = active.concat(binding.clearActive(params, location));
                });
            }
            return active;
        };

        checkStatus(matched, params) {
            let status = []
            if (this.bindings.length > 0) {
                this.bindings.forEach((binding)=> {
                    status = status.concat(binding.checkSegment(matched, params));
                });
            }
            return status;
        };

        trigger(location, params, move) {
            let matched = location.replace(/^\/|$/g, '').split('/'),
                status = this.checkStatus(matched, params);
            if (status.length > 0) {
                let index = 0;
                status.forEach((fn)=> {
                    fn((applied)=> {
                        if (applied) {
                            index++;
                        } else if (move) {
                            move(false);
                        }
                        if (status.length === index) {
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

        };

        triggerRoutes(location, params) {
            this.bindings.forEach(binding=>binding.triggerTo(location, params))

        }

        run() {
            this.command(this);
        };
    }

    return MatchBinder;
}));

/*globals define*/
(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define('router/Router',[
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
            };

            getBinder() {
                return new MatchBinder();
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

            trigger(location) {
                if (this.started) {
                    this.started = false;
                    let parts = location.split('?', 2),
                        loc = this.getLocation(parts[0]);
                    if (loc) {
                        let query = utils.setQuery(parts[1]),
                            params = {
                                root:  loc,
                                query: query
                            };
                        this.root.trigger(loc, params, (move)=> {
                            this.setLocation(move ? location : this.prevLocation);
                            this.prevLocation = location;
                            this.started = true;
                        });
                    }
                }
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


            setLocation(location) {
                this._listeners.forEach(listener=>listener(location));

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

