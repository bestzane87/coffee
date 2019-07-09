import citys from '../../utils/citys.js'
const Utils = require('../../utils/util.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    citys: [],
    curId: 'hot',
    hotCitys: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()
    this.getInitialData()
    this.getHotCity()
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /**
   * 处理城市数据
   */
  getInitialData () {
    const letterArr = citys.map(item => item.initial)
    this.setData({ letterArr: ['当前', '热门', ...letterArr], citys })


  },
  handleClickLetter (e) {
    const { id } = e.currentTarget.dataset

    if(id == '当前'){
      this.setData({curId: 'cur'})
    }else if(id == '热门'){
      this.setData({ curId: 'hot' })
    }else{
      this.setData({ curId: id })
    }
  },
  setCity (e) {
    const {city} = e.currentTarget.dataset

    wx.setStorageSync('city', city)

    const pages = getCurrentPages()
    const activity = pages[pages.length - 2]

    activity.setData({ lastItem: '', pageIndex: 1 }, () => {
      activity.getActivityList()
        .then(actList => {
          activity.setData({
            curCity: city || '杭州',
            actList,
            pageIndex: actList.length ? 2 : 1,
            lastItem: actList.length ? actList[actList.length - 1] : '',
          }, () => {
            activity.setData({ noData: !activity.data.actList.length })
            wx.navigateBack()
          })
        })
    })
  },
  // 获取热门城市列表
  getHotCity () {
    const that = this

    Utils.request({
      url: '/1_4/ConfigHotCity.aspx'
    })
      .then(res => {
        console.log(res)
        that.setData({ hotCitys: res.Result })
      })
  }
})