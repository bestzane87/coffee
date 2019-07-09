const Utils = require('../../utils/util.js')
const constants = require('../../utils/constants.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    labels: constants.chooseLabels,
    curIndex: 0,
    chooseList: [],
    LastDataCreateTime: '',
    LastDataIsState: '',
    noData: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu()
    this.setData({ activityId: options.id }, () => {
      this.getChooseList()
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    const height = wx.getSystemInfoSync().windowHeight

    this.setData({ height: height * 2 - 92 })
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
   * 切换互选结果类型
   */
  changeActivityLabel: function(e) {
    const {
      curIndex
    } = this.data
    const {
      index
    } = e.currentTarget.dataset

    if (curIndex != index) {
      this.setData({
        curIndex: index,
        LastDataCreateTime: '',
        LastDataIsState: '',
        chooseList: [],
        noData: false
      }, () => this.getChooseList())
    }
  },
  getChooseList () {
    const { curIndex, LastDataCreateTime, activityId, chooseList, noData, count, LastDataIsState } = this.data
    const that = this
    const { UserId } = wx.getStorageSync('userMsg')

    if(!noData){
      Utils.request({
        url: '/1_4/ActivitySelectResultOrganiser.aspx',
        params: {
          UserId,
          IsState: curIndex,
          ActivityId: activityId,
          LastDataCreateTime,
          LastDataIsState
        }
      })
        .then(res => {
          const r = res.Result
          if (r) {
            that.setData({
              count: res.Tips,
              chooseList: [...chooseList, ...r],
              LastDataCreateTime: r ? r[r.length - 1].CreateTime : '',
              LastDataIsState: r ? r[r.length - 1].IsState : '',
            })
          } else {
            that.setData({
              count: res.Tips,
              noData: true
            })
          }
        })
    }
  }
})