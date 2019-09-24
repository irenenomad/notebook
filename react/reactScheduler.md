###### 1、核心知识点：
    （1）维护时间片。
    （2）模拟requestIdleCallback。
    （3）调度列表和超时判断。
###### 2、相关概念：
    （1）requestIdleCallback回调的执行条件是当前浏览器处于空闲状态。
    （2）requestAnimationFrame浏览器在每次重绘前执行回调。
    （3）时间片，一秒至少30帧以上否则用户会觉得卡顿，一帧大概最多33ms，react渲染22ms，浏览器渲染11ms。
    （4）callbackExpirationTime全局变量，每次调用新的callback之前都会更新callbackExpirationTime。
    （5）timeout时间，是expirationTime时间减去currentMs,currentMs是当前时间减去react初始化时间的差值。
    （6）currentEventStartTime是调用getCurrentTime方法根据不同平台（rn或者dom）调用.now()方法获取当前时间。
    （7）isExecutingCallback，开始在flashWork里真正开始调用callback的时候才会被设置为true，在ensureHostCallbackIsScheduled会判断该参数是否跳出流程。
    （8）deadlineObject判断帧时间是否已经超时shouldYield，全局变量。
###### 3、流程描述：
（1）把fiber和expirationTime传入scheduleWork开始进入任务调度。
（2）调用requestWork，判断expirationTime是否等于sync，是就直接调用performSyncWork进入同步流程，否调用scheduleCallbackWithExpirationTime
进入异步调度流程（这里接下来着重讲异步调度流程）。
（3）scheduleCallbackWithExpirationTime里判断callbackExpirationTime是否等于NoWork（判断是否有旧任务已经在执行了），是就和expirationTime比较
优先级哪个高，expirationTime更小就通过callbackID把当前旧的任务cancel掉，更大就直接return跳出流程。调用scheduleDefferredCallback传入
performAsyncWork方法和timeout时间并生成新的callbackID，再更新callbackExpirationTime。
````js
function scheduleCallbackWithExpirationTime(
  root: FiberRoot,
  expirationTime: ExpirationTime,
) {
  if (callbackExpirationTime !== NoWork) {
    // A callback is already scheduled. Check its expiration time (timeout).
    if (expirationTime > callbackExpirationTime) {
      // Existing callback has sufficient timeout. Exit.
      return;
    } else {
      if (callbackID !== null) {
        // Existing callback has insufficient timeout. Cancel and schedule a
        // new one.
        cancelDeferredCallback(callbackID);
      }
    }
    // The request callback timer is already running. Don't start a new one.
  } else {
    startRequestCallbackTimer();
  }

  callbackExpirationTime = expirationTime;
  const currentMs = now() - originalStartTimeMs;
  const expirationTimeMs = expirationTimeToMs(expirationTime);
  const timeout = expirationTimeMs - currentMs;
  callbackID = scheduleDeferredCallback(performAsyncWork, {timeout});
}
````
（4）scheduleDefferredCallback里当前任务的expirationTime是currentEventStartTime加timeout时间之和，并创建firstCallbackNode双向链表，
之前传入的performAsyncWork方法就是每个链表节点中的callback方法，执行callback就是执行performAsyncWork方法，链表按expirationTime的优先级排序。
````js
(callback, deprecated_options) {
  var startTime =
    currentEventStartTime !== -1 ? currentEventStartTime : getCurrentTime();

  var expirationTime;
  if (
    typeof deprecated_options === 'object' &&
    deprecated_options !== null &&
    typeof deprecated_options.timeout === 'number'
  ) {
    // FIXME: Remove this branch once we lift expiration times out of React.
    expirationTime = startTime + deprecated_options.timeout;
  } else {
    switch (currentPriorityLevel) {
      case ImmediatePriority:
        expirationTime = startTime + IMMEDIATE_PRIORITY_TIMEOUT;
        break;
      case UserBlockingPriority:
        expirationTime = startTime + USER_BLOCKING_PRIORITY;
        break;
      case IdlePriority:
        expirationTime = startTime + IDLE_PRIORITY;
        break;
      case NormalPriority:
      default:
        expirationTime = startTime + NORMAL_PRIORITY_TIMEOUT;
    }
  }

  var newNode = {
    callback,
    priorityLevel: currentPriorityLevel,
    expirationTime,
    next: null,
    previous: null,
  };

  // Insert the new callback into the list, ordered first by expiration, then
  // by insertion. So the new callback is inserted any other callback with
  // equal expiration.
  // 维护的单向环状链表的头部
  if (firstCallbackNode === null) {
    // This is the first callback in the list.
    firstCallbackNode = newNode.next = newNode.previous = newNode;
    ensureHostCallbackIsScheduled();
  } else {
    // 不是空的链表，也就是有多个，会循环比较expirationTime进行排序，把优先级最高的放在最前面
    var next = null;
    var node = firstCallbackNode;
    do {
      if (node.expirationTime > expirationTime) {
        // The new callback expires before this one.
        next = node;
        break;
      }
      node = node.next;
    } while (node !== firstCallbackNode);

    if (next === null) {
      // No callback with a later expiration was found, which means the new
      // callback has the latest expiration in the list.
      // 新的callback是list里面优先级最低的
      next = firstCallbackNode;
    } else if (next === firstCallbackNode) {
      // The new callback has the earliest expiration in the entire list.
      // 新的callback是list里面优先级最高的
      firstCallbackNode = newNode;
      ensureHostCallbackIsScheduled();
    }
    // 把新的callback插入比他优先级低的node之前
    var previous = next.previous;
    previous.next = next.previous = newNode;
    newNode.next = next;
    newNode.previous = previous;
  }

  return newNode;
}

````
（5）调用ensureHostCallbackIsScheduled方法，判断（isExecutingCallback是true还是false）是否已经执行了performSyncWork有就直接return跳出流程，没有继续
流程，判断（isHostCallbackScheduled）HostCallback有没有进入调度，没有就设为true，有就cancel已有的hostCallback。
````js
function flushFirstCallback() {
  var flushedNode = firstCallbackNode;

  // Remove the node from the list before calling the callback. That way the
  // list is in a consistent state even if the callback throws.
  var next = firstCallbackNode.next;
  if (firstCallbackNode === next) {
    // This is the last callback in the list.
    firstCallbackNode = null;
    next = null;
  } else {
    var lastCallbackNode = firstCallbackNode.previous;
    firstCallbackNode = lastCallbackNode.next = next;
    next.previous = lastCallbackNode;
  }

  flushedNode.next = flushedNode.previous = null;

  // Now it's safe to call the callback.
  var callback = flushedNode.callback;
  var expirationTime = flushedNode.expirationTime;
  var priorityLevel = flushedNode.priorityLevel;
  var previousPriorityLevel = currentPriorityLevel;
  var previousExpirationTime = currentExpirationTime;
  currentPriorityLevel = priorityLevel;
  currentExpirationTime = expirationTime;
  var continuationCallback;
  try {
    continuationCallback = callback(deadlineObject);
  } finally {
    currentPriorityLevel = previousPriorityLevel;
    currentExpirationTime = previousExpirationTime;
  }

  // A callback may return a continuation. The continuation should be scheduled
  // with the same priority and expiration as the just-finished callback.
  if (typeof continuationCallback === 'function') {
    var continuationNode: CallbackNode = {
      callback: continuationCallback,
      priorityLevel,
      expirationTime,
      next: null,
      previous: null,
    };

    // Insert the new callback into the list, sorted by its expiration. This is
    // almost the same as the code in `scheduleCallback`, except the callback
    // is inserted into the list *before* callbacks of equal expiration instead
    // of after.
    if (firstCallbackNode === null) {
      // This is the first callback in the list.
      firstCallbackNode = continuationNode.next = continuationNode.previous = continuationNode;
    } else {
      var nextAfterContinuation = null;
      var node = firstCallbackNode;
      do {
        if (node.expirationTime >= expirationTime) {
          // This callback expires at or after the continuation. We will insert
          // the continuation *before* this callback.
          nextAfterContinuation = node;
          break;
        }
        node = node.next;
      } while (node !== firstCallbackNode);

      if (nextAfterContinuation === null) {
        // No equal or lower priority callback was found, which means the new
        // callback is the lowest priority callback in the list.
        nextAfterContinuation = firstCallbackNode;
      } else if (nextAfterContinuation === firstCallbackNode) {
        // The new callback is the highest priority callback in the list.
        firstCallbackNode = continuationNode;
        ensureHostCallbackIsScheduled();
      }

      var previous = nextAfterContinuation.previous;
      previous.next = nextAfterContinuation.previous = continuationNode;
      continuationNode.next = nextAfterContinuation;
      continuationNode.previous = previous;
    }
  }
}

function flushImmediateWork() {
  if (
    // Confirm we've exited the outer most event handler
    currentEventStartTime === -1 &&
    firstCallbackNode !== null &&
    firstCallbackNode.priorityLevel === ImmediatePriority
  ) {
    isExecutingCallback = true;
    deadlineObject.didTimeout = true;
    try {
      do {
        flushFirstCallback();
      } while (
        // Keep flushing until there are no more immediate callbacks
        firstCallbackNode !== null &&
        firstCallbackNode.priorityLevel === ImmediatePriority
      );
    } finally {
      isExecutingCallback = false;
      if (firstCallbackNode !== null) {
        // There's still work remaining. Request another callback.
        ensureHostCallbackIsScheduled();
      } else {
        isHostCallbackScheduled = false;
      }
    }
  }
}

function flushWork(didTimeout) {
  isExecutingCallback = true;
  deadlineObject.didTimeout = didTimeout;
  try {
    if (didTimeout) {
      // Flush all the expired callbacks without yielding.
      while (firstCallbackNode !== null) {
        // Read the current time. Flush all the callbacks that expire at or
        // earlier than that time. Then read the current time again and repeat.
        // This optimizes for as few performance.now calls as possible.
        var currentTime = getCurrentTime();
        if (firstCallbackNode.expirationTime <= currentTime) {
          do {
            flushFirstCallback();
          } while (
            firstCallbackNode !== null &&
            firstCallbackNode.expirationTime <= currentTime
          );
          continue;
        }
        break;
      }
    } else {
      // Keep flushing callbacks until we run out of time in the frame.
      if (firstCallbackNode !== null) {
        do {
          flushFirstCallback();
        } while (
          firstCallbackNode !== null &&
          getFrameDeadline() - getCurrentTime() > 0
        );
      }
    }
  } finally {
    isExecutingCallback = false;
    if (firstCallbackNode !== null) {
      // There's still work remaining. Request another callback.
      ensureHostCallbackIsScheduled();
    } else {
      isHostCallbackScheduled = false;
    }
    // Before exiting, flush all the immediate work that was scheduled.
    flushImmediateWork();
  }
}
function ensureHostCallbackIsScheduled() {
  if (isExecutingCallback) {
    // Don't schedule work yet; wait until the next time we yield.
    return;
  }
  // Schedule the host callback using the earliest expiration in the list.
  var expirationTime = firstCallbackNode.expirationTime;
  if (!isHostCallbackScheduled) {
    isHostCallbackScheduled = true;
  } else {
    // Cancel the existing host callback.
    cancelHostCallback();
  }
  requestHostCallback(flushWork, expirationTime);
}

````
（6）调用requestHostCallback方法，传入flushWork方法和expirationTime即要被调度的对象，判断超时就不用等待requsetAnimationFrame
下一帧来执行方法，立即用window.postmessage进入方法的调用。未超时就按正常的调度流程去走，没有进入循环调度的过程就把isAnimationFrameScheduled设为true调用
requestAnimationFrameWithTimeout方法。
````js
  requestHostCallback = function(callback, absoluteTimeout) {
  //接下去要被调度的方法和要用到的时间
    scheduledHostCallback = callback;
    timeoutTime = absoluteTimeout;
                                  //小于0说明已经超时了
    if (isFlushingHostCallback || absoluteTimeout < 0) {
      // Don't wait for the next frame. Continue working ASAP, in a new event.
      // 无需等待立下一帧即进入调度
      window.postMessage(messageKey, '*');
    } else if (!isAnimationFrameScheduled) {
      // If rAF didn't already schedule one, we need to schedule a frame.
      // TODO: If this rAF doesn't materialize because the browser throttles, we
      // might want to still have setTimeout trigger rIC as a backup to ensure
      // that we keep performing work.
      isAnimationFrameScheduled = true;
      requestAnimationFrameWithTimeout(animationTick);
    }
  };
````
（7）requestAnimationFrameWithTimeout方法传入animationTick方法，有两个方法竞争关系谁先谁调用animationTick，一个是setTimeout 100ms之内必须被调用，否则立即
调用，一个是requestAnimationFrame方法等浏览器在开始重绘前调用。
````js
var requestAnimationFrameWithTimeout = function(callback) {
  // schedule rAF and also a setTimeout
  rAFID = localRequestAnimationFrame(function(timestamp) {
    // cancel the setTimeout
    localClearTimeout(rAFTimeoutID);
    callback(timestamp);
  });
  rAFTimeoutID = localSetTimeout(function() {
    // cancel the requestAnimationFrame
    localCancelAnimationFrame(rAFID);
    callback(getCurrentTime());
  }, ANIMATION_FRAME_TIMEOUT);
};
var animationTick = function(rafTime) {
    if (scheduledHostCallback !== null) {
      // Eagerly schedule the next animation callback at the beginning of the
      // frame. If the scheduler queue is not empty at the end of the frame, it
      // will continue flushing inside that callback. If the queue *is* empty,
      // then it will exit immediately. Posting the callback at the start of the
      // frame ensures it's fired within the earliest possible frame. If we
      // waited until the end of the frame to post the callback, we risk the
      // browser skipping a frame and not firing the callback until the frame
      // after that.
      requestAnimationFrameWithTimeout(animationTick);
    } else {
      // No pending work. Exit.
      isAnimationFrameScheduled = false;
      return;
    }

    var nextFrameTime = rafTime - frameDeadline + activeFrameTime;
    if (
      nextFrameTime < activeFrameTime &&
      previousFrameTime < activeFrameTime
    ) {
      if (nextFrameTime < 8) {
        // Defensive coding. We don't support higher frame rates than 120hz.
        // If the calculated frame time gets lower than 8, it is probably a bug.
        nextFrameTime = 8;
      }
      // If one frame goes long, then the next one can be short to catch up.
      // If two frames are short in a row, then that's an indication that we
      // actually have a higher frame rate than what we're currently optimizing.
      // We adjust our heuristic dynamically accordingly. For example, if we're
      // running on 120hz display or 90hz VR display.
      // Take the max of the two in case one of them was an anomaly due to
      // missed frame deadlines.
      activeFrameTime =
        nextFrameTime < previousFrameTime ? previousFrameTime : nextFrameTime;
    } else {
      previousFrameTime = nextFrameTime;
    }
    frameDeadline = rafTime + activeFrameTime;
    if (!isMessageEventScheduled) {
      isMessageEventScheduled = true;
      window.postMessage(messageKey, '*');
    }
  };

````
（8）animationTick方法主要是连续计算两个帧时间都是如果都是小于33ms的就缩小帧时间，帧时间每个平台不同，比如vr display 是120hz~90hz，所以不能超过120hz，判断平台帧时间
刷新频率，更新ActiveFrameTime。调用window.postmessage发送以后，监听调用idleTick方法，主要判断是否还有帧时间。
（9）调用prevscheduleCallback(didTimeout)判断是否超时强制输出。

（10）调用flushWork方法传入didTimeout，isExecutingCallback设置为true，循环调用firstCallbackNode，并执行里面的方法，被打断finally里面会重新调用
ensureHostCallbackIsScheduled方法。
````js
var idleTick = function(event) {
    if (event.source !== window || event.data !== messageKey) {
      return;
    }

    isMessageEventScheduled = false;

    var prevScheduledCallback = scheduledHostCallback;
    var prevTimeoutTime = timeoutTime;
    scheduledHostCallback = null;
    timeoutTime = -1;

    var currentTime = getCurrentTime();

    var didTimeout = false;
    if (frameDeadline - currentTime <= 0) {
      // There's no time left in this idle period. Check if the callback has
      // a timeout and whether it's been exceeded.
      if (prevTimeoutTime !== -1 && prevTimeoutTime <= currentTime) {
        // Exceeded the timeout. Invoke the callback even though there's no
        // time left.
        didTimeout = true;
      } else {
        // No timeout.
        if (!isAnimationFrameScheduled) {
          // Schedule another animation callback so we retry later.
          isAnimationFrameScheduled = true;
          requestAnimationFrameWithTimeout(animationTick);
        }
        // Exit without invoking the callback.
        scheduledHostCallback = prevScheduledCallback;
        timeoutTime = prevTimeoutTime;
        return;
      }
    }

    if (prevScheduledCallback !== null) {
      isFlushingHostCallback = true;
      try {
        prevScheduledCallback(didTimeout);
      } finally {
        isFlushingHostCallback = false;
      }
    }
  };
window.addEventListener('message', idleTick, false);
````