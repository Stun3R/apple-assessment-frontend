import axios from 'axios'
import defu from 'defu'

const defaults = {
  url: process.env.REACT_APP_API || 'http://localhost:1337',
  axiosOptions: {},
}

export default class API {
  /**
   * API constructor
   *
   * @constructor
   * @param {string} options.url? - API URL
   * @param {AxiosRequestConfig} options.axiosOptions? - Axios custom config
   */
  constructor(options) {
    this.options = defu(options || {}, defaults)

    this.axios = axios.create({
      baseURL: this.options.url,
      ...this.options.axiosOptions,
    })
  }

  /**
   * Basic axios request
   *
   * @param  {Method} method - HTTP method
   * @param  {string} url - API URL
   * @param  {AxiosRequestConfig} axiosConfig? - Custom Axios config
   * @returns Promise
   */
  async request(method, url, axiosConfig = {}) {
    try {
      const response = await this.axios.request({
        method,
        url,
        ...axiosConfig,
      })
      return response.data
    } catch (err) {
      if (!err.response) {
        throw new Error('Something went wrong')
      } else {
        throw new Error(err.response.data.detail)
      }
    }
  }

  /**
   * Get a list of {entity} entries
   *
   * @param  {string} entity - Entity name pluralized
   * @param  {AxiosRequestConfig['params']} params? - Query parameters
   * @returns Promise
   */
  find(entity, params = {}) {
    return this.request('get', `/${entity}`, {
      params,
    })
  }

  /**
   * Get a specific {entity} entry
   *
   * @param  {string} entity - Entity name pluralized
   * @param  {string|number} id - ID of entry
   * @param  {AxiosRequestConfig['params']} params? - Query parameters
   * @returns Promise
   */
  findOne(entity, id) {
    return this.request('get', `/${entity}/${id}`)
  }

  /**
   * Create a {entity} entry
   *
   * @param  {string} entity - Entity name pluralized
   * @param  {AxiosRequestConfig["data"]} data - New entry
   * @returns Promise
   */
  create(entity, data) {
    return this.request('post', `/${entity}`, {
      data,
    })
  }

  /**
   * Update a specific entry
   *
   * @param  {string} entity - Entity name pluralized
   * @param  {string|number} id - ID of entry
   * @param  {AxiosRequestConfig["data"]} data? - Updated entry data
   * @returns Promise
   */
  update(entity, id, data) {
    return this.request('put', `/${entity}/${id}`, {
      data,
    })
  }

  /**
   * Delete a specific entry
   *
   * @param  {string} entity - Entity name pluralized
   * @param  {string|number} id - ID of entry
   * @returns Promise
   */
  delete(entity, id) {
    return this.request('delete', `/${entity}/${id}`)
  }
}
