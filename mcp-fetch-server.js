#!/usr/bin/env node

const axios = require('axios')
const readline = require('readline')

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// 处理MCP请求
async function handleRequest(request) {
  try {
    const { method, params } = request

    if (method === 'fetch') {
      const { url, method: httpMethod = 'GET', headers = {}, data } = params

      const response = await axios({
        method: httpMethod,
        url: url,
        headers: headers,
        data: data,
      })

      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
      }
    }

    return { error: 'Unknown method' }
  } catch (error) {
    return {
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
    }
  }
}

// 监听stdin输入
rl.on('line', async (line) => {
  try {
    const request = JSON.parse(line)
    const response = await handleRequest(request)
    console.log(JSON.stringify(response))
  } catch (error) {
    console.log(JSON.stringify({ error: error.message }))
  }
})

console.log('MCP Fetch Server started')






