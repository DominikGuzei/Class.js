(function (globalNamespace) {
  "use strict";

  function applyMethodName(method, name) {
    method.toString = function () { return name; };
  }

  function applyConstructorName(NewClass, name) {
    NewClass.toString = function () { return name; };
  }

  function applyClassNameToPrototype(NewClass, name) {
    NewClass.prototype.toString = function () { return name; };
  }

  /**
   * Creates and returns a new JavaScript 'class' as constructor function.
   *
   * @param {String} classPath Namespaces and class name separated by '.'
   * @param {Object} classDefinition Properties and methods that are added to the prototype
   *
   * @returns {function()} constructor The constructor of the created class
   * @expose
   */
  var Class = function (classPath, classDefinition) {
    var SuperClass, implementations, NewClass;

    if(arguments.length < 2) {
      classDefinition = classPath;
      classPath = null;
    }

    SuperClass = classDefinition['Extends'] || null;
    delete classDefinition['Extends'];

    implementations = classDefinition['Implements'] || null;
    delete classDefinition['Implements'];

    NewClass = classDefinition['initialize'] || null;
    delete classDefinition['initialize'];

    if (!NewClass) {
      if (SuperClass) {
        // invoke constructor of superclass by default
        NewClass = function () { SuperClass.apply(this, arguments); };
      } else {
        // there is no super class, default constructor is no-op method
        NewClass = function () {};
      }
    }

    if(classPath) {
      applyConstructorName(NewClass, classPath);
    }

    Class.inherit(NewClass, SuperClass);

    Class.implement(NewClass, implementations);

    if(classPath) {
      applyClassNameToPrototype(NewClass, classPath);
    }

    Class.extend(NewClass, classDefinition, true);

    if(classPath) {
      Class.namespace(classPath, NewClass);
    }

    return NewClass;
  }

  /**
   * Adds all properties of the extension object to the target object. 
   * Can be configured to override existing properties.
   * 
   * @param  {Object} target
   * @param  {Object} extension
   * @param  {Boolean} shouldOverride
   * @return {undefined}
   */
  Class.augment = function (target, extension, shouldOverride) {

    var propertyName, property, targetHasProperty,
      propertyWouldNotBeOverriden, extensionIsPlainObject, className;

    for (propertyName in extension) {

      if (extension.hasOwnProperty(propertyName)) {

        targetHasProperty = target.hasOwnProperty(propertyName);

        if (shouldOverride || !targetHasProperty) {

          property = target[propertyName] = extension[propertyName];

          if (typeof property === 'function') {
            extensionIsPlainObject = (extension.toString === Object.prototype.toString);
            className = extensionIsPlainObject ? target.constructor : extension.constructor;

            applyMethodName(property, className + "::" + propertyName);
          }
        }
      }
    }
  };

  /**
   * Extend the given class prototype with properties and methods
   *
   * @param {function()} TargetClass Constructor of existing class
   * @param {Object} extension Properties and methods that are added to the prototype
   * @param {Boolean} shouldOverride Specify if the extension should
   * override existing properties on the target class prototype
   *
   * @expose
   */
  Class.extend = function (TargetClass, extension, shouldOverride) {
    
    if (extension['STATIC']) {

      if(TargetClass.Super) {
        // add static properties of the super class to the class namespace
        Class.augment(TargetClass, TargetClass.Super['_STATIC_'], true);
      }

      // add static properties and methods to the class namespace
      Class.augment(TargetClass, extension['STATIC'], true);

      // save the static definitions into special var on the class namespace
      TargetClass['_STATIC_'] = extension['STATIC'];
      delete extension['STATIC'];
    }

    // add properties and methods to the class prototype
    Class.augment(TargetClass.prototype, extension, shouldOverride);
  };

  /**
   * Sets up the classical inheritance chain between
   * the base class and the sub class. Adds a static
   * property to the sub class that references the 
   * base class.
   * 
   * @param  {Function} SubClass
   * @param  {Function} SuperClass
   * @return {undefined}
   */
  Class.inherit = function (SubClass, SuperClass) {

    if (SuperClass) {
      /** @constructor */
      var SuperClassProxy = function () {};
      SuperClassProxy.prototype = SuperClass.prototype;

      SubClass.prototype = new SuperClassProxy();
      SubClass.prototype.constructor = SubClass;

      /** @expose */
      SubClass.Super = SuperClass;

      Class.extend(SubClass, SuperClass, false);
    }
  };

  /**
   * Copies the prototype properties of the given
   * implementations to the class prototype.
   * 
   * @param  {Function} TargetClass
   * @param  {Function|Array} implementations
   * @return {undefined}
   */
  Class.implement = function (TargetClass, implementations) {

    if (implementations) {
      var index;
      if (typeof implementations === 'function') {
        implementations = [implementations];
      }
      for (index = 0; index < implementations.length; index += 1) {
        Class.augment(TargetClass.prototype, implementations[index].prototype, false);
      }
    }
  }

  /**
   * Creates a namespace chain and exposes the given object
   * at the last position of the given namespace.
   *
   * e.g: Class.namespace('lib.util.Math', {})
   * would create a namespace like window.lib.util.Math and 
   * assign the given object literal to last part: 'Math'
   * 
   * @param  {[type]} namespacePath [description]
   * @param  {[type]} exposedObject [description]
   * @return {[type]}               [description]
   */
  Class.namespace = function (namespacePath, exposedObject) {

    if(globalNamespace) {
      var classPathArray, className, currentNamespace, currentPathItem, index;
    
      classPathArray = namespacePath.split('.');
      className = classPathArray[classPathArray.length - 1];
    
      currentNamespace = globalNamespace;
    
      for(index = 0; index < classPathArray.length - 1; index += 1) {
        currentPathItem = classPathArray[index];
        
        if(typeof currentNamespace[currentPathItem] === "undefined") {
          currentNamespace[currentPathItem] = {};
        }
        
        currentNamespace = currentNamespace[currentPathItem];
      }
      
      currentNamespace[className] = exposedObject;
    }
  }

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