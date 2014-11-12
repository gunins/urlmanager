!function(t,e){"function"==typeof define&&define.amd?define("router/MatchBinding",e):"object"==typeof exports?module.exports=e():(t.UrlManager=t.UrlManager||{},t.UrlManager.MatchBinding=e())}(this,function(){function t(e,n){""===n?this.pattern=n=e.replace(/^\(\/\)/g,"").replace(/^\/|$/g,""):(this.pattern=e,n+=e),this.location=n.replace(/\((.*?)\)/g,"$1").replace(/^\/|$/g,"");var r=this.pattern.replace(t.ESCAPE_PARAM,"\\$&").replace(t.OPTIONAL_PARAM,"(?:$1)?").replace(t.NAMED_PARAM,function(t,e){return e?t:"([^/]+)"}).replace(t.SPLAT_PARAM,"(.*?)");this.patternRegExp=new RegExp("^"+r),this.routeHandler=[],this.leaveHandler=[],this.queryHandler=[],this.routes=[]}return t.prototype.setRoutes=function(t){return this.routes.push(t),this},t.prototype.getRoutes=function(){return this.routes},t.prototype.to=function(t){return this.routeHandler.push(t),this},t.prototype.leave=function(t){return this.leaveHandler.push(t),this},t.prototype.query=function(t){return this.queryHandler.push(t),this},t.prototype.test=function(t){return this.patternRegExp.test(t)},t.prototype.getFragment=function(t){var e=this.applyParams(t);return t.replace(e,"")},t.prototype.applyParams=function(t){var e=this.pattern.replace(/\((.*?)\)/g,"$1").split("/"),n=t.split("/");return n.splice(0,e.length).join("/")},t.prototype.extractParams=function(t){var e=this.patternRegExp.exec(t).slice(1);return e.map(function(t){return t?decodeURIComponent(t):null})},t.prototype.setSubBinder=function(t){return this.subBinder=t,t},t.prototype.getSubBinder=function(){return this.subBinder},t.prototype.getHandler=function(){return this.routeHandler},t.prototype.getLeaveHandler=function(){return this.leaveHandler},t.prototype.getQueryHandler=function(){return this.queryHandler},t.OPTIONAL_PARAM=/\((.*?)\)/g,t.NAMED_PARAM=/(\(\?)?:\w+/g,t.SPLAT_PARAM=/\*\w+/g,t.ESCAPE_PARAM=/[\-{}\[\]+?.,\\\^$|#\s]/g,t}),function(t,e){"function"==typeof define&&define.amd?define("router/MatchBinder",["./MatchBinding"],e):"object"==typeof exports?module.exports=e(require("./MatchBinding")):(t.UrlManager=t.UrlManager||{},t.UrlManager.MatchBinder=e(t.UrlManager.MatchBinding))}(this,function(t){function e(t,e,n,r){this.bindings=[],this.location=r||t||"",this.command=n,this.params=e}return e.prototype.match=function(t,e){var n=this.getMatchBinding(t,this.location);if(this.bindings.push(n),e){var r=this.getSubBinder(this.location+t);n.setSubBinder(r),e(r.match.bind(r))}return n},e.prototype.getSubBinder=function(t){return new e(t)},e.prototype.getMatchBinding=function(e,n){return new t(e,n)},e.prototype.filter=function(t){return this.bindings.filter(function(e){return e.test(t)})},e.prototype.run=function(){this.command(this)},e}),function(t,e){"function"==typeof define&&define.amd?define("router/Router",["./MatchBinder"],e):"object"==typeof exports?module.exports=e(require("./MatchBinder")):(t.UrlManager=t.UrlManager||{},t.UrlManager.Router=e(t.UrlManager.MatchBinder))}(this,function(t){function e(t){return 0===Object.keys(t).length}function n(t){try{return decodeURIComponent(t.replace(/\+/g," "))}catch(e){return t}}function r(t,e){var n=t.split("&");n.forEach(function(t){var n=t.split("=");e(n.shift(),n.join("="))})}function i(t,e,n,r){var i,o=n.root.substring(0,n.root.length-r.length);return t=t||"",i=e===!0?this.serialize(n.query):e===!1?"":this.serialize(e),o+t+(0===i.length?"":"?"+i)}function o(){this.root=this.getBinder(),this.bindings=[]}return Array.prototype.equals=function(t){if(!t)return!1;if(this.length!=t.length)return!1;for(var e=0,n=this.length;n>e;e++)if(this[e]instanceof Array&&t[e]instanceof Array){if(!this[e].equals(t[e]))return!1}else if(this[e]!=t[e])return!1;return!0},o.prototype.getBinder=function(){return new t},o.prototype.match=function(t){t(this.root.match.bind(this.root))},o.prototype.trigger=function(t){if(this.started){var e=t.split("?",2),i={};e[1]&&r(e[1],function(t,e){e=n(e),i[t]?"string"==typeof i[t]?i[t]=[i[t],e]:i[t].push(e):i[t]=e});var o=e[0].replace(/^\/|$/g,""),a={root:o,query:i},s=[],p=!1;this.bindings.forEach(function(e){var n,r=e.pattern.replace(/\((.*?)\)/g,"$1").replace(/^\//,"").split("/"),i=e.location.split("/"),u=e.prevLoc.replace(/^\//,"").split("/"),c=function(t){var e=t.splice(i.length-r.length,r.length),n=u.splice(0,r.length);return!e.equals(n)};if(n=c(p||o.split("/"))){p=o.split("/").splice(0,i.length-r.length);var h=e.getLeaveHandler(),l=[];this.applyHandler(h,l,a,t),s.push(e)}}.bind(this)),s.forEach(function(t){this.bindings.splice(this.bindings.indexOf(t),1)}.bind(this)),this.find(this.root,o,a)}},o.prototype.find=function(t,e,n){var r=t.filter(e);r.forEach(this.onBinding.bind(this,e,n))},o.prototype.execute=function(t){this.find(t,t.params.root.replace(t.location,""),t.params)},o.prototype.onBinding=function(e,n,r){this.runHandler(e,n,r);var i=r.getFragment(e),o=r.getSubBinder();o&&o.bindings&&o.bindings.length>0&&this.find(o,i,n);var a=r.getRoutes();if(a&&a.length>0)for(;a.length>0;){var s=a[0],p=new t(r.getFragment(e),n,this.execute.bind(this),r.location);s(p),o.bindings=o.bindings.concat(p.bindings),a.pop()}},o.prototype.serialize=function(t){var e=[];for(var n in t)t.hasOwnProperty(n)&&e.push(encodeURIComponent(n)+"="+encodeURIComponent(t[n]));return e.join("&")},o.prototype.runHandler=function(t,n,r){if(-1===this.bindings.indexOf(r)){var i=r.getHandler(),o=r.extractParams(t);r.prevLoc=t,this.applyHandler(i,o,n,t),this.bindings.push(r)}if(!e(n.query)){var i=r.getQueryHandler(),o=[];this.applyHandler(i,o,n,t)}},o.prototype.applyHandler=function(t,e,n,r){t&&t.length>0&&t.forEach(function(t){t.apply(this,e.concat({getQuery:function(){return n.query},getLocation:function(t,e){return i.call(this,t,e,n,r)}.bind(this)}))}.bind(this))},o.prototype.start=function(){this.started=!0},o.prototype.stop=function(){this.started=!1},o});