const Utils = require('../../utils/util.js')
import tapEvents from '../../template/template.js'

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
    const { id } = this.data
    this.getEnrollerMsg(id)

    // this.getDescModalText()
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
    const userMsg = wx.getStorageSync('userMsg')
    const { shareInfo } = this.data

    return {
      title: shareInfo.Title,
      path: `/pages/activityDetail/activityDetail?activity_id=${shareInfo.ActivityId}&from_user_id=${userMsg.UserId || ""}&share=1`,
      imageUrl: shareInfo.PosterImage + '?x-oss-process=image/crop,w_500,h_400,g_center'
    }
  },
  /**
   * 获取报名者信息
   */
  getEnrollerMsg (id) {
    const that = this

    Utils.request({
      url: '/1_4/ActivityEnrollInfoUser.aspx',
      params: {
        EnrollId: id
      }
    })
      .then(res => {
        that.setData({ enrollerMsg: res.Result })
      })
  },
  tapButtons (e) {
    tapEvents.tapButtons(e)
  },
  navigateToDetail(e) {
    const { id } = e.currentTarget.dataset
    const { enrollerMsg } = this.data

    wx.navigateTo({
      url: `/pages/activityDetail/activityDetail?activity_id=${id}&enrollid=${enrollerMsg.EnrollId}`
    })
    
  },
  
  hideShareContainer() {
    this.setData({ showShareImg: !this.data.showShareImg })
  },
  downloadShare() {
    const that = this
    wx.showLoading({
      title: ''
    })
    wx.downloadFile({
      url: that.data.shareInfo.QrCodeUrl,
      success(res) {
        wx.hideLoading()
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success(res) {
            wx.showToast({
              title: '保存成功，请前往相册查看',
              duration: 2000,
              icon: 'none'
            })
          },
          fail(err) {
            wx.showModal({
              title: '',
              content: '请允许小程序保存图片到您的相册',
              success(res) {
                wx.openSetting()
              }
            })
          }
        })
      }
    })
  },
  getDescModalText() {
    const that = this

    Utils.request({
      url: '/1_4/ActivityShareRewardText.aspx'
    })
      .then(res => {
        that.setData({ introText: res.Result.Value })
      })
  },
  showDescModal() {
    const that = this

    wx.showModal({
      title: '',
      content: that.data.shareInfo.RewardText.split('/n').join('\r\n')
    })
  },
  /**
   * 获取活动分享图片
   */
  getShareImg(id) {
    const that = this
    const userMsg = wx.getStorageSync('userMsg')
    // 缓存活动id，用于分享
    wx.setStorageSync('id', id)

    wx.showLoading({
      title: ''
    })
    Utils.request({
      url: '/1_4/ActivityShare.aspx',
      params: {
        UserId: userMsg.UserId,
        ActivityId: id
      }
    })
      .then(res => {
        wx.hideLoading()

        if (res.Code == '0') {
          wx.showToast({
            title: res.Tips
          })
          return
        }

        that.setData({
          shareInfo: res.Result,
          showShareImg: true
        })
      })
  },
  toggleShowModal() {
    this.setData({
      content: this.data.shareInfo.RewardText.split('\n'),
      showShareContent: !this.data.showShareContent
    })
  }
})