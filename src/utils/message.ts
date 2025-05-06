import { ElMessage, type MessageParamsWithType } from 'element-plus';

// 定义一个统一的消息显示函数
export const showMessage = (options: MessageParamsWithType | string) => {
  // 初始化以解决 linter 问题
  let messageOptions: MessageParamsWithType | null = null; // 初始化为 null

  if (typeof options === 'string') {
    messageOptions = {
      // 不再需要展开空的 messageOptions
      message: options,
      type: 'info', // 默认类型
    } as MessageParamsWithType; // 断言具体类型
  } else if (options && typeof options === 'object') {
    messageOptions = options;
  }

  // 核心：强制将消息挂载到 document.body
  if (messageOptions) { // 确保 messageOptions 有效
    // 这有助于避免父元素层叠上下文或样式造成的定位问题
    // 使用 any 类型断言绕过顽固的类型检查
    (messageOptions as any).appendTo = document.body;

    // 调用原始的 ElMessage
    return ElMessage(messageOptions);
  } else {
    // 处理无效 options 的情况
    console.error('Invalid options passed to showMessage:', options);
    // 返回一个被拒绝的 Promise 可能更符合 ElMessage 的行为
    return Promise.reject('Invalid options'); 
  }
};

// 为常用类型创建快捷方式
export const showSuccessMessage = (message: string) => showMessage({ type: 'success', message });
export const showWarningMessage = (message: string) => showMessage({ type: 'warning', message });
export const showInfoMessage = (message: string) => showMessage({ type: 'info', message });
export const showErrorMessage = (message: string) => showMessage({ type: 'error', message });

// 也可以导出一个包含所有方法的对象，方便挂载
export const messageUtil = {
  show: showMessage,
  success: showSuccessMessage,
  warning: showWarningMessage,
  info: showInfoMessage,
  error: showErrorMessage,
}; 