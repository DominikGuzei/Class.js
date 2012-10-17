(function (globalNamespace) {
  "use strict";

  /**
   * Class.js namespace
   *
   * @namespace Class
   */
  var Class;

  function inheritFromClass(NewClass, SuperClass) {
    if (SuperClass) {
      /** @constructor */
      var SuperClassProxy = function () {};
      SuperClassProxy.prototype = SuperClass.prototype;

      NewClass.prototype = new SuperClassProxy();
      NewClass.prototype.constructor = NewClass;

      /** @expose */
      NewClass.Super = SuperClass;

      Class.extend(NewClass, SuperClass, false);
    }
  }

  function applyMethodName(method, name) {
    method.toString = function () { return name; };
  }

  function augmentProperties(target, extension, shouldOverride) {
    var propertyName, property, targetHasProperty,
      propertyWouldNotBeOverriden, extensionIsPlainObject, className;

    for (propertyName in extension) {
      if (extension.hasOwnProperty(propertyName)) {
        targetHasProperty = target.hasOwnProperty(propertyName);
        propertyWouldNotBeOverriden = !shouldOverride && !targetHasProperty;

        if (shouldOverride || propertyWouldNotBeOverriden) {

          property = target[propertyName] = extension[propertyName];

          if (typeof property === 'function') {
            extensionIsPlainObject = (extension.toString === Object.prototype.toString);
            className = extensionIsPlainObject ? target.constructor : extension.constructor;

            applyMethodName(property, className + "::" + propertyName);
          }
        }
      }
    }
  }

  function augmentImplementations(NewClass, implementations) {
    if (implementations) {
      var index;
      if (typeof implementations === 'function') {
        implementations = [implementations];
      }
      for (index = 0; index < implementations.length; index += 1) {
        augmentProperties(NewClass.prototype, implementations[index].prototype, false);
      }
    }
  }

  function applyConstructorName(NewClass, name) {
    NewClass.toString = function () { return name; };
  }

  function applyClassNameToPrototype(NewClass, name) {
    NewClass.prototype.toString = function () { return name; };
  }
  
  function exposeClassOnNamespace(classPath, NewClass) {
    if(globalNamespace) {
      var classPathArray, className, currentNamespace, currentPathItem, index;
    
      classPathArray = classPath.split('.');
      className = classPathArray[classPathArray.length - 1];
    
      currentNamespace = globalNamespace;
    
      for(index = 0; index < classPathArray.length - 1; index += 1) {
        currentPathItem = classPathArray[index];
        
        if(typeof currentNamespace[currentPathItem] === "undefined") {
          currentNamespace[currentPathItem] = {};
        }
        
        currentNamespace = currentNamespace[currentPathItem];
      }
      
      currentNamespace[className] = NewClass;
    }
  }

  Class = {

    /**
     * Creates and returns a new JavaScript 'class' as constructor function.
     *
     * @param {String} classPath Namespaces and class name separated by '.'
     * @param {Object} classDefinition Properties and methods that are added to the prototype
     *
     * @returns {function()} constructor The constructor of the created class
     * @expose
     */
    design: function (classPath, classDefinition) {
      var SuperClass, implementations, NewClass;

      SuperClass = classDefinition['Extends'] || null;
      delete classDefinition['Extends'];

      implementations = classDefinition['Implements'] || null;
      delete classDefinition['Implements'];

      NewClass = classDefinition['initialize'] || null;
      delete classDefinition['initialize'];

      if (!NewClass) {
        if (SuperClass) {
          NewClass = function () { SuperClass.apply(this, arguments); };
        } else {
          NewClass = function () {};
        }
      }

      applyConstructorName(NewClass, classPath);

      inheritFromClass(NewClass, SuperClass);

      augmentImplementations(NewClass, implementations);

      applyClassNameToPrototype(NewClass, classPath);

      Class.extend(NewClass, classDefinition, true);

      exposeClassOnNamespace(classPath, NewClass);

      return NewClass;
    },

    /**
     * Extend the given class prototype with properties and methods
     *
     * @param {function()} ExistingClass Constructor of existing class
     * @param {Object} extension Properties and methods that are added to the prototype
     * @param {boolean=} shouldOverride Specify if the extension should
     * override existing properties
     *
     * @expose
     */
    extend: function (ExistingClass, extension, shouldOverride) {
      if (extension['STATIC']) {
        augmentProperties(ExistingClass, extension['STATIC'], shouldOverride);
        delete extension['STATIC'];
      }
      augmentProperties(ExistingClass.prototype, extension, shouldOverride);
    }
  };

  // Return as AMD module or attach to head object
  if (typeof define !== "undefined") {
    define([], function () { return Class; });
  } else if (globalNamespace) {
    /** @expose */
    globalNamespace.Class = Class;
  } else {
    /** @expose */
    module.exports = Class;
  }

}(typeof define !== "undefined" || typeof window === "undefined" ? null : window));