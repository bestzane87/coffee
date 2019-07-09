const Utils = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    LastDataCreateTime: '',
    askList: [],
    curOperations: -1,
    focusInput: false,
    noMore: false
  },
  hideOperation () {
    this.setData({ curOperations: -1 })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()
    this.setData({ activityId: options.id })
    this.getActivityDetail(options.id)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const height = wx.getSystemInfoSync().windowHeight

    this.setData({ height: height * 2 - 134 - 1})
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getInitialQuestions()
    this.setData({ userMsg: wx.getStorageSync('userMsg') })
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
  commitAnswer () {
    const that = this
    const { questionId, inputValue } = this.data
    const userMsg = wx.getStorageSync('userMsg')

    if (inputValue) {
      Utils.request({
        url: '/1_4/ActivityReplyAdd.aspx',
        params: {
          QuestionId: questionId,
          ReplyUserId: userMsg.UserId,
          Contents: inputValue
        }
      })
        .then(res => {
          if (res.Code == '1') {
            that.setData({
              focusInput: !this.data.focusInput,
            })
            that.reloadPage()
          }
        })
    }else{
      wx.showToast({
        title: '回复内容不能为空',
        duration: 2000,
        icon: 'none'
      })
    }
  },
  /**
   * 确认回复内容，提交数据
   */
  confirmAnswer: function (e) {
    
    this.setData({
      inputValue: e.detail.value
    })
  },
  /**
   * 获取活动咨询列表
   */
  getInitialQuestions () {
    const { UserId } = wx.getStorageSync('userMsg')
    let { askList, LastDataCreateTime, activityId, noMore } = this.data
    const that = this
  if(!noMore){
    Utils.request({
      url: '/1_4/ActivityQuestionList.aspx',
      params: {
        UserId,
        ActivityId: activityId,
        LastDataCreateTime
      }
    })
      .then(res => {
        const r = res.Result
        if(r){
          askList = [...askList, ...r]

          that.setData({
            askList,
            LastDataCreateTime: r[r.length - 1].CreateTime
          })
        }else{
          that.setData({ noMore: true })
        }
      })
  }
  },
  
  toggleOperations (e) {
    const {curOperations} = this.data
    this.setData({ curOperations: e.currentTarget.dataset.index })
  },

  /**
   * 删除当前活动咨询
   */
  deleteQuestion (e) {
    
  },

  /**
   * 回复当前咨询
   */
  answerQuestion (e) {
    const { questionid, userid } = e.currentTarget.dataset

    this.setData({
      focusInput: !this.data.focusInput,
      questionId: questionid,
      userId: userid,
      curOperations: -1
    })
  },
  /**
   * 删除回复
   */
  deleteReplyItem (e) {
    const { replyid } = e.currentTarget.dataset
    const that = this

    wx.showModal({
      title: '',
      content: '您确定删除当前回复吗？',
      success (e) {
        if(e.confirm){
          Utils.request({
            url: '/1_4/ActivityReplyDel.aspx',
            params: {
              ReplyId: replyid
            }
          })
            .then(res => {
              if(res.Code === '1'){
                that.reloadPage()
              }
            })
        }
      }
    })
  },
  /**
   * 添加活动咨询问题
   */
  navigateToTextare () {
    const that = this

    wx.navigateTo({
      url: `/pages/consult/consult?id=${that.data.activityId}`
    })
  },
  /**
   * 刷新页面
   */
  reloadPage () {
    this.setData({
      askList: [],
      LastDataCreateTime: '',
      noMore: false,
      curOperations: -1
    }, () => this.getInitialQuestions())
  },
  /**
   * 删除问题
   */
  deleteQuestion (e) {
    const { questionid } = e.currentTarget.dataset
    const that = this

    wx.showModal({
      title: '',
      content: '您确认删除当前问题吗',
      success (res) {
        if(res.confirm){
          Utils.request({
            url: '/1_4/ActivityQuestionDel.aspx',
            params: {
              QuestionId: questionid
            }
          })
            .then(res => {
              if(res.Code === '1'){
                that.reloadPage()
              }
            })
        }
      }
    })
  },
  // 获取活动主办方id，只有主办方和评论者可以删除和回复咨询问题
  getActivityDetail (id) {
    const that = this

    Utils.request({
      url: '/1_4/ActivityInfo.aspx',
      params: {
        UserId: '0',
        ActivityId: id
      }
    })
      .then(res => {
        that.setData({
          sponserId: res.Result.UserOrganiser.UserId
        })
      })
  },
  getUserDetail (e) {
    const { id } = e.currentTarget.dataset

    wx.navigateTo({
      url: '/pages/userDetail/userDetail?user_id=' + id,
    })
  }
})