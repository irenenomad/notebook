##### 1、核心：
    （1）是否有deadline的区分。
    （2）循环渲染Root的条件。
    （3）超过时间片的处理。
##### 2、基本流程
````js
export function didExpireAtExpirationTime(
  root: FiberRoot,
  currentTime: ExpirationTime,
): void {
  const expirationTime = root.expirationTime;
  if (expirationTime !== NoWork && currentTime >= expirationTime) {
    // The root has expired. Flush all work up to the current time.
    // 判断root.expirationTime是否有过期，过期就更新成currentTime
    root.nextExpirationTimeToWorkOn = currentTime;
  }
}
function performAsyncWork(dl) {
  if (dl.didTimeout) {
    // The callback timed out. That means at least one update has expired.
    // Iterate through the root schedule. If they contain expired work, set
    // the next render expiration time to the current time. This has the effect
    // of flushing all expired work in a single batch, instead of flushing each
    // level one at a time.
    if (firstScheduledRoot !== null) {
      // 计时相关的操作
      recomputeCurrentRendererTime();
      let root: FiberRoot = firstScheduledRoot;
      do {
        // 标记root节点的一些变量
        didExpireAtExpirationTime(root, currentRendererTime);
        // The root schedule is circular, so this is never null.
        // 循环执行环状链表
        root = (root.nextScheduledRoot: any);
      } while (root !== firstScheduledRoot);
    }
  }
  performWork(NoWork, dl);
}
````
````js
function performWorkOnRoot(
  root: FiberRoot,
  expirationTime: ExpirationTime,
  isExpired: boolean,
) {
  invariant(
    !isRendering,
    'performWorkOnRoot was called recursively. This error is likely caused ' +
      'by a bug in React. Please file an issue.',
  );

  isRendering = true;

  // Check if this is async work or sync/expired work.
  // 判断是同步或者过期就执行以下代码isYieldy = false，这个两个条件下不能被打断
  if (deadline === null || isExpired) {
    // Flush work without yielding.
    // TODO: Non-yieldy work does not necessarily imply expired work. A renderer
    // may want to perform some work without yielding, but also without
    // requiring the root to complete (by triggering placeholders).

    let finishedWork = root.finishedWork;
    if (finishedWork !== null) {
      // This root is already complete. We can commit it.
      // 已经完成渲染，赶紧提交，不然会丢失
      completeRoot(root, finishedWork, expirationTime);
    } else {
      root.finishedWork = null;
      // If this root previously suspended, clear its existing timeout, since
      // we're about to try rendering again.
      const timeoutHandle = root.timeoutHandle;
      if (timeoutHandle !== noTimeout) {
        root.timeoutHandle = noTimeout;
        // $FlowFixMe Complains noTimeout is not a TimeoutID, despite the check above
        cancelTimeout(timeoutHandle);
      }
      // 不能被打断
      const isYieldy = false;
      renderRoot(root, isYieldy, isExpired);
      finishedWork = root.finishedWork;
      if (finishedWork !== null) {
        // We've completed the root. Commit it.
        completeRoot(root, finishedWork, expirationTime);
      }
    }
  } else {
    // Flush async work.
    // 判断是异步就执行以下代码isYieldy = true，这个条件下可以被打断
    let finishedWork = root.finishedWork;
    if (finishedWork !== null) {
      // This root is already complete. We can commit it.
      completeRoot(root, finishedWork, expirationTime);
    } else {
      root.finishedWork = null;
      // If this root previously suspended, clear its existing timeout, since
      // we're about to try rendering again.
      const timeoutHandle = root.timeoutHandle;
      if (timeoutHandle !== noTimeout) {
        root.timeoutHandle = noTimeout;
        // $FlowFixMe Complains noTimeout is not a TimeoutID, despite the check above
        cancelTimeout(timeoutHandle);
      }
      const isYieldy = true;
      renderRoot(root, isYieldy, isExpired);
      finishedWork = root.finishedWork;
      if (finishedWork !== null) {
        // We've completed the root. Check the deadline one more time
        // before committing.
        // 已经完成root渲染判断是否还有时间片时间
        if (!shouldYield()) {
          // Still time left. Commit the root.
          // 有时间就直接提交
          completeRoot(root, finishedWork, expirationTime);
        } else {
          // There's no time left. Mark this root as complete. We'll come
          // back and commit it later.
          // 没有时间就暂时赋值给root.finishedWork，下次再来提交
          root.finishedWork = finishedWork;
        }
      }
    }
  }

  isRendering = false;
}

function performWork(minExpirationTime: ExpirationTime, dl: Deadline | null) {
  deadline = dl;

  // Keep working on roots until there's no more work, or until we reach
  // the deadline.
  // 找的优先级最高的root节点
  findHighestPriorityRoot();

  if (deadline !== null) {
    recomputeCurrentRendererTime();
    currentSchedulerTime = currentRendererTime;

    if (enableUserTimingAPI) {
      const didExpire = nextFlushedExpirationTime < currentRendererTime;
      const timeout = expirationTimeToMs(nextFlushedExpirationTime);
      stopRequestCallbackTimer(didExpire, timeout);
    }
    while (
      nextFlushedRoot !== null &&
      nextFlushedExpirationTime !== NoWork &&
      (minExpirationTime === NoWork ||
        minExpirationTime >= nextFlushedExpirationTime) &&
      (!deadlineDidExpire || currentRendererTime >= nextFlushedExpirationTime)
    ) {
      // 异步执行的情况
      performWorkOnRoot(
        nextFlushedRoot,
        nextFlushedExpirationTime,
        currentRendererTime >= nextFlushedExpirationTime,
      );
      // 找下一个优先级最高的root节点
      findHighestPriorityRoot();
      // 重新计算并赋值RendererTime
      recomputeCurrentRendererTime();
      currentSchedulerTime = currentRendererTime;
    }
  } else {
    while (
      nextFlushedRoot !== null &&
      nextFlushedExpirationTime !== NoWork &&
      (minExpirationTime === NoWork ||
        minExpirationTime >= nextFlushedExpirationTime)
    ) {
      // 同步执行的情况
      performWorkOnRoot(nextFlushedRoot, nextFlushedExpirationTime, true);
      // 找下一个优先级最高的root节点
      findHighestPriorityRoot();
    }
  }

  // We're done flushing work. Either we ran out of time in this callback,
  // or there's no more work left with sufficient priority.

  // If we're inside a callback, set this to false since we just completed it.
  if (deadline !== null) {
    callbackExpirationTime = NoWork;
    callbackID = null;
  }
  // If there's work left over, schedule a new callback.
  if (nextFlushedExpirationTime !== NoWork) {
    scheduleCallbackWithExpirationTime(
      ((nextFlushedRoot: any): FiberRoot),
      nextFlushedExpirationTime,
    );
  }

  // Clean-up.
  deadline = null;
  deadlineDidExpire = false;

  finishRendering();

````