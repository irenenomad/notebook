function flip(fn) {
  return function() {
    var args = [].slice.call(arguments);
    return fn.apply(this, args.reverse());
  };
}

function rightCurry(fn, n) {
  var arity = n || fn.length,
    fn = flip(fn);
    console.log('fn===',fn, arity);
  return function curried() {
    var args = [].slice.call(arguments),
      context = this;
    console.log('args===',args);
    console.log('context===',context);
    return args.length >= arity ?
      fn.apply(context, args.slice(0, arity)) :
      function () {
        var rest = [].slice.call(arguments);
        return curried.apply(context, args.concat(rest));
      };
  };
}

var toString = Object.prototype.toString;
var isFunction = function(o) { return toString.call(o) == '[object Function]'; };

function group(list, prop) {
  return list.reduce(function(grouped, item) {
    var key = isFunction(prop) ? prop.apply(this, [item]) : item[prop];
    grouped[key] = grouped[key] || [];
    grouped[key].push(item);
    return grouped;
  }, {});
}
// `group()` 的 `rightCurry` 版本
var groupBy = rightCurry(group);
var getKey = function(item) { return item.age < 40 ? 'under40' : 'over40'; };
var list = [
  { name: 'Dave', age: 40 },
  { name: 'Dan', age: 35 },
  { name: 'Kurt', age: 44 },
  { name: 'Josh', age: 33 }
];
groupBy(getKey)(list);

[1,2,3,4].reduce(function (sum,n) { return sum += n; }, 0);


list.reduce(function(acc, item) {
  var key = item.age < 40 ? 'under40' : 'over40';
  acc[key] = acc[key] || [];
  acc[key].push(item);
  return acc;
}, {});

function radixSort(arr, maxDigit) {
  var mod = 10;
  var dev = 1;
  var counter = [];
  console.time('基数排序耗时');
  for (var i = 0; i < maxDigit; i++, dev *= 10, mod *= 10) {
    for(var j = 0; j < arr.length; j++) {
      var bucket = parseInt((arr[j] % mod) / dev);
      if(counter[bucket]== null) {
        counter[bucket] = [];
      }
      counter[bucket].push(arr[j]);
    }
    var pos = 0;
    for(var j = 0; j < counter.length; j++) {
      var value = null;
      if(counter[j]!=null) {
        while ((value = counter[j].shift()) != null) {
          arr[pos++] = value;
        }
      }
    }
  }
  console.timeEnd('基数排序耗时');
  return arr;
}
var arr = [3, 44, 38, 5, 47, 15, 36, 26, 27, 2, 46, 4, 19, 50, 48];
console.log(radixSort(arr,2)); //[2, 3, 4, 5, 15, 19, 26, 27, 36, 38, 44, 46, 47, 48, 50];

const INIT = '@@redux/INIT_' + Math.random().toString(36).substring(7);

export default function createStore (reducer, initialState, enhancer) {
  if (typeof initialState === 'function') {
    enhancer = initialState;
    initialState = undefined;
  }

  let state = initialState;

  const listeners = [];
  const store = {
    getState () {
      return state
    },
    dispatch (action) {
      if (action && action.type) {
        state = reducer(state, action);
        listeners.forEach(listener => listener())
      }
    },
    subscribe (listener) {
      if (typeof listener === 'function') {
        listeners.push(listener)
      }
    }
  };
  if (typeof initialState === 'undefined') {
    store.dispatch({ type: INIT })
  }
  if (typeof enhancer === 'function') {
      return enhancer(store)
  }
  return store
}

function add (a) {
  return function (b) {
    return a + b
  }
}// 得到合成后的方法let add6 = compose(add(1), add(2), add(3))

add6(10); // 16

export function compose (...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }
  if (funcs.length === 1) {
    return funcs[0]
  }
  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}

import { compose } from './utils'
export default function applyMiddleware (...middlewares) {
  return store => {
    const chains = middlewares.map(middleware => middleware(store))
    store.dispatch = compose(...chains)(store.dispatch)
    return store
  }
}


function add(a) {
  return function (b) {
    return a + b;
  };
}
function compose() {
  for (var _len = arguments.length, funcs = new Array(_len), _key = 0; _key < _len; _key++) {
    console.log('arguments[_key]===',arguments[_key]);
    funcs[_key] = arguments[_key];
  }

  if (funcs.length === 0) {
    console.log('funcs.length === 0',funcs);
    return function (arg) {
      console.log('funcs.length === 0 arg',arg);
      return arg;
    };
  }

  if (funcs.length === 1) {
    console.log('funcs.length === 1',funcs);
    return funcs[0];
  }

  return funcs.reduce(function (a, b) {
    return function () {
      console.log('1a===',a,'1b===',b,'1arguments===',arguments);
      return a(b.apply(void 0, arguments));
    };
  });
}

var add6 = compose(add(1), add(2), add(3), add(4));
add6(10); // 16

function middleware (store) {
  return function f1 (dispatch) {
    return function f2 (action) {      // do something
      dispatch(action)      // do something
    }
  }
}

function middleware1 (store) {
  return function f1 (dispatch) {
    return function f2 (action) {
      console.log(1);
      dispatch(action);
      console.log(1)
    }
  }
}
function middleware2 (store) {
  return function f1 (dispatch) {
    return function f2 (action) {
      console.log(2);
      dispatch(action);
      console.log(2)
    }
  }
}// applyMiddleware(middleware1, middleware2)

applyMiddleware(middleware1, middleware2);

var numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
// add a new element to the numbers array
numbers[numbers.length] = 10;
console.log('Add 10 to the end', numbers);

numbers.push(11);
console.log('Add 11 with push', numbers);

numbers.push(12, 13,14,15);
console.log('Add 12 and 13 with push', numbers);

Array.prototype.insertFirstPosition = function(value) {
  for (var i = this.length; i >= 0; i--) {
    this[i] = this[i - 1];
  }
  this[0] = value;
};

numbers.insertFirstPosition(-1);
console.log('Add -1 with insertFirstPosition', numbers);
numbers.unshift(-2);
console.log('Add -2 with unshift', numbers);
//printArray(numbers);

numbers.unshift(-4, -3);
console.log('Add -4 and -3 with unshift', numbers);
// printArray(numbers);

// ************** Removing elements

numbers.pop();
console.log('Removed last value with pop', numbers);

for (var i = 0; i < numbers.length; i++) {
  numbers[i] = numbers[i + 1];
}

console.log('Removed first value manually', numbers);
console.log('Lenght after value removed manually', numbers.length);

var numbers = [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

Array.prototype.reIndex = function(myArray) {
  const newArray = [];
  for(let i = 0; i < myArray.length; i++ ) {
    if (myArray[i] !== undefined) {
      // console.log(myArray[i]);
      newArray.push(myArray[i]);
    }
  }
  return newArray;
}

// remove first position manually and reIndex
Array.prototype.removeFirstPosition = function() {
  for (let i = 0; i < this.length; i++) {
    this[i] = this[i + 1];
  }
  return this.reIndex(this);
};

 numbers = numbers.removeFirstPosition();
console.log('Removed first with removeFirstPosition + reIndex', numbers);

// using method shift
numbers.shift();
console.log('Removed first with shift', numbers);
console.log('Lenght after removed first with shift', numbers.length);

//* *** Removing and Adding elements from the middle of the array or specific position
// splice method - parameter (index, howManyPositionsToBeRemoved, item1...itemX)
numbers.splice(5, 3);
console.log('Removing 3 elements (3, 4, 5) starting index 5', numbers);

numbers.splice(5, 0, 2, 3, 4);
console.log('Adding 3 elements (2, 3, 4) starting index 5', numbers);

numbers.splice(5, 3, 2, 3, 4);
console.log('Removing 3 elements starting index 5 and adding (2, 3, 4)', numbers);

var averageTempDay1 = [72, 75, 79, 79, 81, 81];
var averageTempDay2 = [81, 79, 75, 75, 73, 72];

var averageTemp = [];

// same as
averageTemp[0] = [72, 75, 79, 79, 81, 81];
averageTemp[1] = [81, 79, 75, 75, 73, 73];

function printMatrix(myMatrix) {
  for (var i = 0; i < myMatrix.length; i++) {
    for (var j = 0; j < myMatrix[i].length; j++) {
      console.log(myMatrix[i][j]);
    }
  }
}

//printMatrix(averageTemp);
console.log('averageTemp two-dimensional array:');

// same as

// day 1
averageTemp[0] = [];
averageTemp[0][0] = 72;
averageTemp[0][1] = 75;
averageTemp[0][2] = 79;
averageTemp[0][3] = 79;
averageTemp[0][4] = 81;
averageTemp[0][5] = 81;
// day 2
averageTemp[1] = [];
averageTemp[1][0] = 81;
averageTemp[1][1] = 79;
averageTemp[1][2] = 75;
averageTemp[1][3] = 75;
averageTemp[1][4] = 73;
averageTemp[1][5] = 73;

printMatrix(averageTemp);
console.table(averageTemp);

//* * Multidimensional Matrix

// Matrix 3x3x3 - Cube

const matrix3x3x3 = [];
for (var i = 0; i < 3; i++) {
  matrix3x3x3[i] = [];
  for (var j = 0; j < 3; j++) {
    matrix3x3x3[i][j] = [];
    for (var z = 0; z < 3; z++) {
      matrix3x3x3[i][j][z] = i + j + z;
    }
  }
}

for (var i = 0; i < matrix3x3x3.length; i++) {
  for (var j = 0; j < matrix3x3x3[i].length; j++) {
    for (var z = 0; z < matrix3x3x3[i][j].length; z++) {
      console.log(matrix3x3x3[i][j][z]);
    }
  }
}

// user-friendly-output
const matrix3x3x3Output = [];
for (var i = 0; i < 3; i++) {
  matrix3x3x3Output[i] = [];
  for (var j = 0; j < 3; j++) {
    matrix3x3x3Output[i][j] = `[${matrix3x3x3[i][j].join(', ')}]`;
  }
}
console.log('matrix3x3x3 three-dimensional array:');
console.table(matrix3x3x3Output);

const zero = 0;
const positiveNumbers = [1, 2, 3];
const negativeNumbers = [-3, -2, -1];
var numbers = negativeNumbers.concat(zero, positiveNumbers);

console.log('zero', zero);
console.log('positiveNumbers', positiveNumbers);
console.log('negativeNumbers', negativeNumbers);
console.log('negativeNumbers.concat(zero, positiveNumbers)', numbers);

/* function isEven(x) {
  // returns true if x is a multiple of 2.
  console.log(x);
  return x % 2 === 0 ? true : false;
} */ // ES5 syntax
const isEven = x => x % 2 === 0;

var numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
console.log('numbers', numbers);

// it is going to execute the function only once
console.log('numbers.every(isEven)', numbers.every(isEven));

// is going to execute the function twice
console.log('numbers.some(isEven)', numbers.some(isEven));

/* numbers.forEach(function(x) {
  console.log(x % 2 == 0);
}); */ // ES5 sintax for function below

numbers.forEach(x => console.log(`numbers.forEach: ${x} % 2 === 0`, x % 2 === 0));


console.log('numbers.map(isEven)', numbers.map(isEven));

console.log('numbers.filter(isEven)', numbers.filter(isEven));

/* console.log('numbers.reduce',
  numbers.reduce(function(previous, current, index) {
    return previous + current;
  })
); */ // ES5 sintax for function below

console.log('numbers.reduce', numbers.reduce((previous, current) => previous + current));

var isEven = function isEven(x) {
  return x % 2 === 0;
};

var numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
console.log('numbers', numbers); // it is going to execute the function only once

console.log('numbers.every(isEven)', numbers.every(function isEven(x) {
  return x % 2 === 0;
})); // is going to execute the function twice

console.log('numbers.some(isEven)', numbers.some(function isEven(x) {
  return x % 2 === 0;
}));
/* numbers.forEach(function(x) {
  console.log(x % 2 == 0);
}); */
// ES5 sintax for function below

numbers.forEach(function (x) {
  return console.log("numbers.forEach: ".concat(x, " % 2 === 0"), x % 2 === 0);
});
console.log('numbers.map(isEven)', numbers.map(function isEven(x) {
  return x % 2 === 0;
}));
console.log('numbers.filter(isEven)', numbers.filter(function isEven(x) {
  return x % 2 === 0;
}));
/* console.log('numbers.reduce',
  numbers.reduce(function(previous, current, index) {
    return previous + current;
  })
); */
// ES5 sintax for function below

console.log('numbers.reduce', numbers.reduce(function (previous, current) {
  return previous + current;
}));