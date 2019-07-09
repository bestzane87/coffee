const Utils = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    curIndex: -1,
    objTetx: {
      1: '所有票款',
      2: '所有签到过的票款',
      3: '所有押金',
      4: '所有签过到的押金'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu()

    this.getRefundNum(options.id)
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

  selectRefundItem(e) {
    const {
      index,
      value
    } = e.currentTarget.dataset
    const that = this

    if (value != 0) {
      this.setData({
        curIndex: index
      })
    }
  },
  refundOperation() {
    const {
      curIndex,
      refundObj,
      id
    } = this.data

    if (curIndex == -1) {
      wx.showToast({ 
        title: '请选择票款类型',
        icon: 'none'
      })
      return
    }

    wx.showModal({
      title: '',
      content: '确定批量退款吗？',
      success(res) {
        if (res.confirm) {
          Utils.request({
              url: '/1_4/ActivityEnrollOutMoneyBatch.aspx',
              params: {
                ActivityId: id,
                Key: refundObj[curIndex].Key,
                UserId: wx.getStorageSync('userMsg').UserId
              }
            })
            .then(res => {
              if (res.Code == '1') {
                wx.showToast({
                  title: '操作成功',
                  icon: 'none'
                })

                setTimeout(() => {
                  wx.navigateBack()
                }, 1000)
              } else {
                wx.showToast({
                  title: res.Tips,
                  icon: 'none'
                })
              }
            })
        }
      }
    })

  },
  getRefundNum(id) {
    const that = this

    Utils.request({
        url: '/1_4/ActivityEnrollOutMoneyRefundableBatch.aspx',
        params: {
          ActivityId: id
        }
      })
      .then(res => {
        that.setData({
          refundObj: res.Result,
          id
        })
      })
  }
})