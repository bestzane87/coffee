const Utils = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  
  onLoad: function (options) {
    this.setData({
      curId: options.user_id
    })
    
    wx.setStorageSync('fromUserId', options.from_user_id || '')
    
    this.getUserMsg(options.user_id)
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    const { u, curId } = this.data
    const userMsg = wx.getStorageSync('userMsg')

    return {
      title: u.NickName + '在约杯咖啡等你哦！',
      path: `/pages/userDetail/userDetail?user_id=${curId}&from_user_id=${userMsg.UserId || ""}`,
      imageUrl: u.HeadImage + '?x-oss-process=image/crop,w_500,h_400,g_center'
    }
  },
  
  // 获取用户详情
  getUserMsg (userId) {
    const userMsg = wx.getStorageSync('userMsg')
    const that = this
    
    Utils.request({
      url: '/1_4/UserInfo.aspx',
      params: {
        FromUserId: userMsg.UserId || '0',
        ToUserId: userId,
        Location: wx.getStorageSync('location') || ''
      }
    })
      .then(res => {
        let photoList = res.Result.UserPhotoList

        photoList = photoList

        that.setData({ 
          u: res.Result,
          photoList: that.splitUrl(res.Result.UserPhotoList),
          dynamicList: that.splitUrl(res.Result.UserDynamicList)
        })
      })
  },
  // 分离数据中的图片链接和视频链接
  splitUrl (arr) {
    return arr.length ? arr.map(item => {
      if (item.Key == 3) {
        return {
          type: 'video',
          postUrl: item.Value.split(';')[0],
          videoUrl: item.Value.split(';')[1]
        }
      } else if (item.Key == 2) {
        return {
          type: 'pic',
          postUrl: item.Value
        }
      }
    }) : []
  },

  navigateToDownload (e) {
    const { bottom } = e.currentTarget.dataset
    
    wx.showModal({
      title: '',
      content: bottom ? '下载约杯咖啡APP立即脱单' : '下载约杯咖啡APP查看更多',
      success (res) {
        if(res.confirm){
          wx.navigateTo({
            url: '/pages/downloadApp/downloadApp'
          })
        }
      }
    })
  },
  showImgList (e) {
    const { post } = e.currentTarget.dataset
    let photos = this.data.photoList.filter(item => item.type == 'pic')
    photos = photos.map(item => item.postUrl)
    wx.previewImage({
      urls: photos,
      current: post
    })
  },
  // 预览视频
  previewVideo () {
     
  }
})