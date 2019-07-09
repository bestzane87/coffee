const WxParse = require('../wxParse/wxParse.js');
const Utils = require('../../utils/util.js');

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
    wx.hideShareMenu()
    this.getActivityDetail(options.id)
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
  getActivityDetail (id) {
    const userMsg = wx.getStorageSync('userMsg')
    const { UserId } = userMsg
    const that = this

    Utils.request({
      url: '/1_4/ActivityInfo.aspx',
      params: {
        UserId: UserId || '0',
        ActivityId: id
      }
    })
      .then(res => {
        that.setData({
          content: res.Result.Contents
        })

        WxParse.wxParse('article', 'html', res.Result.Contents.replace(/(<o:p>|<\/o:p>)/g, ''), that, 0);
      })
  }
})