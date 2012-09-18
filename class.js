(function () {

  /**
   * Class.js namespace
   * 
   * @namespace Class
   */
  var Class = {
    /**
     * Creates and returns a new JavaScript 'class' as constructor function.
     * 
     * @param {String|undefined} classPath Namespace plus class name: 'my.awesome.Hero'
     * @param {Object} definition Properties and methods that are added to the prototype
     *
     * @returns {Function} constructor The constructor of the created class
     */
    'create': function () {
      var args = arguments;
      var body = args[args.length - 1];
      var classPath = args.length > 1 ? args[0] : 'AnonymousClass';
      
      var SuperClass = body['Extend'] || null;
      delete body['Extend'];

      var NewClass = body['initialize'];
      delete body['initialize'];
      
      if(!NewClass) {
        if(SuperClass) {
          NewClass = function() { SuperClass.apply(this, arguments); };
        } else {
          NewClass = function() {};
        }
      }
      
      applyClassName(NewClass, classPath);

      applySuperClass(NewClass, SuperClass)
      delete body['Extend'];
      
      applyImplementations(NewClass, body['Implement']);
      delete body['Implement'];

      applyClassNameToPrototype(NewClass, classPath);

      Class.extend(NewClass, body, true);

      return NewClass;
    },
    
    /**
     * Extend the given class prototype with properties and methods
     * 
     * @param {Function} ExistingClass Constructor of existing class
     * @param {Object} extension Properties and methods that are added to the prototype
     * @param {Boolean|undefined} override Specify if the extension should override existing properties
     */
    'extend': function (ExistingClass, extension, override) {
      if (extension['STATIC']) {
        extend(ExistingClass, extension['STATIC'], override);
        delete extension['STATIC'];
      }
      extend(ExistingClass.prototype, extension, override);
    }
  };

  function applySuperClass(NewClass, SuperClass) {
    if (SuperClass) {
      var SuperClassProxy = function() {};
      SuperClassProxy.prototype = SuperClass.prototype;

      NewClass.prototype = new SuperClassProxy();
      NewClass.prototype.constructor = NewClass;

      NewClass['Super'] = SuperClass;

      Class.extend(NewClass, SuperClass, false);
    }
  };

  function applyImplementations(NewClass, implementations) {
    if (implementations) {
      if(typeof implementations === 'function') {
        implementations = [implementations];
      }
      for (var i = 0; i < implementations.length; i++) {
        extend(NewClass.prototype, implementations[i].prototype, false);
      }
    }
  };
  
  function applyClassName(NewClass, name) {
    NewClass['toString'] = function() { return name; };  
  };
  
  function applyClassNameToPrototype(NewClass, name) {
    NewClass.prototype['toString'] = function() { return name; };
  };
  
  function applyMethodName(method, name) {
    method['toString'] = function() { return name; };
  };

  function extend(object, extension, shouldOverride) {
    var propertyName, property;
    
    for (propertyName in extension) {
      if(shouldOverride || !shouldOverride && !(propertyName in object)) {
        
        property = object[propertyName] = extension[propertyName];
        
        if(typeof property === 'function') {
          var isObjectExtension = (extension.toString === Object.prototype.toString)
          var className = isObjectExtension ? object.constructor : extension.constructor;

          applyMethodName(property, className + "::" + propertyName);
        }
      }
    }
  };
  
  // Return as AMD module or attach to head object
  if (typeof define !== "undefined") {
    define([], function () { return Class; });
  }
  else if (typeof window !== "undefined") {
    window['Class'] = Class;
  }
  else {
    module['exports'] = Class;
  }

})();