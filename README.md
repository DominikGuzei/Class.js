Class.js
========

Lighting fast JavaScript class system in 631 bytes (355 bytes gzipped).

100% no wrappers, same performance as hand-written pure JS classes.

inspired by [my.class.js] (https://github.com/jiem/my-class) -> Heavily optimized for google closure advanced compilation.

more details to performance:
* [instantiation perfs] (http://jsperf.com/moo-resig-ender-my)
* [inheritance perfs - calling super constructor] (http://jsperf.com/moo-resig-ender-my/2)
* [inheritance perfs - calling super method] (http://jsperf.com/moo-resig-ender-my/3) 

Create a class
--------------
 Assume that classes are created in the namespace `myLib`.

    (function() {

      var Person = Class.create({

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
          this.age < Person.AGE_OF_MAJORITY ?
            console.log('Too young! Drink milk instead!') :
            console.log('Whiskey or beer?');
        }

      });

      myLib.Person = Person;

    })();

    var john = new myLib.Person('John', 16);
    john.sayHello(); //log "Hello from John!"
    john.drinkAlcohol(); //log "Too young! Drink milk instead!"


Extend a class
--------------
    (function() {

      //Dreamer extends Person
      var Dreamer = Class.create({ Extend: myLib.Person,

        initialize: function(name, age, dream) {
          Dreamer.Super.call(this, name, age);
          this.dream = dream;
        },

        sayHello: function() {
          superSayHello.call(this);
          console.log('I dream of ' + this.dream + '!');
        },

        wakeUp: function() {
          console.log('Wake up!');
        }

      });

      var superSayHello = Dreamer.Super.prototype.sayHello;

      myLib.Dreamer = Dreamer;

    })();

    var sylvester = new myLib.Dreamer('Sylvester', 30, 'eating Tweety');
    sylvester.sayHello(); //log "Hello from Sylvester! I dream of eating Tweety!"
    sylvester.wakeUp(); //log "Wake up!"


Add methods to a class
----------------------

    Class.extend(myLib.Dreamer, {

      touchTheSky: function() {
        console.log('Touching the sky');
      },

      reachTheStars: function() {
        console.log('She is so pretty!');
      }

    });

Afraid to forget the `new` operator?
------------------------------------

    var Person = Class.create({

      // you can now call the constructor with or without new
      initialize: function(name, city) {
        if (!(this instanceof Person)) return new Person(name, city);
        
        this.name = name;
        this.city = citye;
      }

    });