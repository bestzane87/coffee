const Utils = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    fansList: [],
    LastDataCreateTime: '',
    noMore: false,
    fansCount: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()
    this.setData({ userId: options.id })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const height = wx.getSystemInfoSync().windowHeight

    this.setData({ height: height * 2 })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getFansList()
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
  // 获取粉丝列表
  getFansList () {
    const { LastDataCreateTime, userId, fansList, noMore } = this.data
    const location = wx.getStorageSync('location')
    const that = this
    
    if(!noMore){
      Utils.request({
        url: '/1_4/UserOrganiserFollowList.aspx',
        params: {
          // 2为粉丝
          Type: 2,
          UserId: userId,
          Location: location || '',
          LastDataCreateTime
        }
      })
        .then(res => {
          const d = res.Result

          if(d){
            that.setData({
              fansCount: res.Tips,
              fansList: [...fansList, ...d],
              LastDataCreateTime: d[d.length - 1].CreateTime
            })
          }else{
            that.setData({ noMore : true})
          }
        })
    }
  }
})