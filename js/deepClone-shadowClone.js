/*
1、堆和栈的区别：
  堆和栈都是内存中划分出来用来存储的区域。
  栈（stack）为自动分配的内存空间，它由系统自动释放
  堆（heap）则是动态分配的内存，大小不定也不会自动释放
2、基本数据类型 undefined，boolean，number，string，null，基本数据内型存放在栈中的简单数据段可以直接访问，基本数据类型的比较是值的比较。
3、引用数据内型存放在堆中，变量实际上是一个存放在栈内存的指针，这个指针指向堆内存中的地址，引用类型是可以直接改变其值的，引用类型的比较是引用的比较
是看其引用是否是指向同一个对象。
* */
function deepClone(obj){
  let objClone = Array.isArray(obj)?[]:{};
  if(obj && typeof obj === 'object'){
    for (key in obj){
      if(obj.hasOwnProperty(key)){
        if(obj[key]&&typeof obj[key] === 'object'){
          objClone[key] = deepClone(obj[key])
        }else{
          objClone[key] = obj[key];
        }
      }
    }
  }
  return objClone;
}
//null array object typeof 都返回object。
//typeof返回值有六种可能性：number string boolean object function undefined symbol。
function deepClone2(obj) {
  let _obj = JSON.stringify(obj);
  let objClone = JSON.parse(_obj);
  return objClone
}


function deepClone3(obj) {
  console.log('Object.getPrototypeOf(obj)',Object.getPrototypeOf(obj));
  var copy = Object.create(Object.getPrototypeOf(obj));
  console.log('copy=',copy);
  var propNames = Object.getOwnPropertyNames(obj);
  console.log('propNames=',propNames);
  propNames.forEach(function (items) {
    console.log('items=',items);
    var item = Object.getOwnPropertyDescriptor(obj,items);
    console.log('item=',item);
    Object.defineProperty(copy,items,item);
  });
  return copy;
}
var testObj = {
  name: 'weiqiujuan',
  sex: 'girl',
  age:'22',
  favorite: 'play',
  family: {
    brother: 'son',
    mother:'haha',
    father:'heihei'
  }
};
console.log(deepClone3(testObj));
/*
 1、Object.getPrototypeOf()该方法与 setPrototypeOf 方法配套，用于读取一个对象的 prototype 对象。
 2、
 */

//concat slice object.assign 只是一级不受影响但是二级属性还是没有拷贝成功即浅拷贝。

//赋值（=）和浅拷贝的区别

var obj1 = {
  name:'zhangsan',
  age:'18',
  language:[1,[2,3],[4,5]]
};
var obj2 = obj1;
var obj3 = shallowCopy(obj1);
function shallowCopy(src) {
  var dst = {};
  for (var prop in src) {
    if (src.hasOwnProperty(prop)) {
      dst[prop] = src[prop];
    }
  }
  return dst;
}

/*
1、赋值得到的对象只是将指针改变，其引用仍然是同一个对象。
2、深拷贝将B对象拷贝到A对象中，包括B里面的对象。
3、浅拷贝将B对象拷贝到A对象中但不包括B里面的子对象。
 */


function Promise(excutor){
  this.count=0;

  this.status='pending';
  this.value=undefined;
  this.reason=undefined;
  function resolve(value) {
    if(this.status==='pending'){
      this.count++;
      this.status='resolve';
      this.value=value;
    }
  }
  function reject(reason) {
    if(this.status==='pending'){
      this.status='reject';
      this.reason=reason;
    }
  }
  function promisall(arrPromise) {
    if (this.count === arrPromise.length) {

    }
  }
    excutor(resolve,reject);
}
































