/*! urlmanager 2016-04-06 */
"use strict";function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}var _createClass=function(){function a(a,b){for(var c=0;c<b.length;c++){var d=b[c];d.enumerable=d.enumerable||!1,d.configurable=!0,"value"in d&&(d.writable=!0),Object.defineProperty(a,d.key,d)}}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}(),_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"==typeof Symbol&&a.constructor===Symbol?"symbol":typeof a};!function(a,b){"function"==typeof define&&define.amd?define("router/utils",[],b):"object"===("undefined"==typeof exports?"undefined":_typeof(exports))&&(module.exports=b())}(void 0,function(){function a(a){try{return decodeURIComponent(a.replace(/\+/g," "))}catch(b){return a}}function b(a,b){var c=a.split("&");c.forEach(function(a){var c=a.split("=");b(c.shift(),c.join("="))})}function c(c){var d={};return c&&b(c,function(b,c){c=a(c),d[b]?"string"==typeof d[b]?d[b]=[d[b],c]:d[b].push(c):d[b]=c}),d}function d(a){var b=[];for(var c in a)a.hasOwnProperty(c)&&b.push(encodeURIComponent(c)+"="+encodeURIComponent(a[c]));return b.join("&")}function e(a){return{getQuery:function(){return a.query},getLocation:function(){var b=arguments.length<=0||void 0===arguments[0]?"":arguments[0],c=arguments[1],e=a.root,f=void 0;return f=c===!0?d(a.query):c===!1?"":d(c),e+b+(0===f.length?"":"?"+f)}}}function f(a,b){if(!b)return!1;if(a.length!==b.length)return!1;for(var c=0,d=a.length;d>c;c++)if(a[c]instanceof Array&&b[c]instanceof Array){if(!f(a[c],b[c]))return!1}else if(a[c]!==b[c])return!1;return!0}return{serialize:d,getLocation:e,equals:f,setQuery:c}}),function(a,b){"function"==typeof define&&define.amd?define("router/MatchBinding",["./utils"],b):"object"===("undefined"==typeof exports?"undefined":_typeof(exports))&&(module.exports=b(require("./utils")))}(void 0,function(a){var b=function(){function b(a,c,d){_classCallCheck(this,b),d&&(this._binder=d),""===c?this.pattern=c=a.replace(/^\(\/\)/g,"").replace(/^\/|$/g,""):(this.pattern=a,c+=a),this.location=c.replace(/\((.*?)\)/g,"$1").replace(/^\/|$/g,"");var e=this.pattern.replace(b.ESCAPE_PARAM,"\\$&").replace(b.OPTIONAL_PARAM,"(?:$1)?").replace(b.NAMED_PARAM,function(a,b){return b?a:"([^/]+)"}).replace(b.SPLAT_PARAM,"(.*?)");this.patternRegExp=new RegExp("^"+e),this.routeHandler=[],this.leaveHandler=[],this.queryHandler=[],this.routes=[]}return _createClass(b,[{key:"onBind",value:function(){}},{key:"setOnBind",value:function(a){this.onBind=a}},{key:"rebind",value:function(){void 0!==this.onBind&&this.onBind()}},{key:"setRoutes",value:function(a){return this.routes.push(a),this}},{key:"getRoutes",value:function(){return this.routes}},{key:"match",value:function(a){var b=this.getSubBinder();return a(b.match.bind(b)),this}},{key:"to",value:function(a){return this.routeHandler.push(a),this}},{key:"leave",value:function(a){return this.leaveHandler.push(a),this}},{key:"query",value:function(a){return this.queryHandler.push(a),this}},{key:"remove",value:function(){return this.routes.splice(0,this.routes.length),this.routeHandler.splice(0,this.routeHandler.length),this.leaveHandler.splice(0,this.leaveHandler.length),this.queryHandler.splice(0,this.queryHandler.length),this}},{key:"test",value:function(a){return this.patternRegExp.test(a)}},{key:"getFragment",value:function(a){var b=this.applyParams(a);return a.replace(b,"")}},{key:"applyParams",value:function(a){var b=this.pattern.replace(/\((.*?)\)/g,"$1").split("/"),c=a.split("/");return c.splice(0,b.length).join("/")}},{key:"extractParams",value:function(a){var b=this.patternRegExp.exec(a);return b&&b.length>0?b.slice(1).map(function(a){return a?decodeURIComponent(a):null}):[]}},{key:"setSubBinder",value:function(a,b,c){var d=new a(b);return this.subBinder=d,c&&c(d.match.bind(d)),d}},{key:"getSubBinder",value:function(){return this.subBinder}},{key:"getHandler",value:function(){return this.routeHandler}},{key:"getLeaveHandler",value:function(){return this.leaveHandler}},{key:"getQueryHandler",value:function(){return this.queryHandler}},{key:"getHandlers",value:function(a){var b={to:"getHandler",leave:"getLeaveHandler",query:"getQueryHandler"};return this[b[a]]()}},{key:"checkSegment",value:function(b,c){var d=this.pattern.replace(/\((.*?)\)/g,"$1").replace(/^\//,"").split("/"),e=this.prevLoc.replace(/^\//,"").split("/"),f=b.slice(0,d.length),g=e.slice(0,d.length),h=a.equals(f,g);return h?b.length>1?this.getSubBinder().checkStatus(b.slice(d.length),c):this.getSubBinder().clearActive(c):this.clearActive(c),h}},{key:"clearActive",value:function(a,b){this.trigger("leave",a,b),this.getSubBinder().clearActive()}},{key:"trigger",value:function(b,c,d){var e=this;"to"===b&&(this.prevLoc=d);var f=this.extractParams(d),g=this.getHandlers(b);g&&g.length>0&&g.forEach(function(b){b.apply(e,f.concat(a.getLocation(c)))})}}]),b}();return Object.assign(b,{OPTIONAL_PARAM:/\((.*?)\)/g,NAMED_PARAM:/(\(\?)?:\w+/g,SPLAT_PARAM:/\*\w+/g,ESCAPE_PARAM:/[\-{}\[\]+?.,\\\^$|#\s]/g}),b}),function(a,b){"function"==typeof define&&define.amd?define("router/MatchBinder",["./MatchBinding"],b):"object"===("undefined"==typeof exports?"undefined":_typeof(exports))?module.exports=b(require("./MatchBinding")):(a.UrlManager=a.UrlManager||{},a.UrlManager.MatchBinder=b(a.UrlManager.MatchBinding))}(void 0,function(a){var b=function(){function b(a,c,d){_classCallCheck(this,b),this.bindings=[],this._activeBindings=[],this.location=a||"",this.command=d,this.params=c,this._active=!1}return _createClass(b,[{key:"match",value:function(a,b){return"function"==typeof a&&(b=a,a=!1),""===a&&(a=!1),this.getMatchBinding(a,b)}},{key:"getMatchBinding",value:function(c,d){var e=new a(c,this.location,this);return e.setSubBinder(b,this.location+(c||""),d),this.bindings.push(e),e}},{key:"filter",value:function(a){var b=this.bindings.filter(function(b){return b.test(a)});return b}},{key:"clearActive",value:function(a,b){this._activeBindings.length>0&&(this._activeBindings.forEach(function(c){return c.clearActive(a,b)}),this._activeBindings=[])}},{key:"checkStatus",value:function(a,b){this._activeBindings.length>0&&(this._activeBindings=this._activeBindings.filter(function(c){return c.checkSegment(a,b)}))}},{key:"trigger",value:function(a,b){var c=b.replace(/^\/|$/g,"").split("/");this.checkStatus(c,a),this.onBinding(b,a)}},{key:"onBinding",value:function(a,b){var c=this,d=this.filter(a);d.length>0&&d.forEach(function(d){c.runHandler(a,b,d);var e=d.getFragment(a);if(""!==e.trim()){var f=d.getSubBinder();f&&f.bindings&&f.bindings.length>0&&f.trigger(b,e)}})}},{key:"runHandler",value:function(a,b,c){-1===this._activeBindings.indexOf(c)&&(c.trigger("to",b,a),this._activeBindings.push(c)),c.trigger("query",b,a)}},{key:"run",value:function(){this.command(this)}}]),b}();return b}),function(a,b){"function"==typeof define&&define.amd?define("router/Router",["./MatchBinder","./utils"],b):"object"===("undefined"==typeof exports?"undefined":_typeof(exports))&&(module.exports=b(require("./MatchBinder"),require("./utils")))}(void 0,function(a,b){var c=function(){function c(a){_classCallCheck(this,c),void 0!==a&&""!==a&&(this._location=a.replace(/^\/|\/$/g,"")+"/"),this.root=this.getBinder(),this.bindings=[]}return _createClass(c,[{key:"getBinder",value:function(b){return new a(b)}},{key:"test",value:function(a){return new RegExp("^"+this._location,"g").test(a)}},{key:"getLocation",value:function(a){var b=a.replace(/^\/|$/g,"");return void 0!==this._location?this.test(b)?b.replace(this._location,""):!1:b}},{key:"trigger",value:function(a){if(this.started){var c=a.split("?",2),d=this.getLocation(c[0]);if(d){var e=b.setQuery(c[1]),f={root:d,query:e};this.root.trigger(f,d)}}}},{key:"match",value:function(a){a(this.root.match.bind(this.root))}},{key:"start",value:function(){this.started=!0}},{key:"stop",value:function(){this.started=!1}}]),c}();return c});