const Utils = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    iconList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()
    if (options.skip) {
      wx.navigateTo({
        url: '/pages/allActivities/allActivities'
      })
    }
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
    const userMsg = wx.getStorageSync('userMsg')
    this.setData({ userMsg })

    if(userMsg){
      this.getUserCenterNum(userMsg.UserId)
    }
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
   * 跳转页面
   */
  navigateToPage: function (e) {
    this.navigateToLogin()
    const { page } = e.currentTarget.dataset
    
    wx.navigateTo({
      url: `/pages/${page}/${page}`
    })
  },
  navigateToAllActivities (e) {
    const { userMsg } = this.data
    
    if (!userMsg) {
      wx.navigateTo({
        url: '/pages/login/login?pageFrom=1'
      })
    }else{
      const { index } = e.currentTarget.dataset
      wx.navigateTo({
        url: `/pages/allActivities/allActivities?state=${index}`
      })
    }
  },
  navigateToLogin () {
    const {userMsg} = this.data

    if(!userMsg){
      wx.navigateTo({
        url: '/pages/login/login?pageFrom=1'
      })      
    }
  },
  toggleSponsor () {
    const {userMsg} = this.data
    
    if (userMsg.OrganiserFlag == 1) {
      wx.navigateTo({
        url: `/pages/meSponsor/meSponsor?sponsorId=${userMsg.UserId}`
      })
    }else{
      wx.showModal({
        title: '',
        content: '成为主办方需人脸核身，请前往应用市场下载约杯咖啡APP体验该功能'
      })
    }
  },
  // 获取个人中心的数字显示
  getUserCenterNum(id) {
    const that = this
    const curDate = Utils.formatTimeYMD(new Date())
    Utils.request({
      url: '/1_4/UserCenterNew.aspx',
      params: {
        UserId: id,
        LastSeeMeDateTime: curDate,
        LastLightenMeDateTime: curDate
      }
    })
      .then(res => {
        let userMsg = wx.getStorageSync('userMsg');
        userMsg.HeadImage = res.Result.HeadImage;

        wx.setStorageSync('userMsg', userMsg)

        that.setData({
          verifyNum: res.Result.ActivityWaitVerifyNumber,
          paymentNum: res.Result.ActivityWaitPayNumber,
          attemptNum: res.Result.ActivityWaitJoinNumber,
          evalateNum: res.Result.ActivityWaitEvaluateNumber,
          iconList: res.Result.Icon,
          verifyTips: res.Result.RedBarTips
        }, () => {
          const d = that.data
          if (d.verifyNum || d.paymentNum || d.attemptNum || d.evalateNum) {
            wx.showTabBarRedDot({ index: 1 })
          } else {
            wx.hideTabBarRedDot({ index: 1 })
          }
        })
      })
  },
  showModal (e) {
    const { state } = e.currentTarget.dataset

    if (state == '0') {
      wx.showToast({
        title: '请下载约杯咖啡APP进行认证',
        duration: 2000,
        icon: 'none'
      })
    } else if (state == '2'){
      wx.navigateTo({
        url: '/pages/uploadAvatar/uploadAvatar'
      })
    }
  },
  navigateToUpdate () {
    wx.navigateTo({
      url: '/pages/updateMsg/updateMsg'
    })
  }
})