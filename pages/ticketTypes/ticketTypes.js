const Utils = require('../../utils/util.js')
const { ticketTypeObj, verifyTypeObj } = require('../../utils/constants.js')
const constants = require('../../utils/constants.js')
const date = new Date()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    ticketList: [],
    curIndex: -1,
    checkObj: {
      1: '不需要审核',
      2: '报名后需经系统审核',
      3: '报名后需经主办方审核'
    },
    getUserInfo: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()

    this.setData({ activityId: options.id })
    this.getTicketList(options.id)
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
    const userMsg = wx.getStorageSync('userMsg')

    if (userMsg.HeadImage.indexOf('default') > -1) {
      this.setData({ getUserInfo: true })
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /**
   * 点击设置修改票种相关信息
   */
  resetTicketMsg: function (e) {
    const { index } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/modifyTicket/modifyTicket?index=${index}`
    })
  },
  /**
   * 点击新增票种按钮
   */
  addTicket: function () {
    wx.navigateTo({
      url: '/pages/resetTicket/resetTicket'
    })
  },
  /**
   * 获取缓存中的票种信息
   */
  getStorageTickets: function () {
    const ticketList = wx.getStorageSync('ticketList')
    const newList = ticketList.length ? ticketList.map(item => {
      return {
        ...item,
        ticketType: ticketTypeObj[item.ticketType],
        verifyType: verifyTypeObj[item.verifyType],
        ticketDeposit: item.ticketType == '2' ? `押金：￥${item.ticketDeposit}` : `￥${item.ticketDeposit}`
      }
    })
      :
      []

    this.setData({ ticketList: newList })
  },
  /**
   * 删除票种
   */
  deleteTicket: function (e) {
    const { index } = e.currentTarget.dataset
    const that = this

    wx.showModal({
      title: '',
      content: '确定删除当前票种吗？',
      success (res) {
        if(res.confirm){
          let ticketList = wx.getStorageSync('ticketList')
          ticketList.splice(index, 1)

          wx.setStorageSync('ticketList', ticketList)
          
          that.getStorageTickets()
        }
      }
    })
  },
  /**
   * 点击保存，返回上一页
   */
  backToSponsor () {
    wx.navigateBack()
  },
  /**
   * 获取票种列表
   * @id {string} 活动id 
   */
  getTicketList (id) {
    const that = this
    const userMsg = wx.getStorageSync('userMsg')

    Utils.request({
      url: '/1_4/ActivityTicketList.aspx',
      params: {
        ActivityId: id,
        UserId: userMsg ? userMsg.UserId : ''
      }
    })
      .then(res => {
        that.setData({
          ticketList: res.Result.map(item => {
            return {
              ...item,
              ticketT: item.TicketTypeText.split('票')[0],
              startTime: (item.StartTime).replace(/T/, " ").replace(/-/g, "/"),
              endTime: (item.EndTime).replace(/T/, " ").replace(/-/g, "/")
            }
          })
        })
      })
  },
  /**
   * 选择票种
   */
  chooseTicket (e) {
    const { index, text } = e.currentTarget.dataset
    if(text == '售票中'){
      this.setData({curIndex: index})
    }
  },
  /**
   * 缓存票种信息，跳转表单页面
   */
  navigateToForms () {
    const { curIndex, ticketList, activityId } = this.data
    const t = ticketList[curIndex]
    
    if (curIndex == -1) {
      wx.showToast({
        icon: 'none',
        title: '请选择票种'
      })
      
      return
    }

    if(t.IsSold == 1){
    // 缓存票种信息，提交报名信息时提取
      wx.setStorageSync('enrollTicket', ticketList[curIndex])
      
      wx.navigateTo({
        url: `/pages/enrollActivity/enrollActivity?id=${activityId}`
      })
    }else{
      wx.showToast({
        title: '该票暂不可选',
        duration: 2000,
        icon: 'none'
      })
    }
  },
  getLatestUserMsg () {
    const userMsg = wx.getStorageSync('userMsg')

    if (wx.getStorageSync('sex')) {
      wx.removeStorageSync('sex')
    }
    
    if(userMsg){
      Utils.request({
        url: '/1_4/UserDetail.aspx',
        params: {
          UserId: userMsg.UserId
        }
      })
        .then(res => {
          wx.setStorageSync('userMsg', res.Result)
        })
    }
  },
  getUserInfo (e) {
    let avatarUrl
    let that = this

    const { curIndex, ticketList, activityId } = this.data
    const t = ticketList[curIndex]

    if (curIndex == -1) {
      wx.showToast({
        icon: 'none',
        title: '请选择票种'
      })

      return
    }

    if (t.IsSold == 1) {
      // 缓存票种信息，提交报名信息时提取
      wx.setStorageSync('enrollTicket', ticketList[curIndex])

    } else {
      wx.showToast({
        title: '该票暂不可选',
        duration: 2000,
        icon: 'none'
      })
      return
    }









    if (e.detail.errMsg == "getUserInfo:ok") {
      avatarUrl = e.detail.userInfo.avatarUrl
      avatarUrl = avatarUrl.substring(0, avatarUrl.length - 3) + '0'

      // 更新用户头像，调用小程序专用头像接口
      that.updateAvatarUrl(avatarUrl)
    } else {
      wx.navigateTo({
        url: '/pages/enrollActivity/enrollActivity?id=' + that.data.activityId
      })
    }
  },
  // 先保存图片到本地，然后上传临时路径的图片到oss，最后上传到后端
  updateAvatarUrl(avatar) {
    const that = this

    wx.downloadFile({
      url: avatar,
      success(res) {
        console.log(res)
        let userMsg = wx.getStorageSync('userMsg')
        var namePath = userMsg.QiyuId + Utils.formatTimeYY(new Date())
        var ossPath = 'Users/' + namePath

        wx.uploadFile({
          url: constants.ossUrl,
          filePath: res.tempFilePath,
          name: 'file',
          formData: {
            name: res.tempFilePath,
            // key为保存在oss的文件名
            key: ossPath + '.jpg',
            policy: constants.policy,
            OSSAccessKeyId: constants.OSSAccessKeyId,
            signature: constants.signature,
            success_action_status: '200'
          },
          success: function (res) {
            // 上传成功后设置本地头像为已上传照片
            Utils.request({
              url: '/1_4/UserHeadImageUpdateBySmall.aspx',
              params: {
                UserId: userMsg.UserId,
                HeadImage: namePath + '.jpg'
              }
            })
              .then(res => {
                if (res.Code == '1') {
                  const avatarUrl = constants.ossUrl + '/' + ossPath + '.jpg'
                  userMsg = {
                    ...userMsg,
                    HeadImage: avatarUrl
                  }
                  // 更新本地用户数据
                  wx.setStorageSync('userMsg', userMsg)

                  wx.navigateTo({
                    url: '/pages/enrollActivity/enrollActivity?id=' + that.data.activityId
                  })
                } else {
                  wx.showToast({
                    title: res.Tips,
                    duration: 2000,
                    icon: 'none'
                  })
                }
              })
          }
        })
      }
    })
  }
})