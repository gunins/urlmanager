/*! urlmanager 2016-04-13 */
"use strict";function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}var _createClass=function(){function a(a,b){for(var c=0;c<b.length;c++){var d=b[c];d.enumerable=d.enumerable||!1,d.configurable=!0,"value"in d&&(d.writable=!0),Object.defineProperty(a,d.key,d)}}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}(),_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"==typeof Symbol&&a.constructor===Symbol?"symbol":typeof a};!function(a,b){"function"==typeof define&&define.amd?define("router/utils",[],b):"object"===("undefined"==typeof exports?"undefined":_typeof(exports))&&(module.exports=b())}(void 0,function(){function a(a){try{return decodeURIComponent(a.replace(/\+/g," "))}catch(b){return a}}function b(a,b){var c=a.split("&");c.forEach(function(a){var c=a.split("=");b(c.shift(),c.join("="))})}function c(c){var d={};return c&&b(c,function(b,c){c=a(c),d[b]?"string"==typeof d[b]?d[b]=[d[b],c]:d[b].push(c):d[b]=c}),d}function d(a){var b=[];for(var c in a)a.hasOwnProperty(c)&&b.push(encodeURIComponent(c)+"="+encodeURIComponent(a[c]));return b.join("&")}function e(a,b){return{getQuery:function(){return a.query},getLocation:function(){var c=arguments.length<=0||void 0===arguments[0]?"":arguments[0],e=arguments[1],f=a.root.substring(0,a.root.length-b.length),g=void 0;return g=e===!0?d(a.query):e===!1?"":d(e),f+c+(0===g.length?"":"?"+g)}}}function f(a,b){if(!b)return!1;if(a.length!==b.length)return!1;for(var c=0,d=a.length;d>c;c++)if(a[c]instanceof Array&&b[c]instanceof Array){if(!f(a[c],b[c]))return!1}else if(a[c]!==b[c])return!1;return!0}function g(a){var b=a.toString().replace(h,""),c=b.slice(b.indexOf("(")+1,b.indexOf(")")),d=c.match(i);return null===d?[]:d.map(function(a){return a.replace(/[\s,]/g,"")})}var h=/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm,i=/(?:^|,)\s*([^\s,=]+)/g;return{serialize:d,getLocation:e,equals:f,setQuery:c,getArgs:g}}),function(a,b){"function"==typeof define&&define.amd?define("router/MatchBinding",["./utils"],b):"object"===("undefined"==typeof exports?"undefined":_typeof(exports))&&(module.exports=b(require("./utils")))}(void 0,function(a){var b=function(){function b(a,c,d){if(_classCallCheck(this,b),d&&(this.binder=d),""===c)this.pattern=a.replace(/^\(\/\)/g,"").replace(/^\/|$/g,"");else{var e=a.match(/^(\/|\(\/)/g);null===e&&(a="("===a[0]?"(/"+a.substring(1):"/"+a),this.pattern=a}var f=this.pattern.replace(b.ESCAPE_PARAM,"\\$&").replace(b.OPTIONAL_PARAM,"(?:$1)?").replace(b.NAMED_PARAM,function(a,b){return b?a:"([^/]+)"}).replace(b.SPLAT_PARAM,"(.*)");this.patternRegExp=new RegExp("^"+f),this.routeHandler=new Set,this.leaveHandler=new Set,this.queryHandler=new Set,this._active=!1}return _createClass(b,[{key:"setRoutes",value:function(a){var b=this.subBinder;return a({match:b.match.bind(b)}),this}},{key:"reTrigger",value:function(){this.binder.reTrigger()}},{key:"match",value:function(a){var b=this.subBinder;return a(b.match.bind(b)),this}},{key:"to",value:function(a){return this.routeHandler.add({handler:a,done:!1}),this.reTrigger(),this}},{key:"leave",value:function(b){var c=a.getArgs(b);return this.leaveHandler.add({handler:b,done:c.length>0&&"done"===c[0]}),this}},{key:"query",value:function(a){return this.queryHandler.add({handler:a,done:!1}),this}},{key:"remove",value:function(){return this.routeHandler.clear(),this.leaveHandler.clear(),this.queryHandler.clear(),this.subBinder.remove(),this}},{key:"test",value:function(a){return this.patternRegExp.test(a)}},{key:"getFragment",value:function(a){var b=a.match(this.patternRegExp);return null===b?"":a.substring(b[0].length)}},{key:"extractParams",value:function(a){var b=this.patternRegExp.exec(a);return b&&b.length>0?b.slice(1).map(function(a){return a?decodeURIComponent(a):null}):[]}},{key:"setSubBinder",value:function(a,b,c){var d=new a(b,this);return this.subBinder=d,"function"==typeof c&&c(d.match.bind(d)),d}},{key:"checkSegment",value:function(b,c){var d=[];if(this._active){var e=this.pattern.replace(/\((.*?)\)/g,"$1").replace(/^\//,"").split("/"),f=this.prevLoc.replace(/^\//,"").split("/"),g=b.slice(0,e.length),h=f.slice(0,e.length),i=a.equals(g,h);i?b.length>1?d=this.subBinder.checkStatus(b.slice(e.length),c):i&&(d=this.subBinder.clearActive(c)):d=this.clearActive(c)}return d}},{key:"clearActive",value:function(a){var b=[];return this._active&&b.push({handler:this.triggerLeave(a),disable:this.disable.bind(this)}),b.concat(this.subBinder.clearActive())}},{key:"disable",value:function(){this._active=!1}},{key:"triggerTo",value:function(b,c){if(this.test(b)){if(!this._active){this.prevLoc=b;var d=this.extractParams(b).concat(a.getLocation(c,b));this.applyHandlers(this.routeHandler,d),this._active=!0}this.applyHandlers(this.queryHandler,[a.getLocation(c,b)]);var e=this.getFragment(b);if(""!==e.trim()){var f=this.subBinder;f&&f.triggerRoutes(e,c)}}}},{key:"applyHandlers",value:function(a){var b=this,c=arguments.length<=1||void 0===arguments[1]?[]:arguments[1];a&&a.size>0&&a.forEach(function(a){a.handler.apply(b,c)})}},{key:"triggerLeave",value:function(b){var c=this;return function(d){var e=c.leaveHandler,f=a.getLocation(b,c.prevLoc),g=0,h=!1;e&&e.size>0&&e.forEach(function(a){a.done&&g++,a.handler(function(){var a=arguments.length<=0||void 0===arguments[0]?!0:arguments[0];a?(g--,0!==g||h||d(!0)):a||h||(h=!0,d(!1))},f)}),0===g&&d(!0)}}}]),b}();return Object.assign(b,{OPTIONAL_PARAM:/\((.*?)\)/g,NAMED_PARAM:/(\(\?)?:\w+/g,SPLAT_PARAM:/\*\w+/g,ESCAPE_PARAM:/[\-{}\[\]+?.,\\\^$|#\s]/g}),b}),function(a,b){"function"==typeof define&&define.amd?define("router/MatchBinder",["./MatchBinding"],b):"object"===("undefined"==typeof exports?"undefined":_typeof(exports))?module.exports=b(require("./MatchBinding")):(a.UrlManager=a.UrlManager||{},a.UrlManager.MatchBinder=b(a.UrlManager.MatchBinding))}(void 0,function(a){var b=function(){function b(a,c){_classCallCheck(this,b),this._parent=c,this.bindings=new Set,this.location=a||"",this._active=!1}return _createClass(b,[{key:"reTrigger",value:function(){this._parent.reTrigger()}},{key:"match",value:function(a,b){return"function"==typeof a&&(b=a,a=!1),""===a&&(a=!1),this.getMatchBinding(a,b)}},{key:"getMatchBinding",value:function(c,d){if(c){var e=new a(c,this.location,this);return e.setSubBinder(b,this.location+(c||""),d),this.bindings.add(e),e}return"function"==typeof d&&d(this.match.bind(this)),{match:this.match.bind(this)}}},{key:"clearActive",value:function(a,b){var c=[];return this.bindings.size>0&&this.bindings.forEach(function(d){c=c.concat(d.clearActive(a,b))}),c}},{key:"checkStatus",value:function(a,b){var c=[];return this.bindings.size>0&&this.bindings.forEach(function(d){c=c.concat(d.checkSegment(a,b))}),c}},{key:"remove",value:function(){this.bindings.size>0&&this.bindings.forEach(function(a){return a.remove()})}},{key:"triggerRoutes",value:function(a,b){this.bindings.size>0&&this.bindings.forEach(function(c){return c.triggerTo(a,b)})}}]),b}();return b}),function(a,b){"function"==typeof define&&define.amd?define("router/Router",["./MatchBinder","./utils"],b):"object"===("undefined"==typeof exports?"undefined":_typeof(exports))&&(module.exports=b(require("./MatchBinder"),require("./utils")))}(void 0,function(a,b){var c=function(){function c(a){_classCallCheck(this,c),void 0!==a&&""!==a&&(this._location=a.replace(/^\/|\/$/g,"")+"/"),this.root=this.getBinder(),this._listeners=new Set}return _createClass(c,[{key:"getBinder",value:function(){return new a("",this)}},{key:"test",value:function(a){return new RegExp("^"+this._location,"g").test(a)}},{key:"getLocation",value:function(a){var b=a.replace(/^\/|$/g,"");return void 0!==this._location?this.test(b)?b.replace(this._location,""):!1:b}},{key:"reTrigger",value:function(){this.currLocation&&this.trigger(this.currLocation)}},{key:"trigger",value:function(a){if(this.started&&a){this.started=!1,this.currLocation=a;var c=a.split("?",2),d=this.getLocation(c[0]);if(d||""===d){var e=b.setQuery(c[1]),f={root:d,query:e};this.execute(d,f)}}}},{key:"execute",value:function(a,b){var c=this,d=a.replace(/^\/|$/g,"").split("/"),e=this.root,f=e.checkStatus(d,b),g=function(a){var b=a?c.currLocation:c.prevLocation;c.setLocation(b),c.prevLocation=b,c.started=!0};f.length>0?f.forEach(function(c){c.handler(function(d){c.triggered||(c.triggered=!0,c.applied=d,f.filter(function(a){return a.applied}).length===f.length?(f.forEach(function(a){return a.disable()}),e.triggerRoutes(a,b),g(!0)):f.filter(function(a){return a.triggered}).length===f.length&&g(!1))})}):(e.triggerRoutes(a,b),g&&g(!0))}},{key:"setListener",value:function(a){var b=this._listeners;return b.add(a),{remove:function(){b["delete"](a)}}}},{key:"setLocation",value:function(a){this._listeners.forEach(function(b){return b(a)})}},{key:"match",value:function(a){a(this.root.match.bind(this.root))}},{key:"start",value:function(){this.started=!0}},{key:"stop",value:function(){this.started=!1}}]),c}();return c});