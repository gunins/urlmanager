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
