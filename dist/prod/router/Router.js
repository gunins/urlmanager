!function(t,n){"function"==typeof define&&define.amd?define("router/MatchBinding",n):"object"==typeof exports?module.exports=n():(t.UrlManager=t.UrlManager||{},t.UrlManager.MatchBinding=n())}(this,function(){function t(n,e){""===e?this.pattern=e=n.replace(/^\(\/\)/g,"").replace(/^\/|$/g,""):(this.pattern=n,e+=n),this.location=e.replace(/\((.*?)\)/g,"$1").replace(/^\/|$/g,"");var r=this.pattern.replace(t.ESCAPE_PARAM,"\\$&").replace(t.OPTIONAL_PARAM,"(?:$1)?").replace(t.NAMED_PARAM,function(t,n){return n?t:"([^/]+)"}).replace(t.SPLAT_PARAM,"(.*?)");this.patternRegExp=new RegExp("^"+r),this.routeHandler=[],this.leaveHandler=[],this.queryHandler=[],this.routes=[]}return t.prototype.setRoutes=function(t){return this.routes.push(t),this},t.prototype.getRoutes=function(){return this.routes},t.prototype.to=function(t){return this.routeHandler.push(t),this},t.prototype.leave=function(t){return this.leaveHandler.push(t),this},t.prototype.query=function(t){return this.queryHandler.push(t),this},t.prototype.test=function(t){return this.patternRegExp.test(t)},t.prototype.getFragment=function(t){var n=this.applyParams(t);return t.replace(n,"")},t.prototype.applyParams=function(t){var n=this.pattern.replace(/\((.*?)\)/g,"$1").split("/"),e=t.split("/");return e.splice(0,n.length).join("/")},t.prototype.extractParams=function(t){var n=this.patternRegExp.exec(t).slice(1);return n.map(function(t){return t?decodeURIComponent(t):null})},t.prototype.setSubBinder=function(t){return this.subBinder=t,t},t.prototype.getSubBinder=function(){return this.subBinder},t.prototype.getHandler=function(){return this.routeHandler},t.prototype.getLeaveHandler=function(){return this.leaveHandler},t.prototype.getQueryHandler=function(){return this.queryHandler},t.OPTIONAL_PARAM=/\((.*?)\)/g,t.NAMED_PARAM=/(\(\?)?:\w+/g,t.SPLAT_PARAM=/\*\w+/g,t.ESCAPE_PARAM=/[\-{}\[\]+?.,\\\^$|#\s]/g,t}),function(t,n){"function"==typeof define&&define.amd?define("router/MatchBinder",["./MatchBinding"],n):"object"==typeof exports?module.exports=n(require("./MatchBinding")):(t.UrlManager=t.UrlManager||{},t.UrlManager.MatchBinder=n(t.UrlManager.MatchBinding))}(this,function(t){function n(t,n,e,r){this.bindings=[],this.location=r||t||"",this.command=e,this.params=n}return n.prototype.match=function(t,n){var e=this.getMatchBinding(t,this.location);if(this.bindings.push(e),n){var r=this.getSubBinder(this.location+t);e.setSubBinder(r),n(r.match.bind(r))}return e},n.prototype.getSubBinder=function(t){return new n(t)},n.prototype.getMatchBinding=function(n,e){return new t(n,e)},n.prototype.filter=function(t){return this.bindings.filter(function(n){return n.test(t)})},n.prototype.run=function(){this.command(this)},n}),function(t,n){"function"==typeof define&&define.amd?define("router/Router",["./MatchBinder"],n):"object"==typeof exports?module.exports=n(require("./MatchBinder")):(t.UrlManager=t.UrlManager||{},t.UrlManager.Router=n(t.UrlManager.MatchBinder))}(this,function(t){function n(t){return 0===Object.keys(t).length}function e(t){try{return decodeURIComponent(t.replace(/\+/g," "))}catch(n){return t}}function r(t,n){var e=t.split("&");e.forEach(function(t){var e=t.split("=");n(e.shift(),e.join("="))})}function i(t,n,e,r){var i,o=e.root.substring(0,e.root.length-r.length);return t=t||"",i=n===!0?this.serialize(e.query):n===!1?"":this.serialize(n),o+t+(0===i.length?"":"?"+i)}function o(){this.root=this.getBinder(),this.bindings=[]}return Array.prototype.equals=function(t){if(!t)return!1;if(this.length!=t.length)return!1;for(var n=0,e=this.length;e>n;n++)if(this[n]instanceof Array&&t[n]instanceof Array){if(!this[n].equals(t[n]))return!1}else if(this[n]!=t[n])return!1;return!0},o.prototype.getBinder=function(){return new t},o.prototype.match=function(t){t(this.root.match.bind(this.root))},o.prototype.trigger=function(t){if(this.started){var n=t.split("?",2),i={};n[1]&&r(n[1],function(t,n){n=e(n),i[t]?"string"==typeof i[t]?i[t]=[i[t],n]:i[t].push(n):i[t]=n});var o=n[0].replace(/^\/|$/g,""),a={root:o,query:i},s=[],u=!1;this.bindings.forEach(function(n){var e,r=n.pattern.replace(/\((.*?)\)/g,"$1").replace(/^\//,"").split("/"),i=n.location.split("/"),p=n.prevLoc.replace(/^\//,"").split("/"),c=function(t){var n=t.splice(i.length-r.length,r.length),e=p.splice(0,r.length);return!n.equals(e)};if(e=c(u||o.split("/"))){u=o.split("/").splice(0,i.length-r.length);var h=n.getLeaveHandler(),l=[];this.applyHandler(h,l,a,t),s.push(n)}}.bind(this)),s.forEach(function(t){this.bindings.splice(this.bindings.indexOf(t),1)}.bind(this)),this.find(this.root,o,a)}},o.prototype.find=function(t,n,e){var r=t.filter(n);r.forEach(this.onBinding.bind(this,n,e))},o.prototype.execute=function(t){var n=t.filter(t.location);n.forEach(this.runHandler.bind(this,t.location,t.params))},o.prototype.onBinding=function(n,e,r){this.runHandler(n,e,r);var i=r.getFragment(n),o=r.getSubBinder();o&&o.bindings&&o.bindings.length>0&&this.find(o,i,e);var a=r.getRoutes();a&&a.length>0&&(a.forEach(function(i){var a=new t(r.getFragment(n),e,this.execute.bind(this),r.location);i(a),o.bindings=o.bindings.concat(a.bindings)}.bind(this)),r.routes=[])},o.prototype.serialize=function(t){var n=[];for(var e in t)t.hasOwnProperty(e)&&n.push(encodeURIComponent(e)+"="+encodeURIComponent(t[e]));return n.join("&")},o.prototype.runHandler=function(t,e,r){if(-1===this.bindings.indexOf(r)){var i=r.getHandler(),o=r.extractParams(t);r.prevLoc=t,this.applyHandler(i,o,e,t),this.bindings.push(r)}if(!n(e.query)){var i=r.getQueryHandler(),o=[];this.applyHandler(i,o,e,t)}},o.prototype.applyHandler=function(t,n,e,r){t&&t.length>0&&t.forEach(function(t){t.apply(this,n.concat({getQuery:function(){return e.query},getLocation:function(t,n){return i.call(this,t,n,e,r)}.bind(this)}))}.bind(this))},o.prototype.start=function(){this.started=!0},o.prototype.stop=function(){this.started=!1},o});