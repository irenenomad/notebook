##### 1、setState 批量更新
##### 除了virtual-dom的优化，减少数据更新的频率是另外一种手段，也就是React的批量更新。 
````js
g() {
   this.setState({
        age: 18
    })
    this.setState({
        color: 'black‘
    })
}

f() {
    this.setState({
        name: 'yank'
    })
    this.g()
}
````
##### 会被React合成为一次setState调用
````js
f() {
    this.setState({
        name: 'yank',
        age: 18, 
        color: 'black'
    })
}
````
##### 通过伪码大概看一下setState是如何合并的
````js
setState(newState) {
    if (this.canMerge) {
        this.updateQueue.push(newState)
        return 
    }
    
    // 下面是真正的更新: dom-diff, lifeCycle...
    ...
}

````
React隐式的帮我们设置了this.canMerge,事件处理函数，声明周期，这些函数的执行是发生在React内部的，React对它们有完全的控制权。
在执行componentDidMount前后，React会执行canMerge逻辑，事件处理函数也是一样，React委托代理了所有的事件，在执行你的处理函数
函数之前，会执行React逻辑，这样React也是有时机执行canMerge逻辑的。批量更新是极好滴！我们当然希望任何setState都可以被批量，
关键点在于React是否有时机执行canMerge逻辑，也就是React对目标函数有没有控制权。如果没有控制权，一旦setState提前返回了，就再
也没有机会应用这次更新了。handleClick 是事件回调，React有时机执行canMerge逻辑，所以x为1，2，3是合并的，handleClick结束之
后canMerge被重新设置为false。注意这里有一个setTimeout(fn, 0)。 这个fn会在handleClick之后调用，而React对setTimeout并
没有控制权，React无法在setTimeout前后执行canMerge逻辑，所以x为4，5，6是无法合并的，所以fn这里会存在3次dom-diff。React没
有控制权的情况有很多： Promise.then(fn), fetch回调，xhr网络回调等等。

1、forceUpdate在批量与否的表现上，和setState是一样的。在React有控制权的函数里，是批量的。

2、forceUpdate只会强制本身组件的更新，即不调用“shouldComponentUpdate”直接更新，对于子孙后代组件还是要调用自己的
“shouldComponentUpdate”来决定的。

所以forceUpdate 可以简单的理解为 this.setState({})，只不过这个setState 是不调用自己的“shouldComponentUpdate”声明周期的