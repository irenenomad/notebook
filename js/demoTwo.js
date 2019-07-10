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