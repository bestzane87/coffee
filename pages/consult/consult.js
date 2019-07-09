const Utils = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputNum: 0,
    textareaValue: '',
    tapState: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()
    this.setData({
      activityId: options.id
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
   * 当textarea中输入时，改变右下角的数字显示
   */
  changeNum: function(e){
    this.setData({ inputNum: e.detail.cursor })
  },
  /**
   * 获取textarea的值
   */
  getText (e) {
    this.setData({ textareaValue: e.detail.value })
  },
  /**
   * 保存咨询问题，返回上一页
   */
  saveQuestion () {
    const { textareaValue, activityId } = this.data
    const userMsg = wx.getStorageSync('userMsg')

    if (textareaValue) {
      // 改变button为不可点击状态，防止重复点击
      this.setData({ tapState: true })

      Utils.request({
        url: '/1_4/ActivityQuestionAdd.aspx',
        params: {
          ActivityId: activityId,
          QuestionUserId: userMsg.UserId,
          Contents: textareaValue,
        }
      })
        .then(res => {
          if(res.Code === '1'){
            // 返回上一页并更新咨询列表
            const pages = getCurrentPages()
            const interPages = pages[pages.length - 2]
            interPages.reloadPage()

            wx.navigateBack()
          }
        })
    }else{
      wx.showToast({
        title: '请输入咨询内容',
        icon: 'none',
        duration: 2000
      })
    }
  }
})