Class.js
========

***Lightning fast JavaScript class system in 1.4KB (638 bytes gzipped)***

100% no wrappers, same performance as hand-written pure JS classes. Exposes a beautiful API and gives classes and methods speaking names for debugging!

inspired by [my.class.js] (https://github.com/jiem/my-class) -> Heavily optimized for google closure advanced compilation.

more details to performance:
* [instantiation perfs] (http://jsperf.com/moo-resig-ender-my)
* [inheritance perfs - calling super constructor] (http://jsperf.com/moo-resig-ender-my/2)
* [inheritance perfs - calling super method] (http://jsperf.com/moo-resig-ender-my/3) 

Create a class
--------------
```JavaScript

(function() {
    
  Class('lib.Person', {

    STATIC: {
      AGE_OF_MAJORITY: 18
    },

    initialize: function(name, age) {
      this.name = name;
      this.age = age;
    },

    sayHello: function() {
      console.log('Hello from ' + this.name + '!');
    },

    drinkAlcohol: function() {
      this.age < lib.Person.AGE_OF_MAJORITY ?
        console.log('Too young! Drink milk instead!') :
        console.log('Whiskey or beer?');
    }
  });
})();

var john = new lib.Person('John', 16);
john.sayHello(); //log "Hello from John!"
john.drinkAlcohol(); //log "Too young! Drink milk instead!"
```

Extend and Implement other Classes
----------------------------------
```JavaScript
(function() {
  Class('lib.Dreamy', {
    dream: 'default',
      
    describeDream: function() {
      return "..it is about: " + this.dream;
    }
  });
})();
    
(function() {
  Class.design('lib.Awakable', {
    wakeUp: function() {
      console.log('Wake up!');
    }
  });
})();
    
(function() {
  var Dreamer = Class('lib.Dreamer', { 
    Extends: lib.Person, // person is super class (prototypal inheritance)
    Implements: [lib.Dreamy, lib.Awakable], // mixin prototypes of other classes

    initialize: function(name, age, dream) {
      Dreamer.Super.call(this, name, age);
      this.dream = dream;
    },

    sayHello: function() {
      Dreamer.Super.prototype.sayHello.call(this);
      console.log('I dream of ' + this.describeDream() + '!');
    }
  });
})();

var sylvester = new lib.Dreamer('Sylvester', 30, 'eating Tweety');
sylvester.sayHello(); //log "Hello from Sylvester! I dream of eating Tweety!"
sylvester.wakeUp(); //log "Wake up!"
```

```
Afraid to forget the `new` operator?
------------------------------------
```JavaScript
var Person = Class({

  // you can now call the constructor with or without new
  initialize: function(name, city) {
    if (!(this instanceof Person)) return new Person(name, city);
    
    this.name = name;
    this.city = citye;
  }

});
```

Inheritance of static properties
--------------------------------
Static properties of the super class are automatically copied to the subclass and then merged with the static properties defined by the subclass. This is what most programmers would expect from traditional inheritance.

```JavaScript
(function() {
      var Spaceship = Class('lib.Spaceship', { 
        
        STATIC: {
          MIN_SPEED: 0,
          MAX_SPEED: 100,
        },

        initialize: function() {
          console.log('Spaceship speed min: ' + Spaceship.MIN_SPEED + ' max: ' + Spaceship.MAX_SPEED);
        }
      });

      var Enterprise = Class('lib.Enterprise', { 
        
        Extends: lib.Spaceship,

        STATIC: {
          // overrides the static property of the super class
          MAX_SPEED: 99999,
        },

        initialize: function() {
          console.log('Enterprise speed min: ' + Enterprise.MIN_SPEED + ' max: ' + Enterprise.MAX_SPEED);
        }
      });
    })();

    var spaceship = new lib.Spaceship(); // logs: Spaceship speed min: 0 max: 100
    var enterprise = new lib.Enterprise(); // logs: Enterprise speed min: 0 max: 99999
```

Addon: Interfaces
--------------------------------
Optionally you can also include interface.js after class.js in your code and start
defining interfaces for your classes. These add simple runtime checks if you defined
all required methods on your class. Does not slow down your code because if you define
the methods they will simply override the ones of the interface.

```JavaScript
Interface('ICommand', { 
      
  execute: Function,
  undo: Function
  
});

var Command = Class({ 
  
  Implements: ICommand,

  execute: function() {
    console.log('executing command');
  }

});

var command = new Command();
command.execute(); // logs: executing command

try {
  command.undo();
} catch(error) {
  console.debug(error.message); // logs: Missing implementation for <[object Object]::undo> required by interface ICommand
}
```

AMD Usage
--------------------------------------

Using Class.js in AMD will look like the following:

```
define('TagTrack', ['Track', 'Class'], function (Track, Class) {
    var TagTrack = Class('TagTrack', {
        Extends: Track,
        initialize : function(settings){
            TagTrack.Super.call(this, settings);
            this.settings = settings
        }
    });
    return TagTrack;
});
```