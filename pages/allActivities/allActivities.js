const constants = require('../../utils/constants.js')
const Utils = require('../../utils/util.js')
import tapEvents from '../../template/template.js'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    labels: constants.labels,
    LastDataCreateTime: '',
    activityList: [],
    noMore: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu()
    this.setData({ curIndex: options.state ? options.state : '0' })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    // 获取屏幕可视区高度，计算scroll-view的高度
    const height = wx.getSystemInfoSync().windowHeight
    // 92为顶部scroll-view的高度，22为顶部灰色边框的高度
    this.setData({
      height: height * 2 - 92 - 22
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // this.getDescModalText()
    this.setData({
      noMore: false,
      LastDataCreateTime: '',
      activityList: []
    }, () => this.getActivityList())
  },
  
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    const userMsg = wx.getStorageSync('userMsg')
    const { shareInfo } = this.data
    
    return {
      title: shareInfo.Title,
      path: `/pages/activityDetail/activityDetail?activity_id=${shareInfo.ActivityId}&from_user_id=${userMsg.UserId || ""}&share=1`,
      imageUrl: shareInfo.PosterImage + '?x-oss-process=image/crop,w_500,h_400,g_center'
    }
  },
  /**
   * 切换活动类型
   */
  changeActivityLabel: function(e) {
    const {curIndex} = this.data
    const { index } = e.currentTarget.dataset
    
    if(curIndex != index){
      this.setData({
        curIndex: index,
        LastDataCreateTime: '',
        activityList: [],
        noMore: false
      }, () => this.getActivityList())
    }
  },
  /**
   * 获取活动列表
   */
  getActivityList() {
    const {
      curIndex,
      LastDataCreateTime,
      noMore,
      activityList
    } = this.data
    const userMsg = wx.getStorageSync('userMsg')
    const that = this
    if (!noMore) {
      Utils.request({
          url: '/1_4/ActivityListUser.aspx',
          params: {
            IsState: curIndex,
            UserId: userMsg.UserId,
            LastDataCreateTime
          }
        })
        .then(res => {
          const r = res.Result
          if (res.Result) {
            that.setData({
              activityList: [...activityList, ...r],
              LastDataCreateTime: r[r.length - 1].Activity.CreateTime
            })
          } else {
            that.setData({
              noMore: true
            })
          }
        })
    }
  },
  tapButtons (e) {
    tapEvents.tapButtons(e)
  },
  navigateToDetail (e) {
    const { id } = e.currentTarget.dataset

    wx.navigateTo({
      url: '/pages/enrollActivityDetail/enrollActivityDetail?id=' + id
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
            title: res.Tips,
            icon: 'none'
          })
          return
        }

        that.setData({
          shareInfo: res.Result,
          showShareImg: true
        })
      })
  },
  deleteActivityItem (e) {
    let { activityList } = this.data
    let { index, id } = e.currentTarget.dataset
    const that = this

    wx.showModal({
      title: '',
      content: '确定删除当前活动吗',
      success (res) {
        if (res.confirm) {
          Utils.request({
            url: '/1_4/ActivityEnrollDel.aspx',
            params: {
              EnrollId: id
            }
          })
            .then(res => {
              if (res.Code == 1) {
                wx.showToast({
                  title: '删除成功',
                  icon: 'none'
                })
                activityList.splice(index, 1)
                that.setData({ activityList })
              } else {
                wx.showToast({
                  title: res.Tips || '操作失败',
                  icon: 'none'
                })
              }
            })
        }
      }
    })
  },
  toggleShowModal() {
    this.setData({
      content: this.data.shareInfo.RewardText.split('\n'),
      showShareContent: !this.data.showShareContent
    })
  }
})