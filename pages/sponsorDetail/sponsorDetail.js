const Utils = require('../../utils/util.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    text: '评',
    choosedAct: true,
    describe: '',
    introShortText: '',
    activityList: [],
    noMoreActivity: false,
    noMoreComment: false,
    commentList: [],
    activityList: [],
    position: "absolute",
    top: 0
  },
  /**
   * 处理多行文本截取长度
   */
  subStrText: function () {
    this.setData({
      firstLineText: this.data.describe.substr(0, 25),
      secondLineText: this.data.describe.substr(25, 20)
    })
  },
  /**
   * 生命周期函数--监听页面加载
   * 获取主办方详情，默认展示活动列表
   */
  onLoad: function (options) {
    this.getSponsorMsg(options.sponsorId, this.subStrText)
    this.getActivityList(options.sponsorId, '')
    this.getCommentList(options.sponsorId, '')

    this.setData({
      sponsorId: options.sponsorId
    })
  },
  /**
   * 展示所有介绍文本
   */
  showAllText: function () {
    this.setData({
      firstLineText: this.data.describe,
      secondLineText: ''
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const query = wx.createSelectorQuery()
    const that = this
    setTimeout(() => {
      query.select('#top_wrapper').boundingClientRect((res) => {
        that.setData({ scrollMax: res.top })
      })

      query.exec()
    }, 300)
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
  onPageScroll (e) {
    const { scrollMax } = this.data
    if (e.scrollTop >= scrollMax) {
      this.setData({ position: 'fixed', top: 0 })
    } else {
      this.setData({ position: 'absolute', top: 0 })
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
    const { choosedAct } = this.data

    if (choosedAct) {
      this.getActivityList()
    } else {
      this.getCommentList()
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    const { choosedAct } = this.data

    if (choosedAct) {
      this.getMoreActivity()
    } else {
      this.getMoreComment()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /**
   * 切换label
   */
  handleChangeLabel: function (e) {
    const { label } = e.currentTarget.dataset
    this.setData({ choosedAct: label === 'act' ? true : false })
  },
  /**
   * 获取主办方初始数据
   * @id 为主办方id
   * @latestOpenApp 为最近一次打开主办方页面的时间，每次打开该页面将该参数更新并保存在本地缓存中
   */
  getSponsorMsg: function (id, callback) {
    const latestOpenApp = wx.getStorageSync('latestOpenApp') || ''
    const userMsg = wx.getStorageSync('userMsg')
    let userId = userMsg.UserId || '0'

    Utils.request({
      url: '/1_4/UserOrganiser.aspx',
      params: {
        // 查看者即当前登录用户id
        FromUserId: userId,
        // 被查看的用户ID
        ToUserId: id,
        LastDataCreateTime: '',
        LastAppDataTime: latestOpenApp
      }
    })
      .then(res => {
        this.setData({
          sponsorMsg: res.Result,
          describe: res.Result.Summary
        })

        wx.setStorageSync('latestOpenApp', Utils.formatTime(new Date()))
      })
      .then(res => callback())
  },
  /**
   * 点选关注按钮后，刷新当前页面
   */
  handleFocus: function () {
    const sponsorId = this.data.sponsorMsg.UserId
    const userMsg = wx.getStorageSync('userMsg')
    const that = this
    
    if (!userMsg.UserId){
      wx.navigateTo({
        url: '/pages/login/login?pageFrom=1'
      })
    }else{
      Utils.request({
        url: '/1_4/UserOrganiserFollowAddDel.aspx',
        params: {
          // 查看者即当前登录用户id
          FromUserId: userMsg.UserId,
          // 被查看的用户ID
          ToUserId: sponsorId
        }
      })
        .then(res => {
          wx.redirectTo({
            url: `/pages/sponsorDetail/sponsorDetail?sponsorId=${sponsorId}`
          })
        })
    }
  },
  /**
   * 获取活动列表
   */
  getActivityList: function (id, lastCreateTime) {
    const that = this
    const userMsg = wx.getStorageSync('userMsg')
    const { sponsorId } = this.data
    
    Utils.request({
      url: '/1_4/UserOrganiserActivityList.aspx',
      params: {
        FromUserId: userMsg.UserId || '0',
        ToUserId: id || sponsorId,
        LastDataCreateTime: lastCreateTime
      }
    })
      .then(res => {
        if(res.Result){
          let activityList
          if (id) {
            activityList = [...that.data.activityList, ...res.Result]
          } else {
            activityList = res.Result
          }
          
          that.setData({
            activityList,
            noMoreActivity: id ? that.data.noMoreActivity : false
          })
        }else{
          that.setData({ noMoreActivity: true })
        }
      })
  },
  /**
   * 获取主办方历史评价
   */
  getCommentList: function (id, lastCreateTime) {
    const that = this
    const userMsg = wx.getStorageSync('userMsg')
    const { sponsorId } = this.data

    Utils.request({
      url: '/1_5/UserOrganiserActivityEvaluateList.aspx',
      params: {
        FromUserId: userMsg.UserId || '',
        ToUserId: id || sponsorId,
        // UserId: id,
        LastDataCreateTime: lastCreateTime || ''
      }
    })
      .then(res => {
        if (res.Result) {
          let commentList
          if (id) {
            commentList = [...that.data.commentList, ...res.Result]
          } else {
            commentList = res.Result
          }
          
          that.setData({
            commentList,
            noMoreComment: id ? that.data.noMoreComment : false
          })
        } else {
          that.setData({ noMoreComment: true })
        }
      })
  },
  /**
   * 获取更多活动列表
   */
  getMoreActivity: function () {
    if(!this.data.noMoreActivity){
      const sponsorId = this.data.sponsorMsg.UserId
      const lastItem = this.data.activityList
      const lastCreateTime = lastItem[lastItem.length - 1].CreateTime

      this.getActivityList(sponsorId, lastCreateTime)
    }
  },
  /**
   * 获取更多历史评价
   */
  getMoreComment: function () {
    if (!this.data.noMoreComment) {
      const sponsorId = this.data.sponsorMsg.UserId
      const lastItem = this.data.commentList
      const lastCreateTime = lastItem[lastItem.length - 1].CreateTime
      
      this.getCommentList(sponsorId, lastCreateTime)
    }
  },
  getActivityDetail: function (e) {
    const { id } = e.currentTarget.dataset
    
    wx.navigateTo({
      url: `/pages/activityDetail/activityDetail?activity_id=${id}`
    })
  },
  navigateToFansList(e) {
    const { num } = e.currentTarget.dataset
    const { sponsorMsg } = this.data

    if (num != 0) {
      wx.navigateTo({
        url: '/pages/myFans/myFans?id=' + sponsorMsg.UserId
      })
    }
  },
  getUserDeial (e) {
    const { id } = e.currentTarget.dataset

    wx.navigateTo({
      url: '/pages/userDetail/userDetail?user_id=' + id,
    })
  }
})