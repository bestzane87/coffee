const Utils = require('../../utils/util.js')

import tapEvents from '../../template/template.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu()
    this.setData({ enrollId: options.id, activityId: options.activityId})
    this.getEnrollPersonMsg(options.id)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  /**
   * 获取报名者详情
   * @id {string} 报名id
   */
  getEnrollPersonMsg(id) {
    const that = this
    const location = wx.getStorageSync('location')

    Utils.request({
        url: '/1_4/ActivityEnrollInfoOrganiser.aspx',
        params: {
          EnrollId: id,
          Location: location || '',
        }
      })
      .then(res => {
        const r = res.Result.UserSimple
        that.setData({
          avatarMsg: {
            avatar: r.HeadImage,
            name: r.NickName,
            distance: res.Result.DistanceText,
            labels: [r.City, r.Age, r.Education],
            activeState: res.Result.ActiveText
          },
          personDetail: res.Result
        })
      })
  },
  tapButtons(e) {
    tapEvents.tapButtons(e)
  },
  getUserDetail () {
    const { personDetail } = this.data

    wx.navigateTo({
      url: '/pages/userDetail/userDetail?user_id=' + personDetail.UserSimple.UserId
    })
  }
})