(function () {

  var Class = {
    'create': function (body) {

      var SuperClass = body['Extend'] || null;
      delete body['Extend'];

      var defaultConstructor = function() { 
        if(SuperClass) SuperClass.apply(this, arguments);
      };
      
      var NewClass = body['initialize'] || defaultConstructor;
      delete body['initialize'];

      if (SuperClass) {
        var SuperClassProxy = function() {};
        SuperClassProxy.prototype = SuperClass.prototype;

        NewClass.prototype = new SuperClassProxy();
        NewClass.prototype.constructor = NewClass;

        NewClass['Super'] = SuperClass;

        this.extend(NewClass, SuperClass, false);
      }

      this.extend(NewClass, body);

      return NewClass;
    },
    
    'extend': function (Class, extension, override) {
      var STATIC = 'STATIC';
      
      if (extension[STATIC]) {
        extend(Class, extension[STATIC], override);
        delete extension[STATIC];
      }
      extend(Class.prototype, extension, override);
    }
  }

  function extend(object, extension, override) {
    var property;
    
    if (override === false) {
      for (property in extension)
        if (!(property in object))
          object[property] = extension[property];
    } else {
      for (property in extension)
        object[property] = extension[property];
      if (extension.toString !== Object.prototype.toString)
        object.toString = extension.toString;
    }
  };
  
  // Return as AMD module or attach to head object
  if (typeof define !== "undefined")
    define([], function () {
      return Class;
    });
  else if (typeof window !== "undefined")
    window['Class'] = Class;
  else
    module['exports'] = Class;

})();