const Utils = require('../../utils/util.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    noData: false,
    collectedList: [],
    lastCreateTime: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()
    this.getCollectedActivities()
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
   * 获取收藏活动列表
   */
  getCollectedActivities: function () {
    const { lastCreateTime, collectedList, noData } = this.data
    const that = this
    const userMsg = wx.getStorageSync('userMsg')

    if(!this.data.noData){
      Utils.request({
        url: '/1_4/ActivityCollectionList.aspx',
        params: {
          UserId: userMsg.UserId,
          LastDataCreateTime: lastCreateTime
        }
      })
        .then(res => {
          if (res.Result) {
            that.setData({
              collectedList: [...collectedList, ...res.Result],
              noData: res.Result.length === 10 ? false : true,
              lastCreateTime: res.Result[res.Result.length - 1].CreateTime
            })
          } else {
            that.setData({ noData: true })
          }
        })
    }
  },
  /**
   * 跳转活动详情界面
   */
  getActivityDetail: function (e) {
    const activityId = e.currentTarget.dataset.id

    wx.navigateTo({
      url: `/pages/activityDetail/activityDetail?activity_id=${activityId}`
    })
  },
  /**
   * 删除收藏
   */
  deleteCollectActivity (e) {
    const { id, index } = e.currentTarget.dataset
    const { collectedList } = this.data
    const that = this

    wx.showModal({
      title: '',
      content: '您确认删除该活动吗',
      success (res) {
        if(res.confirm){
          Utils.request({
            url: '/1_4/ActivityCollectionAddDel.aspx',
            params: {
              UserId: userMsg.UserId,
              ActivityId: id
            }
          })
            .then(res => {
              if(res.Code === '1'){
                collectedList.splice(index, 1)

                that.setData({ collectedList })
              }
            })
        }
      }
    })
  }
})