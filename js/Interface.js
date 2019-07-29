var Interface = function(name, methods) {
  if(arguments.length != 2) {
    throw new Error("Interface constructor called with " + arguments.length
      + "arguments, but expected exactly 2.");
  }

  this.name = name;
  this.methods = [];
  for(var i = 0, len = methods.length; i < len; i++) {
    if(typeof methods[i] !== 'string') {
      throw new Error("Interface constructor expects method names to be "
        + "passed in as a string.");
    }
    this.methods.push(methods[i]);
  }
};

// Static class method.

Interface.ensureImplements = function(object) {
  if(arguments.length < 2) {
    throw new Error("Function Interface.ensureImplements called with " +
      arguments.length  + "arguments, but expected at least 2.");
  }

  for(var i = 1, len = arguments.length; i < len; i++) {
    var interface = arguments[i];
    if(interface.constructor !== Interface) {
      throw new Error("Function Interface.ensureImplements expects arguments "
        + "two and above to be instances of Interface.");
    }

    for(var j = 0, methodsLen = interface.methods.length; j < methodsLen; j++) {
      console.log('interface.methods===',interface.methods,'object===',object);
      var method = interface.methods[j];
      if(!object[method] || typeof object[method] !== 'function') {
        throw new Error("Function Interface.ensureImplements: object "
          + "does not implement the " + interface.name
          + " interface. Method " + method + " was not found.");
      }
    }
  }
};

var Composite = new Interface('Composite', ['add', 'remove', 'getChild']);
var a = {};

function addForm(formInstance) {
  Interface.ensureImplements(formInstance, Composite,a);
  formInstance.add();
  formInstance.remove();
  formInstance.getChild()
  // This function will throw an error if a required method is not implemented,
  // halting execution of the function.
  // All code beneath this line will be executed only if the checks pass.
}
var formInstance = {

};
formInstance.add = function(child) {
  console.log('CompositeForm add');
};
formInstance.remove = function(child) {
  console.log('CompositeForm remove');
};
formInstance.getChild = function(index) {
  console.log('CompositeForm getChild');
};

// Implement the FormItem interface.

formInstance.save = function() {
  console.log('CompositeForm save');
};
addForm(formInstance);