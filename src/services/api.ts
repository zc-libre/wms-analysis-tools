import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 可以在这里添加 token
    // if (localStorage.getItem('token')) {
    //   config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`
    // }
    return config
  },
  (error) => {
    console.error('请求出错：', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    
    // 根据自己的业务逻辑处理响应
    if (res.code !== 0 && res.code !== 200) {
      console.error('接口返回错误：', res.message || '未知错误')
      
      // 可以在这里处理一些特殊的错误码，比如 token 过期
      // if (res.code === 401) {
      //   // 清除用户信息并跳转到登录页
      // }
      
      return Promise.reject(new Error(res.message || '未知错误'))
    } else {
      return res
    }
  },
  (error) => {
    console.error('响应出错：', error)
    return Promise.reject(error)
  }
)

// 封装 GET 请求
export function get<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
  return service.get(url, { params, ...config }).then(res => res.data)
}

// 封装 POST 请求
export function post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return service.post(url, data, config).then(res => res.data)
}

// 封装 PUT 请求
export function put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return service.put(url, data, config).then(res => res.data)
}

// 封装 DELETE 请求
export function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return service.delete(url, config).then(res => res.data)
}

export default service 