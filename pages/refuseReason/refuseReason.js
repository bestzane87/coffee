const Utils = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    curIndex: '1',
    reasonsObj: {
      1: '不符合报名条件',
      2: '不符合该票种报名条件，可选择其他票种',
      3: '名额已满',
      4: '其他'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ id: options.id })
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
  tapReasonItem (e) {
    const { index } = e.currentTarget.dataset
    
    this.setData({ curIndex: index })
  },
  getInputReason (e) {
    this.setData({ remark: e.detail.value })
  },
  refuseAttempt () {
    let { id, curIndex, reasonsObj, remark } = this.data

    if(curIndex == '4' && !remark){
      // 当选择理由为其他，且表单为空
      wx.showToast({
        title: '请填写拒绝原因',
        icon: 'none'
      })
      return
    } else if (curIndex != '4') {
      remark = reasonsObj[curIndex]
    }

    wx.showModal({
      title: '',
      content: '确定拒绝报名吗',
      success(res) {
        if (res.confirm) {
          Utils.request({
            url: '/1_4/ActivityEnrollIsStateUpdate.aspx',
            params: {
              EnrollId: id,
              ClickCode: '400',
              Remark: remark
            }
          })
            .then(res => {
              if (res.Code == '1') {
                const pages = getCurrentPages()
                const prevPage = pages[pages.length - 2]
                prevPage.setData({
                  dataList: [],
                  noData: false,
                  LastDataCreateTime: ''
                }, () => {
                  prevPage.getApplicantsList()
                  wx.navigateBack()
                })
              } else {
                wx.showToast({
                  title: res.Tips,
                  duration: 2000,
                  icon: 'none'
                })
              }
            })
        }
      }
    })
  }
})