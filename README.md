Class.js
========

***Lighting fast JavaScript class system in 1.02KB (519 bytes gzipped)***

100% no wrappers, same performance as hand-written pure JS classes. Exposes a beautiful API and gives classes and methods speaking names for debugging!

inspired by [my.class.js] (https://github.com/jiem/my-class) -> Heavily optimized for google closure advanced compilation.

more details to performance:
* [instantiation perfs] (http://jsperf.com/moo-resig-ender-my)
* [inheritance perfs - calling super constructor] (http://jsperf.com/moo-resig-ender-my/2)
* [inheritance perfs - calling super method] (http://jsperf.com/moo-resig-ender-my/3) 

Create a class
--------------
```JavaScript
var Person = Class.create('my.lib.Person', {

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

var john = new Person('John', 16);
john.sayHello(); //log "Hello from John!"
john.drinkAlcohol(); //log "Too young! Drink milk instead!"
```

Extend and Implement other Classes
----------------------------------
```JavaScript
Class.create('my.lib.Dreamy', {
  dream: 'default',
  
  describeDream: function() {
    return "..it is about: " + this.dream;
  }
});

var Awakable = Class.create('my.lib.Awakable', {
  wakeUp: function() {
    console.log('Wake up!');
  }
});

var Dreamer = Class.create('my.lib.Dreamer', { 
  Extend: Person, // person is super class (prototypal inheritance)
  Implement: [my.lib.Dreamy, Awakable], // mixin prototypes of other classes

  initialize: function(name, age, dream) {
    Dreamer.Super.call(this, name, age);
    this.dream = dream;
  },

  sayHello: function() {
    Dreamer.Super.prototype.sayHello.call(this);
    console.log('I dream of ' + this.describeDream() + '!');
  }

});

var sylvester = new Dreamer('Sylvester', 30, 'eating Tweety');
sylvester.sayHello(); //log "Hello from Sylvester! I dream of eating Tweety!"
sylvester.wakeUp(); //log "Wake up!"
```

Add methods to a class
----------------------
```JavaScript
Class.extend(my.lib.Dreamer, {

  touchTheSky: function() {
    console.log('Touching the sky');
  },

  reachTheStars: function() {
    console.log('She is so pretty!');
  }

});
```
Afraid to forget the `new` operator?
------------------------------------
```JavaScript
var Person = Class.create({

  // you can now call the constructor with or without new
  initialize: function(name, city) {
    if (!(this instanceof Person)) return new Person(name, city);
    
    this.name = name;
    this.city = citye;
  }

});
```