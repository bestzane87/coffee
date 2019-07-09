const Utils = require('../../utils/util.js')
import tapEvents from '../../template/template.js'

Page({
  
  /** 
   * 页面的初始数据
   */
  data: {
    noData: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()
    this.getChooseList(options.activityId, options.userId)
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
   * 获取互选结果列表
   */
  getChooseList (activityId, userId) {
    const that = this
    Utils.request({
      url: '/1_4/ActivitySelectResultUser.aspx',
      params: {
        ActivityId: activityId,
        UserId: userId
      }
    })
      .then(res => {
        that.setData({
          chooseList: res.Result,
          noData: !res.Result,
          actId: activityId,
          userId: userId
        })
      })
  },
  getAvatarDetail (e) {
    const {id} = e.currentTarget.dataset
    
    wx.navigateTo({
      url: '/pages/userDetail/userDetail?user_id=' + id
    })
  },
  tapButtons(e) {
    tapEvents.tapButtons(e)
  },
  navigateToAllUsers () {
    const { actId, userId } = this.data

    wx.navigateTo({
      url: '/pages/allAttempter/allAttempter?id=' + actId
    })
  }
})