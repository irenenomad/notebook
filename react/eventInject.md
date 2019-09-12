###### 1、平台插件注入（ReactDOMClientInjection.js,定义好按顺序注入否则会出现问题)
    （1）确定插件注入顺序
    （2）注入插件模块
    （3）计算registrationNameModules等属性
###### 2、react自己的change事件（ChangeEventPlugin.js) 
    （1）使用react的change事件时用onChange是冒泡阶段触发，onChangeCapture是捕获阶段触发。
    （2）绑定react的change事件等于是同时在元素上绑定了 TOP_BLUR,TOP_CHANGE,TOP_CLICK,TOP_FOCUS,TOP_INPUT,TOP_KEY_DOWN,TOP_KEY_UP,TOP_SELECTION_CHANGE,这些事件。
    （3）SimpleEventPlug.js也是通过type[key]遍历所有事件的list
````js
const eventTypes = {
  change: {
    phasedRegistrationNames: {
      bubbled: 'onChange',
      captured: 'onChangeCapture',
    },
    dependencies: [
      TOP_BLUR,
      TOP_CHANGE,
      TOP_CLICK,
      TOP_FOCUS,
      TOP_INPUT,
      TOP_KEY_DOWN,
      TOP_KEY_UP,
      TOP_SELECTION_CHANGE,
    ],
  },
};
````  
###### 3、publishRegistrationName 把动态维护好的几个参数export出去以便之后使用。
````js
// { change: ChangeEventPlugin.eventType.onChange }
 eventNameDispatchConfigs[eventName] = dispatchConfig;
  // { bubbled: 'onChange',captured: 'onChangeCapture' }
  const phasedRegistrationNames = dispatchConfig.phasedRegistrationNames;
  // bubbled
  if (phasedRegistrationNas {
    // onChange
    for (const phaseName in phasedRegistrationNames) {
      if (phasedRegistrationNames.hasOwnProperty(phaseName)) {
        const phasedRegistrationName = phasedRegistrationNames[phaseName];
        publishRegistrationName(
          phasedRegistrationName, //onChange
          pluginModule, // ChangeEventPlugin
          eventName,  // change
        );
      }
    }
    return true;
  } else if (dispatchConfig.registrationName) {
    publishRegistrationName(
      dispatchConfig.registrationName,
      pluginModule,
      eventName,
    );
    return true;
  }
```` 
````js
function publishRegistrationName(
  registrationName: string,
  pluginModule: PluginModule<AnyNativeEvent>,
  eventName: string,
): void {
  invariant(
    !registrationNameModules[registrationName],
    'EventPluginHub: More than one plugin attempted to publish the same ' +
      'registration name, `%s`.',
    registrationName,
  );
  // onChange: ChangeEventPlugin
  registrationNameModules[registrationName] = pluginModule;
  // onChange: [TOP_BLUR ...]
  registrationNameDependencies[registrationName] =
    pluginModule.eventTypes[eventName].dependencies;

  if (__DEV__) {
    const lowerCasedName = registrationName.toLowerCase();
    possibleRegistrationNames[lowerCasedName] = registrationName;

    if (registrationName === 'onDoubleClick') {
      possibleRegistrationNames.ondblclick = registrationName;
    }
  }
}

/**
 * Registers plugins so that they can extract and dispatch events.
 *
 * @see {EventPluginHub}
 */

/**
 * Ordered list of injected plugins.
 */
export const plugins = [];

/**
 * Mapping from event name to dispatch config
 */
export const eventNameDispatchConfigs = {};

/**
 * Mapping from registration name to plugin module
 */
export const registrationNameModules = {};

/**
 * Mapping from registration name to event name
 */
export const registrationNameDependencies = {};
````