##### 1、什么是Update
    （1）用于记录组件状态的改变
    （2）存放于UpdateQueue中
    （3）多个Update可以同时存在（比如说一个监听事件里有三个setState就有三个update,等三个update执行完了，才会更新页面）
##### 2、Update包含的属性
````js
type Update<State> = {
  // 代表任务在未来的哪个时间点应该被完成
  // 更新的过期时间
  expirationTime: ExpirationTime,
  /*
  export const UpdateState = 0;
  export const ReplaceState = 1;
  export const ForceUpdate = 2;
  export const CaptureUpdate = 3;如果渲染出错被捕获就会生成一个新的update
  指定更新的类型，值为以上几种
  */
  tag: 0|1|2|3,
  // 更新内容，比如‘setState’接收的第一个参数
  payload: any,
  // 对应的回调，‘setState’，‘render’都有
  callback: (() => mixed) | null,
  // 指向下一个更新
  next: Update<State> | null,
  // 指向下一个‘side effect’
  nextEffect: Update<State> | null,
  
  
}
````
##### 3、UpdateQueue包含的属性
````js
type UpdateQueue<State> = {
  // 每次操作完更新之后的‘state’
  baseState: State,
  // 队列中的第一个‘Update’
  firstUpdate: Update<State> | null,
  // 队列中的最后一个‘Update’
  lastUpdate: Update<State> | null,
  // 第一个捕获类型的‘Update’
  firstCapturedUpdate: Update<State> | null,
  // 最后一个捕获类型的'Update'
  lastCapturedUpdate: Update<State> | null,
  // 第一个'side effect'
  firstEffect: Update<State> | null,
  // 最后一个'side effect'
  lastEffect: Update<State> | null,
}
````    