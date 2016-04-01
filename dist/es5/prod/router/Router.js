/*! urlmanager 2016-04-01 */
"use strict";function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}var _createClass=function(){function a(a,b){for(var c=0;c<b.length;c++){var d=b[c];d.enumerable=d.enumerable||!1,d.configurable=!0,"value"in d&&(d.writable=!0),Object.defineProperty(a,d.key,d)}}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}(),_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"==typeof Symbol&&a.constructor===Symbol?"symbol":typeof a};!function(a,b){"function"==typeof define&&define.amd?define("router/MatchBinding",b):"object"===("undefined"==typeof exports?"undefined":_typeof(exports))?module.exports=b():(a.UrlManager=a.UrlManager||{},a.UrlManager.MatchBinding=b())}(void 0,function(){var a=function(){function a(b,c){_classCallCheck(this,a),""===c?this.pattern=c=b.replace(/^\(\/\)/g,"").replace(/^\/|$/g,""):(this.pattern=b,c+=b),this.location=c.replace(/\((.*?)\)/g,"$1").replace(/^\/|$/g,""),console.log(this.location,this.pattern);var d=this.pattern.replace(a.ESCAPE_PARAM,"\\$&").replace(a.OPTIONAL_PARAM,"(?:$1)?").replace(a.NAMED_PARAM,function(a,b){return b?a:"([^/]+)"}).replace(a.SPLAT_PARAM,"(.*?)");this.patternRegExp=new RegExp("^"+d),this.routeHandler=[],this.leaveHandler=[],this.queryHandler=[],this.routes=[]}return _createClass(a,[{key:"onBind",value:function(){}},{key:"setOnBind",value:function(a){this.onBind=a}},{key:"rebind",value:function(){void 0!==this.onBind&&this.onBind()}},{key:"setRoutes",value:function(a){return this.routes.push(a),this}},{key:"getRoutes",value:function(){return this.routes}},{key:"to",value:function(a){return this.routeHandler.push(a),this}},{key:"leave",value:function(a){return this.leaveHandler.push(a),this}},{key:"query",value:function(a){return this.queryHandler.push(a),this}},{key:"remove",value:function(){return this.routes.splice(0,this.routes.length),this.routeHandler.splice(0,this.routeHandler.length),this.leaveHandler.splice(0,this.leaveHandler.length),this.queryHandler.splice(0,this.queryHandler.length),this}},{key:"test",value:function(a){return this.patternRegExp.test(a)}},{key:"getFragment",value:function(a){var b=this.applyParams(a);return a.replace(b,"")}},{key:"applyParams",value:function(a){var b=this.pattern.replace(/\((.*?)\)/g,"$1").split("/"),c=a.split("/");return c.splice(0,b.length).join("/")}},{key:"extractParams",value:function(a){var b=this.patternRegExp.exec(a).slice(1);return b.map(function(a){return a?decodeURIComponent(a):null})}},{key:"setSubBinder",value:function(a){return this.subBinder=a,a}},{key:"getSubBinder",value:function(){return this.subBinder}},{key:"getHandler",value:function(){return this.routeHandler}},{key:"getLeaveHandler",value:function(){return this.leaveHandler}},{key:"getQueryHandler",value:function(){return this.queryHandler}}]),a}();return Object.assign(a,{OPTIONAL_PARAM:/\((.*?)\)/g,NAMED_PARAM:/(\(\?)?:\w+/g,SPLAT_PARAM:/\*\w+/g,ESCAPE_PARAM:/[\-{}\[\]+?.,\\\^$|#\s]/g}),a}),function(a,b){"function"==typeof define&&define.amd?define("router/MatchBinder",["./MatchBinding"],b):"object"===("undefined"==typeof exports?"undefined":_typeof(exports))?module.exports=b(require("./MatchBinding")):(a.UrlManager=a.UrlManager||{},a.UrlManager.MatchBinder=b(a.UrlManager.MatchBinding))}(void 0,function(a){var b=function(){function b(a,c,d,e){_classCallCheck(this,b),this.bindings=[],this.location=e||a||"",this.command=d,this.params=c}return _createClass(b,[{key:"match",value:function(a,b){"function"==typeof a&&(b=a,a=!1),""===a&&(a=!1);var c=this.getMatchBinding(a,this.location);this.bindings.push(c);var d=this.getSubBinder(this.location+(a||""));return c.setSubBinder(d),b&&b(d.match.bind(d)),c}},{key:"getSubBinder",value:function(a){return new b(a)}},{key:"getMatchBinding",value:function(b,c){return new a(b,c)}},{key:"filter",value:function(a){return this.bindings.filter(function(b){return b.test(a)})}},{key:"run",value:function(){this.command(this)}}]),b}();return b}),function(a,b){"function"==typeof define&&define.amd?define("router/Router",["./MatchBinder"],b):"object"===("undefined"==typeof exports?"undefined":_typeof(exports))?module.exports=b(require("./MatchBinder")):(a.UrlManager=a.UrlManager||{},a.UrlManager.Router=b(a.UrlManager.MatchBinder))}(void 0,function(a){function b(a){try{return decodeURIComponent(a.replace(/\+/g," "))}catch(b){return a}}function c(a,b){var c=a.split("&");c.forEach(function(a){var c=a.split("=");b(c.shift(),c.join("="))})}function d(a,b,c,d){var e=c.root.substring(0,c.root.length-d.length),f=void 0;return a=a||"",f=b===!0?this.serialize(c.query):b===!1?"":this.serialize(b),e+a+(0===f.length?"":"?"+f)}Array.prototype.equals=function(a){if(!a)return!1;if(this.length!==a.length)return!1;for(var b=0,c=this.length;c>b;b++)if(this[b]instanceof Array&&a[b]instanceof Array){if(!this[b].equals(a[b]))return!1}else if(this[b]!==a[b])return!1;return!0};var e=function(){function e(a){_classCallCheck(this,e),this.root=this.getBinder(a),this.bindings=[]}return _createClass(e,[{key:"getBinder",value:function(b){return new a(b)}},{key:"trigger",value:function(a){var d=this;this.started&&!function(){var e=a.split("?",2),f={};e[1]&&c(e[1],function(a,c){c=b(c),f[a]?"string"==typeof f[a]?f[a]=[f[a],c]:f[a].push(c):f[a]=c});var g=e[0].replace(/^\/|$/g,""),h={root:g,query:f},i=!1;d.bindings=d.bindings.filter(function(b){var c=void 0,e=b.pattern.replace(/\((.*?)\)/g,"$1").replace(/^\//,"").split("/"),f=b.location.split("/"),j=b.prevLoc.replace(/^\//,"").split("/"),k=!0,l=function(a){var b=a.splice(f.length-e.length,e.length),c=j.splice(0,e.length);return!b.equals(c)};if(c=l(i||g.split("/"))){i=g.split("/").splice(0,f.length-e.length);var m=b.getLeaveHandler();b.setOnBind(),d.applyHandler(m,[],h,a),k=!1}return k}),d.find(d.root,g,h)}()}},{key:"find",value:function(a,b,c){var d=this,e=a.filter(b);e.forEach(function(a){return d.onBinding(b,c,a)})}},{key:"execute",value:function(a){var b=a.location.split("/"),c=a.params.root.split("/"),d="/"+c.splice(b.length,c.length-b.length).join("/");this.find(a,d,a.params)}},{key:"onBinding",value:function(b,c,d){d.setOnBind(this.onBinding.bind(this,b,c,d)),this.runHandler(b,c,d);var e=d.getFragment(b),f=d.getSubBinder();f&&f.bindings&&f.bindings.length>0&&this.find(f,e,c);var g=d.getRoutes();if(g&&g.length>0)for(;g.length>0;){var h=g[0],i=new a(d.getFragment(b),c,this.execute.bind(this),d.location);h(i),f.bindings=f.bindings.concat(i.bindings),g.shift()}}},{key:"serialize",value:function(a){var b=[];for(var c in a)a.hasOwnProperty(c)&&b.push(encodeURIComponent(c)+"="+encodeURIComponent(a[c]));return b.join("&")}},{key:"runHandler",value:function(a,b,c){if(-1===this.bindings.indexOf(c)){var d=c.getHandler(),e=c.extractParams(a);c.prevLoc=a,this.applyHandler(d,e,b,a),this.bindings.push(c)}var f=c.getQueryHandler();f&&this.applyHandler(f,[],b,a)}},{key:"applyHandler",value:function(a,b,c,e){var f=this;a&&a.length>0&&a.forEach(function(a){a.apply(f,b.concat({getQuery:function(){return c.query},getLocation:function(a,b){return d.call(this,a,b,c,e)}}))})}},{key:"match",value:function(a){a(this.root.match.bind(this.root))}},{key:"start",value:function(){this.started=!0}},{key:"stop",value:function(){this.started=!1}}]),e}();return e});