##### 1、什么是Fiber
    （1）每一个ReactElement对应一个Fiber对象
    （2）记录节点的各种状态（方便hook这种没有this的情况）
    （3）串联整个应用形成树结构
##### 2、包含的属性
````js
// Fiber对应一个组件需要被处理或者已经处理了，一个组件可以有一个或者多个Fiber
type Fiber = {
  // 标记不同的组件类型
  tag: WorkTag,
  // ReactElement里面的key
  key: null | string,
  // ReactElement.type，也就是我们调用‘createElement’的第一个参数
  elementType: any,
  // 异步组件resolved之后返回的内容，一般是‘function’或者‘class’
  type: any,
  // 跟当前Fiber相关的本地状态（比如浏览器环境就是DOM节点），比如说更新完成的state和props
  // RootFiber的stateNode就是FiberRoot
  stateNode: any,
  // 指向他在Fiber节点树中的‘parent’，用来处理完这个节点之后向上返回
  return: Fiber | null,
  // 单链表树结构
  // 指向自己的第一个子节点
  child: Fiber | null,
  // 指向自己的兄弟结构
  // 兄弟节点的return指向同一个父节点
  sibling: Fiber | null,
  index: number,
  // ref 属性
  ref: null | (((handle: mixed) => void) & {_stringRef: ?string}) | RefObject,
  // 新的变动带来的新的props
  pendingProps: any,
  // 上一次渲染完成之后的props
  memoizedProps: any,
  // 该Fiber对应的组件产生的Update会存放在这个队列里面
  updateQueue: UpdateQueue<any> | null,
  // 上一次渲染时候的state
  memoizedState: any,
  // 一个列表，存放这个Fiber依赖的context
  firstContextDependency: ContextDependency<mixed> | null,
  /*
  用来描述当前Fiber和他子树的‘Bitfield’
  共存的模式表示这个子树是否默认是异步渲染的
  Fiber被创建的时候他会继承父Fiber
  其他的标识也可以在创建的时候被设置
  但是在创建之后不应该再被修改，特别是他的子Fiber创建之前
  currentMode、structMode
  */
  mode: TypeOfMode,
  // Effent
  // 用来记录Side Effect 以下的这些effect在更新的时候才会被用到，生命周期相关
  effectTag: SideEffectTag,
  // 单链表用来快速查找下一个side effect
  nextEffect: Fiber | null,
  // 子树中第一个side effect
  firstEffect: Fiber | null,
  // 子树中最后一个side effect
  lastEffect: Fiber | null,
  // 代表任务在未来的哪个时间点应该被完成
  // 不包括他的子树产生的任务
  expirationTime: ExpirationTime,
  // 快速确定子树中是否有不在等待的变化
  // 始终保存子树中最小的那个ExpirationTime
  childExpirationTime: ExpirationTime,
  /*
  在Fiber树更新的过程中，每个Fiber都会有一个跟其对应的Fiber
  我们称他为‘current<==>workInProgress(有就存放在alternate)’的对应关系
  在渲染完成之后他们会交换位置
  */  
  alternate: Fiber | null,
  // 下面是调试相关的，收集每个fiber和子树渲染的时间的
  actualDuration?: number,
  
}
````