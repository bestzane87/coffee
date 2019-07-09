const Utils = require('../../utils/util.js');
import tapEvents from '../../template/template.js'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    text: '评',
    // 展示评论的活动名
    show: true,
    choosedAct: true,
    describe: '',
    introShortText: '',
    activityList: [],
    noMoreActivity: false,
    noMoreComment: false,
    commentList: [],
    activityList: [],
    showAnswer: false,
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
    wx.hideShareMenu()
    
    this.setData({ sponsorId: options.sponsorId })
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
    const { sponsorId } = this.data
    const pages = getCurrentPages()
    const curPage = pages[pages.length - 1]
    // this.getDescModalText()
    
    this.getSponsorMsg(curPage.options.sponsorId, this.subStrText)

    this.setData({
      commentList: [],
      activityList: []
    }, () => {
      this.getActivityList(sponsorId, '')
      this.getCommentList(sponsorId, '')
    })
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
    const userMsg = wx.getStorageSync('userMsg')
    const { shareInfo } = this.data

    return {
      title: shareInfo.Title,
      path: `/pages/activityDetail/activityDetail?activity_id=${shareInfo.ActivityId}&from_user_id=${userMsg.UserId || ""}&share=1`,
      imageUrl: shareInfo.PosterImage + '?x-oss-process=image/crop,w_500,h_400,g_center'
    }
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
    
    Utils.request({
      url: '/1_4/UserOrganiser.aspx',
      params: {
        // 查看者即当前登录用户id
        FromUserId: userMsg.UserId || '0',
        // 被查看的用户ID
        ToUserId: id,
        LastDataCreateTime: '',
        LastAppDataTime: latestOpenApp
      }
    })
      .then(res => {
        this.setData({
          sponsorMsg: res.Result,
          describe: res.Result.Summary,
          sponsorId: id
        })

        wx.setStorageSync('latestOpenApp', Utils.formatTime(new Date()))
      })
      .then(res => callback())
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
        // FromUserId: '102',
        ToUserId: id || sponsorId,
        LastDataCreateTime: lastCreateTime
      }
    })
      .then(res => {
        if (res.Result) {
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
        } else {
          that.setData({ noMoreActivity: true })
        }
      })
  },
  /**
   * 获取主办方历史评价
   */
  getCommentList: function (id, lastCreateTime, bool) {
    const that = this
    const userMsg = wx.getStorageSync('userMsg')
    const { sponsorId } = this.data

    Utils.request({
      url: '/1_5/UserOrganiserActivityEvaluateList.aspx',
      params: {
        FromUserId: userMsg.UserId || '',
        ToUserId: id || sponsorId,
        LastDataCreateTime: lastCreateTime
      }
    })
      .then(res => {
        if (res.Result) {
          // let commentList

          // if (bool) {
          //   commentList = [...that.data.prevCommentList, ...res.Result]
          // } else {
          //   commentList = [...that.data.commentList, ...res.Result]
          // }

          // that.setData({
          //   commentList,
          //   prevCreateTime: lastCreateTime,
          //   prevCommentList: that.data.commentList
          // })

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
    if (!this.data.noMoreActivity) {
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
  /**
   * 跳转主办方简介编辑界面
   */
  setSponsorIntro: function (e) {
    const { page } = e.currentTarget.dataset
    const { describe, sponsorId } = this.data

    wx.navigateTo({
      url: `/pages/${page}/${page}?describe=${describe}&id=${sponsorId}`
    })
  },
  /**
   * 跳转页面
   */
  navigateToPage: function (e) {
    const { page } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/${page}/${page}`
    })
  },
  tapButtons(e) {
    tapEvents.tapButtons(e)
  },
  backToUserCenter () {
    wx.showModal({
      title: '',
      content: '请下载约杯咖啡APP或前往约杯咖啡官网发布活动',
      success (res) {
        if(res.confirm){
          wx.navigateTo({
            url: '/pages/downloadApp/downloadApp'
          })
        }
      }
    })
  },
  navigateToDetail (e) {
    const { id } = e.currentTarget.dataset
    
    wx.navigateTo({
      url: `/pages/activityDetail/activityDetail?activity_id=${id}`
    })
  },
  navigateToFansList (e) {
    const { num } = e.currentTarget.dataset
    const { sponsorId } = this.data

    if(num != 0) {
      wx.navigateTo({
        url: '/pages/myFans/myFans?id=' + sponsorId 
      })
    }
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
  toggleInput (e) {
    const { id } = e.currentTarget.dataset

    this.setData({
      curEvaId: id ? id : this.data.curEvaId,
      showAnswer: !this.data.showAnswer
    })
  },
  getInputValue (e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  sendInputValue () {
    const { curEvaId, inputValue, sponsorId, prevCreateTime } = this.data
    const that = this

    if (!inputValue) {
      wx.showToast({
        title: '请输入回复内容',
        icon: 'none'
      })
      return
    }
    
    Utils.request({
      url: '/1_4/ActivityEvaluateReplyAdd.aspx',
      params: {
        EvaluateId: curEvaId,
        ReplyUserId: wx.getStorageSync('userMsg').UserId,
        Contents: inputValue,
      }
    })
      .then(res => {
        if (res.Code == 1) {
          wx.showToast({
            title: '回复成功',
            icon: 'none'
          })

          that.getCommentList()
          that.setData({
            inputValue: '',
            showAnswer: false
          })
        } else {
          wx.showToast({
            title: res.tips || '回复失败',
            icon: 'none'
          })
        }
      })
  },
  deleteEvaReply (e) {
    const { id } = e.currentTarget.dataset
    const { sponsorId, prevCreateTime } = this.data
    const that = this

    wx.showModal({
      title: '',
      content: '确定删除当前回复吗？',
      success (res) {
        if (res.confirm) {
          Utils.request({
            url: '/1_4/ActivityEvaluateReplyDel.aspx',
            params: {
              ReplyId: id
            }
          })
            .then(res => {
              if (res.Code == '1') {
                wx.showToast({
                  title: '删除成功',
                  icon: 'none'
                })

                that.getCommentList()
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
  }
})