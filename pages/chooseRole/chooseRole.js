const Utils = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    roleList: [],
    curName: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()

    this.getRoleList(options.activityId, options.formId)
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
    const roleName = wx.getStorageSync('roleName')
    if (roleName) {
      this.setData({ curName: roleName })
    }
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

  getRoleList (activityid, formid) {
    const that = this

    Utils.request({
      url: '/1_4/ActivityRoleInfoSelect.aspx',
      params: {
        ActivityFormId: formid,
        ActivityId: activityid
      }
    })
      .then(res => {
        that.setData({
          roleList: res.Result
        })
      })
  },
  saveRoleName () {
    const that = this
    wx.setStorageSync('roleName', that.data.curName)

    wx.navigateBack()
  },
  selectRoleName (e) {
    const { name, abled } = e.currentTarget.dataset

    if (abled == 1) {
      wx.showToast({
        title: '角色已被选',
        icon: 'none'
      })
      return
    } else {
      this.setData({
        curName: name
      })
    }
  }
})