const Utils = require('../../utils/util.js');
const NIM = require('../../utils/NIM_Web_NIM_weixin_v6.0.0.js');
const constants = require('../../utils/constants.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      pageUrl: wx.getStorageSync('pageUrl')
    }, () => {
      wx.removeStorageSync('pageUrl')
    })
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  getPhoneNumber (e) {
    const that = this

    if (e.detail.errMsg.indexOf('ok') > 0) {
      console.log(e)
    } else {
      wx.showToast({
        title: '请先允许授权',
        icon: 'none'
      })
      return
    }
    
    wx.login({
      success (res) {
        // console.log(res.code)
        // console.log(e.detail.iv)
        // console.log(e.detail.encryptedData)
        Utils.request({
          url: '/1_4/WeiXinPhone.aspx',
          params: {
            code: res.code,
            iv: e.detail.iv,
            encryptedData: e.detail.encryptedData
          }
        })
          .then(res => {
            if (res.Code == '1') {
              Utils.request({
                url: '/1_5/LoginRegister.aspx',
                params: {
                  Type: 3,
                  Phone: res.Result.Value,
                  SMSCode: '',
                  WeiXinCode: '',
                  IsInvite: 0,
                  FromUserId: ''
                }
              })
                .then(res => {
                  if (res.Code == 1 || res.Code == 2) {
                    if (res.Code == 2) {
                      const nim = NIM.getInstance({
                        appKey: constants.appKey,
                        account: res.Result.UserId,
                        token: 'qiyu' + UserId,
                        onconnect(res) {
                          nim.updateMyInfo({
                            nick: res.Result.NickName,
                            avatar: res.Result.HeadImage,
                            done(err, res) {
                              console.log(res)
                            }
                          })
                        }
                      })
                    }
                    wx.setStorageSync('userMsg', res.Result)
                    
                    that.switchUrlTab()
                  } else {
                    wx.showToast({
                      title: res.Tips || '登录失败',
                      icon: 'none'
                    })
                  }
                })
            } else {
              wx.showToast({
                title: res.Tips,
                icon: 'none'
              })
            }
          })
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  
  // 页面跳转
  switchUrlTab () {
    const INDEXACTIVITY = 'pages/activity/activity'
    const DETAILACTIVITY = 'pages/activityDetail/activityDetail'
    const DETAILACTIVITYCODE = 'pages/activityDetailCode/activityDetailCode'

    const { pageUrl } = this.data
    
    if (pageUrl.indexOf(INDEXACTIVITY) > -1) {
      // 跳转首页
      wx.switchTab({
        url: pageUrl
      })
    } else if (pageUrl.indexOf(DETAILACTIVITY) > -1 || pageUrl.indexOf(DETAILACTIVITYCODE) > -1) {
      wx.redirectTo({
        url: pageUrl
      })
    } else {
      wx.switchTab({
        url: '/pages/activity/activity'
      })
    }
  },
  navigateToServices () {
    wx.navigateTo({
      url: '/pages/services/services'
    })
  },
  navigateToProtect () {
    wx.navigateTo({
      url: '/pages/protect/protect'
    })
  }
})