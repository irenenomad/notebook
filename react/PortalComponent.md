````js
// beginWork
function updatePortalComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  renderExpirationTime: ExpirationTime,
) {
                                    // 单独的挂载点 
  pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
  const nextChildren = workInProgress.pendingProps;
  if (current === null) {
    // Portals are special because we don't append the children during mount
    // but at commit. Therefore we need to track insertions which the normal
    // flow doesn't do during mount. This doesn't happen at the root because
    // the root always starts with a "current" with a null child.
    // TODO: Consider unifying this with how the root works.
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderExpirationTime,
    );
  } else {
    reconcileChildren(
      current,
      workInProgress,
      nextChildren,
      renderExpirationTime,
    );
  }
  return workInProgress.child;
}

function reconcileSinglePortal(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    portal: ReactPortal,
    expirationTime: ExpirationTime,
  ): Fiber {
    const key = portal.key;
    let child = currentFirstChild;
    while (child !== null) {
      // TODO: If key === null and child.key === null, then this only applies to
      // the first item in the list.
      if (child.key === key) {
        // 多一个比较渲染的节点是否有变化
        // 如果条件都符合，就说明这个老的节点是可以被复用的
        if (
          child.tag === HostPortal &&
          child.stateNode.containerInfo === portal.containerInfo &&
          child.stateNode.implementation === portal.implementation
        ) {
          // 可以复用就把其他的老节点都删掉
          deleteRemainingChildren(returnFiber, child.sibling);
          const existing = useFiber(
            child,
            portal.children || [],
            expirationTime,
          );
          existing.return = returnFiber;
          return existing;
        } else {
          deleteRemainingChildren(returnFiber, child);
          break;
        }
      } else {
        // 不能复用就把当前节点删除，继续比较下一个节点
        deleteChild(returnFiber, child);
      }
      child = child.sibling;
    }
    // 所有节点都不可以复用就直接createFiberFromPortal创建fiber对象
    const created = createFiberFromPortal(
      portal,
      returnFiber.mode,
      expirationTime,
    );
    created.return = returnFiber;
    return created;
  }
  
export function createPortal(
  children: ReactNodeList,
  containerInfo: any,// 具体的dom节点
  // TODO: figure out the API for cross-renderer implementation.
  implementation: any,
  key: ?string = null,
): ReactPortal {
  return {
    // This tag allow us to uniquely identify this as a React Portal
    $$typeof: REACT_PORTAL_TYPE,
    key: key == null ? null : '' + key,
    children,
    containerInfo,
    implementation,
  };
}
// 类似reactElement对象
function createPortal(
  children: ReactNodeList,
  container: DOMContainer,// 具体的dom节点
  key: ?string = null,
) {
  invariant(
    isValidContainer(container),
    'Target container is not a DOM element.',
  );
  // TODO: pass ReactDOM portal implementation as third argument
  return ReactPortal.createPortal(children, container, null, key);
}
````