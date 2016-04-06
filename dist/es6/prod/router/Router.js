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

    function getLocation(params) {
        return {
            getQuery() {
                return params.query;
            },
            getLocation(fragment = '', isQuery) {
                let current = params.root, //.substring(0, params.root.length - location.length),
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

    return {
        serialize, getLocation, equals, setQuery
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
                this.pattern = location = pattern.replace(/^\(\/\)/g, '').replace(/^\/|$/g, '');
            } else {
                this.pattern = pattern;
                location = (location + pattern);
            }
            this.location = location.replace(/\((.*?)\)/g, '$1').replace(/^\/|$/g, '');

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
            this.routeHandler.push(routeHandler);
            return this;
        };

        leave(leaveHandler) {
            this.leaveHandler.push(leaveHandler);
            return this;
        };

        query(queryHandler) {
            this.queryHandler.push(queryHandler);
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
            if (mapHandler) {
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
            let pattern = this.pattern.replace(/\((.*?)\)/g, '$1').replace(/^\//, '').split('/'),
                prevLoc = this.prevLoc.replace(/^\//, '').split('/'),
                currSegment = matched.slice(0, pattern.length),
                prevSegment = prevLoc.slice(0, pattern.length),
                equals = (utils.equals(currSegment, prevSegment));

            if (!equals) {
                this.clearActive(params);
            } else if (matched.length > 1) {
                this.getSubBinder().checkStatus(matched.slice(pattern.length), params);
            } else {
                this.getSubBinder().clearActive(params);
            }

            return equals;


        }

        clearActive(params, location) {
            this.trigger('leave', params, location);
            this.getSubBinder().clearActive();
        }

        trigger(name, params, location) {
            if (name === 'to') {
                this.prevLoc = location;
            }
            let args = this.extractParams(location),
                handlers = this.getHandlers(name);

            if (handlers && handlers.length > 0) {
                handlers.forEach((handler)=> {
                    handler.apply(this, args.concat(utils.getLocation(params)));
                });
            }
        };
    }
    ;
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
                this.bindings = [];
            };

            getBinder(location) {
                return new MatchBinder(location);
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
                    let parts = location.split('?', 2),
                        loc = this.getLocation(parts[0]);
                    if (loc) {
                        let query = utils.setQuery(parts[1]),
                            params = {
                                root:  loc,
                                query: query
                            };
                        this.root.trigger(params, loc);
                    }

                    /*  this.bindings = this.bindings.filter((binding)=> {

                     let fragment = binding.checkSegment(matched.slice(0), loc);

                     if (fragment) {
                     matched = fragment;
                     binding.trigger('leave', params, location);
                     binding.setOnBind();
                     }
                     return !fragment;
                     });


                     let bindings = this.find(this.root, loc);
                     if (bindings.length > 0) {
                     bindings.forEach(binding=>this.onBinding(loc, params, binding));
                     }*/
                }
            };

            /*  find(binder, location) {
             let bindings = binder.filter(location);
             return bindings;
             };*/

            /*     execute(binder) {
             let binderlocation = binder.location.split('/'),
             rootLocation = binder.params.root.split('/'),
             location = '/' + rootLocation.splice(binderlocation.length, rootLocation.length -
             binderlocation.length).join('/');
             let bindings = this.find(binder, location);
             if (bindings.length > 0) {
             bindings.forEach(binding=>this.onBinding(location, binder.params, binding));
             }

             };*/

            /*       onBinding(location, params, binding) {
             binding.setOnBind(this.onBinding.bind(this, location, params, binding));
             this.runHandler(location, params, binding);
             let fragment = binding.getFragment(location);
             let subBinder = binding.getSubBinder();
             if (subBinder && subBinder.bindings && subBinder.bindings.length > 0) {
             let bindings = this.find(subBinder, fragment);
             if (bindings.length > 0) {
             bindings.forEach(binding=>this.onBinding(fragment, params, binding));
             }

             }
             let subRoutes = binding.getRoutes();
             if (subRoutes && subRoutes.length > 0) {
             while (subRoutes.length > 0) {
             let Route = subRoutes[0],
             binder = new MatchBinder(binding.location || binding.getFragment(location), params, this.execute.bind(this));
             console.log(binder);
             Route(binder);
             subBinder.bindings = subBinder.bindings.concat(binder.bindings);
             subRoutes.shift();
             }
             }

             };*/


            /* runHandler(location, params, binding) {

             if (this.bindings.indexOf(binding) === -1) {
             binding.trigger('to', params, location);

             this.bindings.push(binding);
             }
             binding.trigger('query', params, location);


             };*/

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

