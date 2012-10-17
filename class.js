(function () {
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

  Class = {

    /**
     * Creates and returns a new JavaScript 'class' as constructor function.
     *
     * @param {?String} className Name of the class - only used for better debugging
     * @param {Object} classDefinition Properties and methods
     * that are added to the prototype
     *
     * @returns {function()} constructor The constructor of the created class
     * @expose
     */
    design: function (className, classDefinition) {
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

      applyConstructorName(NewClass, className);

      inheritFromClass(NewClass, SuperClass);

      augmentImplementations(NewClass, implementations);

      applyClassNameToPrototype(NewClass, className);

      Class.extend(NewClass, classDefinition, true);

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
  } else if (typeof window !== "undefined") {
    /** @expose */
    window.Class = Class;
  } else {
    module.exports = Class;
  }

}());