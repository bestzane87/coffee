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
  saveDownloadImg () {
    wx.showLoading({
      title: '',
    })
    wx.downloadFile({
      url: 'https://ossqiyu.oss-cn-hangzhou.aliyuncs.com/Advertisements/20190701174041.jpg',
      success (res) {
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
  }
})