(function (globalNamespace) {
  "use strict";

  function defineInterfaceModule(Class) {
    /**
     * @constructor
     */
    var ImplementationMissingError = function (message) {
      this.name = "ImplementationMissingError";
      this.message = (message || "");
    };
    
    ImplementationMissingError.prototype = Error.prototype;

    function createExceptionThrower(interfaceName, methodName, expectedType) {
      return function() {
        var message = 'Missing implementation for <' + this + '::' + methodName + '> defined by interface ' + interfaceName;

        throw new ImplementationMissingError(message);
      };
    }

    var Interface = function(path, definition, local) {

      if(typeof path !== 'string') {
        throw new Error('Please give your interface a name. Pass "true" as last parameter to avoid global namespace pollution');
      }

      var interfaceName = path.substr(path.lastIndexOf('.') + 1),
          methodName,
          property;

      /*jslint evil: true */
      var InterfaceConstructor = new Function('return function ' + interfaceName + '() {}')();

      for(methodName in definition) {

        if(definition.hasOwnProperty(methodName)) {
          
          property = definition[methodName];

          InterfaceConstructor.prototype[methodName] = createExceptionThrower(path, methodName, property);
        }
      }

      if(!local) {
        Class['namespace'](path, InterfaceConstructor);
      }

      InterfaceConstructor.toString = function () { return interfaceName; };

      return InterfaceConstructor;
    };

    Interface['ImplementationMissingError'] = ImplementationMissingError;

    return Interface;
  }

  // Return as AMD module or attach to head object
  if (typeof define !== "undefined") {
    define('Interface', ['Class'], function (Class) { return defineInterfaceModule(Class); });
  } 
  // expose on global namespace (browser)
  else if (typeof window !== "undefined") {
    /** @expose */
    globalNamespace['Interface'] = defineInterfaceModule(globalNamespace['Class']);
  }
  // expose on global namespace (node)
  else {
    var Class = require('./Class')['Class'];
    globalNamespace.Interface = defineInterfaceModule(Class);
  }

}(typeof define !== "undefined" || typeof window === "undefined" ? exports : window));