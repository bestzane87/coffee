// const hostUrl = 'https://tappapi.qiyuhz.com' //测试
const hostUrl = 'https://appapi.qiyuhz.com' //正式
const md5 = require('./md5.js')
const version = '1.0.20'

// 获取成年最小日期
const requiredTime = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  return [year - 18, month, day].map(formatNumber).join('-')
}
// 获取正确时间格式
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

// 获取时间格式
const formatTimeYY = date => {
  const year = String(date.getFullYear()).substring(2, 4)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  
  return [year, month, day, hour, minute, second].map(formatNumber).join('')
}

// 获取正确时间格式
const formatTimeYMD = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  
  return [year, month, day].map(formatNumber).join('-')
}

// 获取不带年的时间格式
const formatShortTime = date => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [month, day].map(formatNumber).join('/')
}

// 获取时间戳，每次请求带上该参数
const getTimeStamp = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day, hour, minute, second].map(formatNumber).join('')
}

// 判断时间格式，小于10的时候前面加上0
const formatNumber = n => {
  n = n.toString()
  return n > 9 ? n : '0' + n
}

// 统一请求接口
const request = ({url, params}) => {
  // timestamp参数需要加上机型，操作系统和版本号，以便后端判断错误来源，记得每次上传新版本时替换版本号
  const u = wx.getSystemInfoSync()

  const timeStamp = (new Date()).getTime().toString().substring(0, 10)

  const userMsg = wx.getStorageSync('userMsg')

  const str = `${timeStamp}${userMsg ? userMsg.QiyuId : ''}_${u.model}_${u.system}_SmallAPP${version}`

  return new Promise((resolve, reject) => {
    wx.request({
      url: hostUrl + url,
      method: 'post',
      data: {
        ...params,
        // 取小写16位
        Signature: ((md5.md5(`adventure ${str}`)).substring(8, 24)).toLowerCase(),
        Timestamp: str
      },
      success: function (res) {
        // 如被封号，提示并跳转至登录页
        if (res.data.Code == 100) {
          wx.showToast({
            title: res.data.Tips || '你已被封号，请联系客服处理',
            icon: 'none'
          })
          wx.reLaunch({
            url: '/pages/chooseLogin/chooseLogin'
          })
          return
        }
        resolve(res.data)
      },
      fail: function (err) {
        reject(err)
      }
    })
  })
}

module.exports = {
  requiredTime,
  formatTimeYY,
  formatShortTime,
  formatTimeYMD,
  formatTime, 
  getTimeStamp,
  request
}
