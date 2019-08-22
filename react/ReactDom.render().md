1、主要步驟：
（1）創建ReactRoot
（2）創建FiberRoot和RootFiber
（3）創建更新creatUpdate
2、涉及概念：
（1）hydrate用于服務端渲染的方法，react通過判斷dom節點下是否有子節點和rootElement是否有加data-reactroot屬性來決定是否shouldHydrate。
（2）DomRenderer即react-reconciler包是用於和平臺無關的，代码的调和和调度的工作。
（3）update是react用于标记需要更新的地点，由createUpdate创建再放入enqueueUpate。
3、流程：
（1）判断是否是服务端渲染（这里主流程不用去管服务端渲染，只描述正常流程），shouldHydrate是false所有之前创建的dom节点全部删除。
（2）调用ReactRoot构造函数，创建ReactRoot，相关参数如下：
        最开始传入的dom节点；
        创建root不用同步async是false；
        服务端渲染是false；
（3）调用DomRenderer.createContainer函数再调用createFiberRoot创建FiberRoot。
（4）调用DomRenderer.updateContainer函数传入<app/>和FiberRoot以及callback，相关步骤如下：
        计算expirationTime；
        再调用scheduleRootUpdate相关步骤如下：
            调用createUpdate创建update；
            把一开render传入的ReactNodeList赋值给update.payload,callback赋值给update.callback;
            把update放入enqueueUpdate；
            最后根据expirationTime开始分优先级任务调度（scheduleWork）；




