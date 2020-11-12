##### 1、instance/index.js
````js
// vue 类，通过new实例化
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // 调用专门的初始化方法
  this._init(options)
}
// 混入init
initMixin(Vue)
// 混入state,初始化watcher
stateMixin(Vue)
// 混入event
eventsMixin(Vue)
// 混入生命周期
lifecycleMixin(Vue)
// 混入render
renderMixin(Vue)
````
##### 2、core/init.js
````js
let uid = 0

export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // a uid
    // 定义uid
    vm._uid = uid++

    let startTag, endTag
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // a flag to avoid this being observed
    vm._isVue = true
    // merge options
    // 合并options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options)
    } else {
      // 把传入的options最终都merge到vm.$options上
      // 比如说vm.$options.el或者vm.$options.data
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      // 开发环境vm._renderProxy就是vm
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    // 初始化
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate')
    initInjections(vm) // resolve injections before data/props
    initState(vm)
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }
    // 判断是否有vm.$options.el
    if (vm.$options.el) {
      // 调用vm.$mount方法做挂载
      vm.$mount(vm.$options.el)
    }
  }
}

const hasProxy =
    typeof Proxy !== 'undefined' && isNative(Proxy)


initProxy = function initProxy (vm) {
    // 判断是否支持es6 Proxy api
    if (hasProxy) {
      // determine which proxy handler to use
      // 对对象访问做一个截取
      const options = vm.$options
      const handlers = options.render && options.render._withStripped
        ? getHandler
        : hasHandler
      vm._renderProxy = new Proxy(vm, handlers)
    } else {
      vm._renderProxy = vm
    }
  }
````
##### 3、state.js
````js
export function initState (vm: Component) {
  vm._watchers = []
  const opts = vm.$options
  if (opts.props) initProps(vm, opts.props)
  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    // 初始化Data
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}

function initData (vm: Component) {
  // 从vm.$options.data拿到data
  let data = vm.$options.data
   // 除了临时变量还赋值给vm._data，判断是否是函数
  data = vm._data = typeof data === 'function'
  // 绑定this到vm
    ? getData(data, vm)
    : data || {}
  if (!isPlainObject(data)) {
    data = {}
    process.env.NODE_ENV !== 'production' && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    )
  }
  // proxy data on instance
  // 拿到data的key
  const keys = Object.keys(data)
  // 拿到vm.$options的props
  const props = vm.$options.props
  // 拿到vm.$options的methods
  const methods = vm.$options.methods
  let i = keys.length
  // 循环比较data的key不能和methods、props的key重复
  while (i--) {
    const key = keys[i]
    if (process.env.NODE_ENV !== 'production') {
      if (methods && hasOwn(methods, key)) {
        warn(
          `Method "${key}" has already been defined as a data property.`,
          vm
        )
      }
    }
    if (props && hasOwn(props, key)) {
      process.env.NODE_ENV !== 'production' && warn(
        `The data property "${key}" is already declared as a prop. ` +
        `Use prop default value instead.`,
        vm
      )
    } else if (!isReserved(key)) {
      // 做一层getter、setter、Object.defineProperty数据代理
      proxy(vm, `_data`, key)
    }
  }
  // observe data
  // 对data做响应式处理
  observe(data, true /* asRootData */)
}

export function proxy (target: Object, sourceKey: string, key: string) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
````