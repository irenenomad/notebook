###### 1、核心：
    （1）给节点的fiber创建更新
    （2）更新的类型不同
###### 2、相关概念：
    （1）ReactInstanceMap是一个用来获取fiber对象的映射。
    （2）inst是this.setState的this的指向的classComponent实例。
###### 3、流程描述：
    （1）classComponent实例化初始化拿到classComponentUpdate对象。
    （2）进入classComponentUpdate对象里面的enqueuesetState或enqueueForceUpdate方法（两者流程相同，唯一区别是ForceUpdate的update.tag等于ForceUpdate）。
    （3）通过ReactInstanceMap.get(inst)来获取fiber对象。
    （4）获取currentTime。
    （5）通过fiber和currentTime计算expirationTime。
    （6）通过createUpdate传入的expirationTime创建update。
    （7）把setState里的对象数据赋值给update.payload,把setState里的callback赋值给update.callback。
    （8）把fiber和update放入enqueueUpdate。
    （9）把fiber和expirationTime传入scheduleWork开始进入任务调度。
