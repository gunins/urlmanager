'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*globals define*/
(function (root, factory) {

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['./MatchBinder', './utils'], factory);
    } else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('./MatchBinder'), require('./utils'));
    }
})(undefined, function (MatchBinder, utils) {
    'use strict';

    var Router = function () {
        function Router(location) {
            _classCallCheck(this, Router);

            if (location !== undefined && location !== '') {
                this._location = location.replace(/^\/|\/$/g, '') + '/';
            }
            this.root = this.getBinder();
            this.bindings = [];
        }

        _createClass(Router, [{
            key: 'getBinder',
            value: function getBinder(location) {
                return new MatchBinder(location);
            }
        }, {
            key: 'test',
            value: function test(loc) {
                return new RegExp('^' + this._location, 'g').test(loc);
            }
        }, {
            key: 'getLocation',
            value: function getLocation(loc) {
                var location = loc.replace(/^\/|$/g, '');
                if (this._location !== undefined) {
                    if (this.test(location)) {
                        return location.replace(this._location, '');
                    } else {
                        return false;
                    }
                }
                return location;
            }
        }, {
            key: 'trigger',
            value: function trigger(location) {
                if (this.started) {
                    var parts = location.split('?', 2),
                        loc = this.getLocation(parts[0]);
                    if (loc) {
                        var query = utils.setQuery(parts[1]),
                            params = {
                            root: loc,
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
            }
        }, {
            key: 'match',


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

            value: function match(mapHandler) {
                mapHandler(this.root.match.bind(this.root));
            }
        }, {
            key: 'start',
            value: function start() {
                this.started = true;
            }
        }, {
            key: 'stop',
            value: function stop() {
                this.started = false;
            }
        }]);

        return Router;
    }();

    return Router;
});
//# sourceMappingURL=Router.js.map
