const Utils = require('../../utils/util.js')
const constants = require('../../utils/constants.js')
const date = new Date()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    phoneNumber: '',
    // 登录按钮默认不可点
    clickState: true,
    phone: '',
    code: '',
    time: false,
    cHeight: 0,
    cWidth: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()
    this.setData({activityId: options.id || '', pageFrom: options.pageFrom || ''})
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
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
  /**
   * 获取验证码
   */
  getVerifyCode () {
    const { phone } = this.data
    const that = this

    if (!phone){
      wx.showToast({
        title: '请输入手机号',
        duration: 2000,
        icon: 'none'
      })
    }else if(phone.length != 11){
      wx.showToast({ title: '号码错误', icon: 'none', duration: 2000, })
    }else{
      let time = 59
      that.setData({ time })

      Utils.request({
        url: '/1_4/VerificationCode.aspx',
        params: {
          Type: '4',
          Phone: phone
        }
      })
        .then(res => {
          if(res.Code == '1'){
            wx.showToast({
              title: '验证码发送成功',
              icon: 'none',
              duration: 2000,
            })
            let interval = setInterval(() => {
              time -= 1
              if (time) {
                that.setData({ time })
              }else{
                clearInterval(interval)
                that.setData({ time: false })
              }
            }, 1000)
          }else{
            wx.showToast({
              title: res.Tips,
              duration: 2000,
              icon: 'none'
            })
          }
        })
    }
  },
  /**
   * 获取用户信息
   */
  getUserInfo (e) {
    const {phone, code, activityId, pageFrom} = this.data
    const { location } = getApp().globalData
    const that = this
    
    console.log(e)
    
    if (!phone) {
      wx.showToast({
        title: '请输入手机号',
        duration: 2000,
        icon: 'none'
      })
    }else if(!code){
      wx.showToast({
        title: '请输入验证码',
        duration: 2000,
        icon: 'none'
      })
    }else{
      Utils.request({
        url: '/1_4/LoginRegister.aspx',
        params: {
          Phone: phone,
          Code: code,
          FromUserId: wx.getStorageSync('fromUserId') || '',
          IsInvite: '0'
        }
      })
        .then(res => {
          if(res.Code == '1'){
            getApp().globalData.userId = res.Result.UserId
            
            wx.setStorageSync('userMsg', res.Result)
            
            let avatarUrl = res.Result.HeadImage

            // 判断是否授权获取信息，同意的话则再次判断头像是否为默认头像，如果是默认头像，上传并替换用户头像，如果不是默认头像和授权拒绝的话则不需要上传头像
            if (e.detail.errMsg == "getUserInfo:ok" && avatarUrl.indexOf('default') > 0) {
              avatarUrl = e.detail.userInfo.avatarUrl
              avatarUrl = avatarUrl.substring(0, avatarUrl.length - 3) + '0'
              
              // 更新用户头像，调用小程序专用头像接口
              that.updateAvatarUrl(avatarUrl)
              return
            }

            // 用户活跃记录
            that.updateActiveState(res.Result.UserId)
          }else{
            wx.showToast({
              title: res.Tips,
              duration: 2000,
              icon: 'none'
            })
          }
        })
    }
  },
  /**
   * 获取手机号
   */
  getInputValue (e) {
    const {type} = e.currentTarget.dataset
    
    this.setData({
      [type]: e.detail.value
    }, () => {
      const { phone, code } = this.data

      this.setData({ clickState: !phone || !code })
    })
  },
  // 更新用户活跃信息
  updateActiveState (userId) {
    Utils.request({
      url: '/1_4/UserActiveAdd.aspx',
      params: {
        UserId: userId,
        Location: getApp().globalData.location || ''
      }
    })
      .then(res => {
        wx.navigateBack()
      })
  },

  // 先保存图片到本地，然后上传临时路径的图片到oss，最后上传到后端
  updateAvatarUrl (avatar) {
    const that = this
    
    wx.downloadFile({
      url: avatar,
      success (res) {
        console.log(res)
        let userMsg = wx.getStorageSync('userMsg')
        var namePath = userMsg.QiyuId + Utils.formatTimeYY(new Date())
        var ossPath = 'Users/' + namePath

        wx.uploadFile({
          url: constants.ossUrl,
          filePath: res.tempFilePath,
          name: 'file',
          formData: {
            name: res.tempFilePath,
            // key为保存在oss的文件名
            key: ossPath + '.jpg',
            policy: constants.policy,
            OSSAccessKeyId: constants.OSSAccessKeyId,
            signature: constants.signature,
            success_action_status: '200'
          },
          success: function (res) {
            // 上传成功后设置本地头像为已上传照片
            Utils.request({
              url: '/1_4/UserHeadImageUpdateBySmall.aspx',
              params: {
                UserId: userMsg.UserId,
                HeadImage: namePath + '.jpg'
              }
            })
              .then(res => {
                if (res.Code == '1') {
                  const avatarUrl = constants.ossUrl + '/' + ossPath + '.jpg'
                  userMsg = {
                    ...userMsg,
                    HeadImage: avatarUrl
                  }
                  // 更新本地用户数据
                  wx.setStorageSync('userMsg', userMsg)
                  
                  that.updateActiveState(userMsg.UserId)
                } else {
                  wx.showToast({
                    title: res.Tips,
                    duration: 2000,
                    icon: 'none'
                  })
                }
              })
          }
        })
      }
    })
  }
})