##### 1、updateMemoComponent主要用来对比新老props是否有变化，跳过一些更新，本身没有什么意义。
    （1）current辨别组件是第一次渲染还是非第一次渲染；
````js
export default function memo<Props>(
  type: React$ElementType,
  compare?: (oldProps: Props, newProps: Props) => boolean,//比较前后props的差异
) {
  if (__DEV__) {
    if (!isValidElementType(type)) {
      warningWithoutStack(
        false,
        'memo: The first argument must be a component. Instead ' +
          'received: %s',
        type === null ? 'null' : typeof type,
      );
    }
  }
  return {
    $$typeof: REACT_MEMO_TYPE,//是第一次渲染就会用这个参数判断组件的类型
    type,
    compare: compare === undefined ? null : compare,
  };
}
````
##### 2、updateSimpleMemoComponent
    （1）浅比较老的props和新的props看看是否有变化，没有就直接调用bailoutOnAlreadyFinishWork跳过更新
    （2）有变化就调用updateFunctionComponent更新
````js
function updateSimpleMemoComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: any,
  nextProps: any,
  updateExpirationTime,
  renderExpirationTime: ExpirationTime,
): null | Fiber {
  if (
    current !== null &&
    (updateExpirationTime === NoWork ||
      updateExpirationTime > renderExpirationTime)
  ) {
    const prevProps = current.memoizedProps;
    if (
      shallowEqual(prevProps, nextProps) &&
      current.ref === workInProgress.ref
    ) {
      return bailoutOnAlreadyFinishedWork(
        current,
        workInProgress,
        renderExpirationTime,
      );
    }
  }
  return updateFunctionComponent(
    current,
    workInProgress,
    Component,
    nextProps,
    renderExpirationTime,
  );
}
````
##### 3、createFiberFromTypeAndProps
##### 4、createWorkInProgress