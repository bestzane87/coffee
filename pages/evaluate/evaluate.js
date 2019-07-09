const Utils = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    btnObj: {
      text: '保存'
    },
    tapState: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()
    this.setData({
      activityId: options.id,
      enrollId: options.enrollId
    })
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
    this.setData({ focusTextarea: true })
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
   * 文本域改变
   */
  textareaChange: function (e) {
    this.setData({ commentText: e.detail.value})
  },
  /**
   * 保存活动评价
   */
  saveComment: function () {
    const { commentText, activityId, enrollId } = this.data
    const userMsg = wx.getStorageSync('userMsg')
    
    if (!commentText) {
      wx.showToast({
        title: '请输入评价内容',
        icon: 'none'
      })
      return
    }

    this.setData({ tapState: true })

    Utils.request({
      url: '/1_4/ActivityEvaluateAdd.aspx',
      params: {
        EnrollId: enrollId,
        ActivityId: activityId,
        UserId: userMsg.UserId,
        Contents: commentText
      }
    })
      .then(res => {
        if(res.Code === '1'){
          wx.redirectTo({
            url: '/pages/allActivities/allActivities'
          })
        }
      })
  }
})