1、vue作为一个mvvm框架的基本实现原理：
（1）数据代理。
（2）模板解析。
（3）数据绑定。
2、相关概念：
（1）[].slice.call(lis) : 将伪数组转换为真数组。
（2）node.nodeType : 得到节点类型。
（3）object.defineProperty(obj, propertyName,{}) : 给对象添加属性（指定描述符）。
（4）object.keys(obj) : 得到对象自身可枚举属性组成的数组。
（5）object.hasOwnProperty(prop) : 判断prop是否是obj自身的属性。
（6）DocumentFragment : 文档碎片（高效批量更新多个节点）
3、数据代理：
（1）概念：
	通过一个对象代理另一个对象中属性的操作（读/写），vue通过vm对象来代理data对象中所有的属性操作。
（2) 基本流程：
	a、在vue构造函数内传入数据初始化。
    b、遍历Object.keys(data)得到vm.data对象自身可枚举属性组成的数组，依次把属性传入并调用vm._proxy(key)方法。
	c、vm._proxy(key)方法，通过Object.defineProperty()给vm添加与data对象的属性对应的属性描述符。
	d、所有添加的属性都包含getter/setter（对象属性分为数据属性和访问器属性，这里是访问器属性）。
	e、getter/setter内部去操作vm.data中对应的属性数据。
4、模板解析：
基本概念：
（1)compileUtil数据绑定bind到vm上和new Watcher，bind调用updater。
（2）updater更新节点数据，不同的指令调用不同的更新方法。
基本流程：
	a、new一个compile对象传入option.el选择器字符串和vm实例。
	b、进入compile构造函数将判断dom树把el的所有子节点取出，调用compile.node2Fragment方法调用
	   document.createDocumentFragment()创建fragment,再把子节点fragment.appendChild进fragment
	   中并返回fragment（这里相当于把节点放入内存中）。
	c、调用compile.init再递归调用compileElement方法编译内存中的节点：
		（1）[].slice.call()变节点数组成数组并循环遍历节点。
		（2）分类判断节点类型node.nodeType区分文本节点和元素节点。
		（3）文本节点使用正则匹配双大括号里的属性调用compileUtil里的text方法。
		（4）元素节点调用compile方法，取标签的所有属性[].slice.call转数组遍历判断是不是指令（v-）是
		    事件指令（以on开头）还是一般指令，分别处理。
	d、编译完成以后el.appendChild添加回页面。
5、模板解析之事件指令解析：
（1）从指令名中取出事件名。
（2）根据指令的值（表达式）从methods中得到对应的事件处理函数对象。
（3）给当前元素节点绑定指定事件名和回调函数的dom事件监听。
（4）指令解析完成后，移除此指令属性。
6、模板解析之一般指令解析：
（1）得到指令名和指令值（表达式）。text/html/class
（2）从data中根据表达式得到对应的值。
（3）根据指令名确定需要操作元素节点的什么属性。
        v-text-----textContent属性
        v-html-----innerHTML属性
        v-class------class属性
（4）经过bind方法，new watcher 对象，并调用update更新界面。
（5）将得到的表达式的值设置到对应的属性上。
（6）移除元素的指令属性。
7、数据绑定：
    相关概念：
        a、数据绑定是一旦更新了data中的某个属性数据，所有界面上直接使用或间接使用
           了此属性的节点都会更新。
        b、数据劫持是vue中用来实现数据绑定的一种技术，通过defineProperty()来监
           视data中所有属性（任意层次）数据的变化，一旦变化就去更新界面。
        c、Dep对象是初始化给data的属性进行数据劫持的时候创建与data中的属性一一对应，
           创建id标识dep对象，用一个数组保存所有订阅这个属性的watcher对象，在更新时作为判断依据。
        d、watcher对象是初始化解析大括号表达式/一般指令时创建，与模板中表达式（不包含事件指令）
           一一对应，调用dep.addSub订阅watcher实例，watcher构造函数用一个{}来保存相关的n个dep
           容器对象，防止反复建立联系。
        e、Dep与Watcher是多对多的关系。
    流程描述：
    （1）在vue构造函数内传入数据初始化，并调用observe传入this和data对象。
    （2）new Observer对象，在构造函数内启动walk方法，遍历属性调用defineReactive响应式方法。
    （3）defineReactive方法中为每个属性new dep对象并将子属性调observe递归，知道所有属性都
        有dep对象,并通过Object.defineProperty的getter和settter方法调用dep.depend和
        dep.notify方法。
    （4）调用dep.notify对每个订阅的watcher实例调用updater更新界面。
    （5）调用dep.depend就会调用watcher.addDep(该watcher实例)判断是否增加dep。
8、双向数据绑定：
    在单向数据绑定的基础上，通过v-model，初始化页面模板解析的时候调用compileUtil里的model方法，
    在元素上再绑定一个监听事件。
