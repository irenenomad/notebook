##### 1、什么是FiberRoot
    （1）整个应用的起点
    （2）包含应用挂载的目标节点
    （3）记录整个应用更新过程的各种新型
##### 2、包含的属性
````js
type BaseFiberRootProperties = {
  // root节点，render方法接收的第二个参数
  containerInfo: any,
  // 只有在持久更新中会用到，也就是不支持增量更新的平台，react-dom不会用到,比如说：server render
  pendingChildren: any,
  // 当前应用对应的Fiber对象，是Root Fiber，这个fiber是整个fiber树结构的顶点,
  //FiberRoot的current就是RootFiber
  current: Fiber,
  /*
  一下的优先级是用来区分
  1）没有提交（committed）的任务
  2）没有提交的挂起任务
  3）没有提交的可能被挂起的任务
  我们选择不追踪每个单独的阻塞登记，为了兼顾性能
  最老和新的在提交的时候被挂起的任务
  */
  earliestSuspendedTime: ExpirationTime,
  lastestSuspendedTime: ExpirationTime,
  //最老和新的不确定是否会挂起的优先级（所有任务进来一开始都是这个状态）
  earliestPendingTime: ExpirationTime,
  lastestPendingTime: ExpirationTime,
  // 最新的通过一个promise被resolve并且可以重新尝试的优先级
  lastestPindedTime: ExpirationTime,
  // 如果有错误被抛出并且没有更多的更新存在，我们尝试在处理错误前同步重新从头渲染
  // 在‘renderRoot’出现无法处理的错误时会被设置为‘true’
  didError: boolean,
  // 正在等待提交的任务‘ExpirationTime’
  pendingCommitExpirationTime: ExpirationTime,
  // 已经完成任务的FiberRoot对象，如果你只有一个root，那永远只可能是这个Root对应的Fiber，或者null
  // 在commit阶段只会处理这个值对应的任务
  finishedWork: Fiber || null,
  // 在任务被挂起的时候通过setTimeout设置的返回内容，用来下一次如果有新的任务挂起时清理还没触发的timeout,Suspend里面记录超时的情况的
  timeoutHandle: TimeoutHandle | NoTimeout,
  // 顶层context对象，只有主动调用‘renderSubtreeIntoContainer’时才会有用
  context: Object | null,
  pendingContext: Object | null,
  // 用来确定第一次渲染的时候是否需要融合
  +hydrate: boolean,
  // 当前root上剩余的过期时间
  // TODO: 提到render里面去处理
  // 会遍历记录整个应用当中所有节点优先级最高的ExpirationTime，如果其他节点的ExpirationTime大，说明还轮不到他执行
  nextExpirationTimeToWorkOn: ExpirationTime,
  // 当前更新对应的过期时间
  expirationTime: ExpirationTime,
  /*
  顶层批次（批处理任务？）这个变量指明一个commit是否应该被推迟
  同时包括完成之后的回调
  貌似用在测试的时候？
  */
  firstBatch: Batch | null,
  // root之间关联的链表结构
  nextScheduledRoot: FiberRoot | null,
}
````