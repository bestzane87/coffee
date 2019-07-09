const Utils = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    lastCreateTime: '',
    focusedList: [],
    moreFocused: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()
    this.getFocusedList()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const height = wx.getSystemInfoSync().windowHeight

    this.setData({height: height * 2})
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
   * 获取关注列表
   */
  getFocusedList: function () {
    const that = this
    const userMsg = wx.getStorageSync('userMsg')
    const { UserId } = userMsg
    const { lastCreateTime, moreFocused, focusedList } = this.data

    if (moreFocused){
      Utils.request({
        url: '/1_4/UserOrganiserFollowList.aspx',
        params: {
          Type: '1',
          Location: '',
          UserId: UserId,
          LastDataCreateTime: lastCreateTime
        }
      })
        .then(res => {
          if(res.Result){
            that.setData({
              focusedList: [...focusedList, ...res.Result],
              moreFocused: true,
              lastCreateTime: res.Result[res.Result.length - 1].CreateTime
            })
          }else{
            that.setData({ moreFocused: false }, () => console.log(!that.data.moreFocused && !that.data.focusedList.length))
          }
        })
    }
  },
  /**
   * 进入主办方介绍页面
   */
  getSponsorDetail: function (e) {
    const sponsorId = e.currentTarget.dataset.id

    wx.navigateTo({
      url: `/pages/sponsorDetail/sponsorDetail?sponsorId=${sponsorId}`
    })
  }
})