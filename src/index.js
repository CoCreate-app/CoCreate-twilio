(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(["./client"], function(CoCreateTwilio) {
        	return factory(CoCreateTwilio)
        });
    } else if (typeof module === 'object' && module.exports) {
      const CoCreateTwilio = require("./server.js")
      module.exports = factory(CoCreateTwilio);
    } else {
        root.returnExports = factory(root["./client.js"]);
  }
}(typeof self !== 'undefined' ? self : this, function (CoCreateTwilio) {
  return CoCreateTwilio;
}));