define(['./MatchBinder'], function (MatchBinder) {
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
        var keyValues = queryString.split('&');
        keyValues.forEach(function (keyValue) {
            var arr = keyValue.split('=');
            callback(arr.shift(), arr.join('='));
        });
    }

    function Router() {
        this.root = this.getBinder();
    }

    Router.prototype.getBinder = function () {
        return new MatchBinder();
    };
    Router.prototype.match = function (mapHandler) {
        mapHandler(this.root.match.bind(this.root));
    };
    Router.prototype.trigger = function (location) {
        if (this.started) {
            var parts = location.split('?', 2);
            var query = {};
            if (parts[1]) {
                iterateQueryString(parts[1], function (name, value) {
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
            this.find(this.root, parts[0], {
                root: parts[0],
                query: query
            });
        }
    };
    Router.prototype.find = function (binder, location, params) {
        var bindings = binder.filter(location);
        bindings.forEach(this.onBinding.bind(this, location, params));
    };
    Router.prototype.onBinding = function (location, params, binding) {
        var fragment = binding.getFragment(location);
        var subBinder = binding.getSubBinder();
        if (subBinder) {
            this.find(subBinder, fragment, params);
        }
        this.runHandler(location, params, binding);
    };
    Router.prototype.serialize = function (obj) {
        var str = [];
        for (var p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        return str.join("&");
    };
    Router.prototype.runHandler = function (location, params, binding) {
        var _this = this;
        var Handler = binding.getHandler();
        if (Handler) {
            var args = binding.extractParams(location);
            Handler.apply(this, args.concat({
                getQuery: function () {
                    return params.query;
                },
                getLocation: function (fragment, isQuery) {
                    var current = params.root.substring(0, params.root.length - location.length), newQuery;
                    fragment = fragment || '';
                    if (isQuery === true) {
                        newQuery = _this.serialize(params.query);
                    }
                    else if (isQuery === false) {
                        newQuery = '';
                    }
                    else {
                        newQuery = _this.serialize(isQuery);
                    }
                    return current + fragment + (newQuery.length === 0 ? '' : '?' + newQuery);
                }
            }));
        }
    };
    Router.prototype.start = function () {
        this.started = true;
    };
    Router.prototype.stop = function () {
        this.started = false;
    };

    return Router;
});
