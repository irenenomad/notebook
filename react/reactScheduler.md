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
    （4）scheduleDefferredCallback里当前任务的expirationTime是currentEventStartTime加timeout时间之和，并创建firstCallbackNode双向链表，
    之前传入的performAsyncWork方法就是每个链表节点中的callback方法，执行callback就是执行performAsyncWork方法，链表按expirationTime的优先级排序。
    （5）调用ensureHostCallbackIsScheduled方法，判断（isExecutingCallback是true还是false）是否已经执行了performSyncWork有就直接return跳出流程，没有继续
    流程，判断（isHostCallbackScheduled）HostCallback有没有进入调度，没有就设为true，有就cancel已有的hostCallback。
    （6）调用requestHostCallback方法，传入flushWork方法（firstCallbackNode节点的callback）和expirationTime即要被调度的对象，判断超时就不用等待requsetAnimationFrame
    下一帧来执行方法，立即用window.postmessage进入方法的调用。未超时就按正常的调度流程去走，没有进入循环调度的过程就把isAnimationFrameScheduled设为true调用
    requestAnimationFrameWithTimeout方法。
    （7）requestAnimationFrameWithTimeout方法传入animationTick方法，有两个方法竞争关系谁先谁调用animationTick，一个是setTimeout 100ms之内必须被调用，否则立即
    调用，一个是requestAnimationFrame方法等浏览器在开始重绘前调用。
    （8）animationTick方法主要是连续计算两个帧时间都是如果都是小于33ms的就缩小帧时间，帧时间每个平台不同，比如vr display 是120hz~90hz，所以不能超过120hz，判断平台帧时间
    刷新频率，更新ActiveFrameTime。调用window.postmessage发送以后，监听调用idleTick方法，主要判断是否还有帧时间。
    （9）调用prevscheduleCallback(didTimeout)判断是否超时强制输出。
    （10）调用flushWork方法传入didTimeout，isExecutingCallback设置为true，循环调用firstCallbackNode，并执行里面的方法，被打断finally里面会重新调用
    ensureHostCallbackIsScheduled方法。