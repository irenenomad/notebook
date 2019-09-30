##### 1、为什么使用flow、typescript等
    （1）javascript是动态类型语言。动态类型语言的灵活性带来的副作用就是会产生有隐患的代码，
    这些bug在编译阶段发现不了，但是运行阶段就出问题了。
    （2）类型检查可以在编译期就发现问题，不会影响代码运行。
    （3）项目越复杂就越需要增强可维护性和可读性
##### 2、工作方式
######（1）类型推断
````js
function split(str) {
  return str.split('')
}
split(11)
````
   
######（2）类型注释
````js
function add(x: number,y: number): number {
  return x+y
}
````
