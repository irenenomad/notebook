````js
case FunctionComponent: {
      // 组件名或者dom原生元素
      const Component = workInProgress.type;
      // 新的一次渲染的时候产生的props
      const unresolvedProps = workInProgress.pendingProps;
      // 跟suspend组件相关
      const resolvedProps =
        workInProgress.elementType === Component
          ? unresolvedProps
          : resolveDefaultProps(Component, unresolvedProps);
      return updateFunctionComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderExpirationTime,
      );
    }
````
````js
function updateFunctionComponent(
  current,
  workInProgress,
  Component,
  nextProps: any,
  renderExpirationTime,
) {
  const unmaskedContext = getUnmaskedContext(workInProgress, Component, true);
  const context = getMaskedContext(workInProgress, unmaskedContext);

  let nextChildren;
  prepareToReadContext(workInProgress, renderExpirationTime);
  if (__DEV__) {
    ReactCurrentOwner.current = workInProgress;
    ReactCurrentFiber.setCurrentPhase('render');
    nextChildren = Component(nextProps, context);
    ReactCurrentFiber.setCurrentPhase(null);
  } else {
    // Component 就是那个组件的方法
    // 渲染出那个ReactElement节点赋值给nextChildren
    nextChildren = Component(nextProps, context);
  }

  // React DevTools reads this flag.
  workInProgress.effectTag |= PerformedWork;
  // 把ReactElement变成fiber对象并挂载child属性
  reconcileChildren(
    current,
    workInProgress,
    nextChildren,
    renderExpirationTime,
  );
  return workInProgress.child;
}
````