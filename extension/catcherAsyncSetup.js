/* eslint-disable */
// prettier-ignore
// Note this has to be a separate file since it shouldn't get automatically formatted
this.catcherAsyncSetup = function() {
  ;(function(a,b,g,e,h){var k=a.SENTRY_SDK,f=function(a){f.data.push(a)};f.data=[];var l=a[e];a[e]=function(c,b,e,d,h){f({e:[].slice.call(arguments)});l&&l.apply(a,arguments)};var m=a[h];a[h]=function(c){f({p:c.reason});m&&m.apply(a,arguments)};var n=b.getElementsByTagName(g)[0];b=b.createElement(g);b.src=k.url;b.crossorigin="anonymous";b.addEventListener("load",function(){try{a[e]=l;a[h]=m;var c=f.data,b=a.Sentry;b.init(k);var g=a[e];if(c.length)for(var d=0;d<c.length;d++)c[d].e?g.apply(b.TraceKit,c[d].e):c[d].p&&b.captureException(c[d].p)}catch(p){console.log(p)}});n.parentNode.insertBefore(b,n)})(window,document,"script","onerror","onunhandledrejection");
};
