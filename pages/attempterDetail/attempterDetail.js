const Utils = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarMsg: {
      avatar: '/images/p6.jpg',
      name: '招财猫',
      distance: 10,
      labels: ['罗山', '18岁', '本科'],
      activeState: '本月活跃'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()
    this.getEnrollPersonMsg(options.id)
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
   * 获取报名者详情
   * @id {string} 报名id
   */
  getEnrollPersonMsg(id) {
    const that = this

    Utils.request({
      url: '/1_4/ActivityEnrollInfoUser.aspx',
      params: {
        EnrollId: id
      }
    })
      .then(res => {
        console.log(res)
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
  }
})