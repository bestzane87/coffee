const Utils = require('../../utils/util.js')
import tapEvents from '../../template/template.js'

Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    showPage: false,
    showShareContent: false
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const userMsg = wx.getStorageSync('userMsg')
    
    if (!userMsg) {
      let pageUrl = `/pages/activityDetail/activityDetail?activity_id=${options.activity_id}${options.from_user_id ? '&from_user_id=' + options.from_user_id : ''}&share=true`

      wx.setStorageSync('pageUrl', pageUrl)
      
      wx.redirectTo({
        url: `/pages/chooseLogin/chooseLogin`
      })

      return

    } else {
      this.setData({
        showPage: true
      })
    }

    this.setData({
      options,
      fromUserId: options.from_user_id || '',
      share: options.share || '',
    })
    
    wx.setStorageSync('activityId', options.activity_id)
    
    if (options.from_user_id) {
      wx.setStorageSync('fromUserId', options.from_user_id)
    }
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  shareActivity () {
    const userMsg = wx.getStorageSync('userMsg')
    const { activityId } = this.data
    
    if (!userMsg) {
      wx.navigateTo({
        url: `/pages/login/login?id=${activityId}&pageFrom=1`
      })
      return
    }

    this.getShareImg(activityId)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.showPage) {
      const activityId = wx.getStorageSync('activityId')
      this.getActicityDetail(activityId)
    }

    // this.getDescModalText()
  },
  /**
   * 获取活动分享图片
   */
  getShareImg () {
    const that = this
    const userMsg = wx.getStorageSync('userMsg')
    wx.showLoading({
      title: ''
    })
    Utils.request({
      url: '/1_4/ActivityShare.aspx',
      params: {
        UserId: userMsg.UserId,
        ActivityId: that.data.activityId
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
    const { activityMsg } = this.data
    const userMsg = wx.getStorageSync('userMsg')
    
    return {
      title: activityMsg.Title,
      path: `/pages/activityDetail/activityDetail?activity_id=${activityMsg.ActivityId}&from_user_id=${userMsg.UserId || ""}&share=1`,
      imageUrl: activityMsg.PosterImage + '?x-oss-process=image/crop,w_500,h_400,g_center'
    }
  },
  /**
   * 获取活动详情
   */
  getActicityDetail: function (id) {
    const userMsg = wx.getStorageSync('userMsg')
    const { UserId } = userMsg
    const { options } = this.data

    Utils.request({
      url: '/1_4/ActivityInfo.aspx',
      params: {
        UserId: UserId || '0',
        ActivityId: id,
        EnrollId: options.enrollid || ''
      }
    })
      .then(res => {
        if (res.Code != 1) {
          wx.showToast({
            title: res.Tips,
            icon: 'none'
          })
          return
        }
        const { ManCondition, WoManCondition, UserOrganiser } = res.Result
        this.setData({
          activityId: id,
          sponsorMsg: UserOrganiser,
          activityMsg: res.Result,
          buttons: res.Result.ClickButton.filter(item => !['取消', '编辑', '复制'].includes(item.Value)),
          manCondition: ManCondition.length ? ManCondition.join(' ') : '无',
          womanCondition: WoManCondition.length ? WoManCondition.join(' ') : '无',
        })
        wx.setStorageSync('chatGroupId', res.Result.GroupChatId)
      })
  },
  /**
   * 收藏活动
   */
  handleCollected: function () {
    const that = this
    const userMsg = wx.getStorageSync('userMsg')
    const { UserId } = userMsg
    const { activityId } = this.data

    if (!UserId){
      wx.navigateTo({
        url: `/pages/login/login?id=${activityId}&pageFrom=collection`
      })
    }else{
      Utils.request({
        url: '/1_4/ActivityCollectionAddDel.aspx',
        params: {
          UserId,
          ActivityId: that.data.activityId
        }
      })
        .then(res => {
          that.getActicityDetail(that.data.activityId)
        })
    }
  },
  /**
   * 跳转主办方详情页面
   */
  skipToSponsorDetail: function (e) {
    const { id } = e.currentTarget.dataset
    const userMsg = wx.getStorageSync('userMsg')

    if(userMsg.UserId == id){
      wx.navigateTo({
        url: `/pages/meSponsor/meSponsor?sponsorId=${id}`
      })
    }else{
      wx.navigateTo({
        url: `/pages/sponsorDetail/sponsorDetail?sponsorId=${id}`
      })
    }
  },
  activityAsk() {
    const userMsg = wx.getStorageSync('userMsg')
    const activityid = this.data.activityId

    wx.navigateTo({
      url: `/pages/interlocution/interlocution?id=${activityid}`
    })
  },
  
  tapButtons (e) {
    tapEvents.tapButtons(e)
  },

  showShare () {
    this.setState({ showShareImg: true })
  },

  tapHelper() {
    const { activityId, activityMsg } = this.data
    if (activityMsg.IsLottery.Key == '0') {
      wx.showToast({
        title: activityMsg.IsLottery.Value,
        icon: 'none'
      })
      return
    }
    wx.navigateTo({
      url: '/pages/helpers/helpers?id=' + activityId
    })
  },
  getLocation () {
    const { activityMsg } = this.data
    const location = activityMsg.Location.split(',')

    wx.openLocation({
      latitude: Number(location[1]),
      longitude: Number(location[0]),
      name: activityMsg.Place
    })
  },
  // 进入活动介绍详情
  getActivityDesc () {
    const {activityId} = this.data
    wx.navigateTo({
      url: '/pages/activityInfoDetail/activityInfoDetail?id=' + activityId
    })
  },
  skipToIndex () {
    wx.switchTab({
      url: '/pages/activity/activity'
    })
  },
  hideShareContainer () {
    this.setData({ showShareImg: !this.data.showShareImg })
  },
  downloadShare () {
    const that = this
    wx.showLoading({
      title: ''
    })
    wx.downloadFile({
      url: that.data.shareInfo.QrCodeUrl,
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
  },
  getDescModalText () {
    const that = this

    Utils.request({
      url: '/1_4/ActivityShareRewardText.aspx'
    })
      .then(res => {
        that.setData({ introText: res.Result.Value })
      })
  },
  toggleShowModal () {
    this.setData({
      content: this.data.shareInfo.RewardText.split('\n'),
      showShareContent: !this.data.showShareContent
    })
  }
})