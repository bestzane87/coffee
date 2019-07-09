const Utils = require('../../utils/util.js')
const constants = require('../../utils/constants.js')
const NIM = require('../../utils/NIM_Web_NIM_weixin_v6.0.0.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 目前显示的avatar
    avatarUrl: '',
    nickname: '',
    // 头像是否更改标记，保存时如果为true，则调用修改头像接口
    avatarChanged: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()
    const userMsg = wx.getStorageSync('userMsg')
    
    this.setData({
      avatarUrl: userMsg.HeadImage,
      nickname: userMsg.NickName
    })
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

  },
  /**
   * 跳转裁剪头像页面
   */
  navigateToCut () {
    wx.chooseImage({
      count: 1,
      sizeType: 'compressed',
      success (res) {
        const path = res.tempFilePaths[0]

        wx.navigateTo({
          url: '/pages/cropper/cropper?path=' + path
        })
      }
    })
  },
  /**
   * 
   */
  updateUserMsg () {
    
  },
  /**
   * 上传头像
   */
  uploadAvatar () {
    const that = this
    const userMsg = wx.getStorageSync('userMsg')
    const { avatarChanged } = this.data

    var file = this.data.avatarUrl
    var myDate = new Date().getTime()
    var namePath = userMsg.QiyuId + Utils.formatTimeYY(new Date())
    var ossPath = 'Users/' + namePath

    // 头像有修改才上传头像
    if (avatarChanged) {
      wx.showLoading({
        title: '加载中',
      })
      wx.uploadFile({
        url: constants.ossUrl,
        filePath: file,
        name: 'file',
        formData: {
          name: file,
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
            url: '/1_4/UserHeadImageUpdate.aspx',
            params: {
              UserId: userMsg.UserId,
              HeadImage: namePath + '.jpg'
            }
          })
            .then(res => {
              wx.hideLoading()
              if (res.Code == '1') {
                // 更新用户数据
                that.addUserMsg()
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
    }else{
      that.addUserMsg()
    }
  },
  addUserMsg () {
    const { nickname, avatarUrl, avatarChanged } = this.data
    const userMsg = wx.getStorageSync('userMsg')

    // 昵称为空时不请求
    if (!nickname) {
      wx.showToast({
        title: '昵称不能为空',
        duration: 2000,
        icon: 'none'
      })
      return
    }

    // 更新数据请求的参数
    const {
      UserId,
      EmotionState,
      NickName,
      Sex,
      Birthday,
      MonthIncomeMin,
      MonthIncomeMax,
      WorkArea,
      Education,
      MarriageState,
      Height,
      Weight,
      ShapeState,
      BabyState,
      BabyWant,
      Profession,
      HouseState,
      CarState,
      NativePlace,
      SmokingState,
      DrinkState,
      Constellation,
      Nation,
      MarryWant,
      ToAgeMin,
      ToAgeMax,
      ToHeightMin,
      ToHeightMax,
      ToMonthIncomeMin,
      ToMonthIncomeMax,
      ToEducation,
      ToMarriageState,
      ToShapeState,
      ToWorkArea,
      ToBabyState,
      ToBabyWant,
      ToSmokingState,
      ToDrinkState,
      ToPhotoState,
      Location
    } = userMsg

    const params = {
      UserId,
      EmotionState,
      NickName: nickname,
      Sex,
      Birthday,
      MonthIncomeMin,
      MonthIncomeMax,
      WorkArea,
      Education,
      MarriageState,
      Height,
      Weight,
      ShapeState,
      BabyState,
      BabyWant,
      Profession,
      HouseState,
      CarState,
      NativePlace,
      SmokingState,
      DrinkState,
      Constellation,
      Nation,
      MarryWant,
      ToAgeMin,
      ToAgeMax,
      ToHeightMin,
      ToHeightMax,
      ToMonthIncomeMin,
      ToMonthIncomeMax,
      ToEducation,
      ToMarriageState,
      ToShapeState,
      ToWorkArea,
      ToBabyState,
      ToBabyWant,
      ToSmokingState,
      ToDrinkState,
      ToPhotoState,
      Location
    }

    Utils.request({
      url: '/1_4/UserUpdate.aspx',
      params
    })
      .then(res => {
        if (res.Code == '2') {
          const d = res.Result
          // 请求成功，更新缓存中的数据
          wx.setStorageSync('userMsg', d)

          // 更新群聊中的头像和昵称
          const nim = NIM.getInstance({
            appKey: constants.appKey,
            account: d.UserId,
            token: 'qiyu' + d.UserId,
            onconnect(res) {
              nim.updateMyInfo({
                nick: d.NickName,
                avatar: d.HeadImage,
                done(err, res) {
                  wx.navigateBack({
                    success (){
                      nim.disconnect();
                    }
                  })
                }
              })
            }
          })
        } else if (res.Code == '1') {
          const d = res.Result
          // 请求成功，更新缓存中的数据
          wx.setStorageSync('userMsg', d)

          wx.showToast({
            title: res.Tips,
            icon: 'none'
          })

          setTimeout(() => {
            wx.navigateBack()
          }, 1000)
        } else {
          wx.showToast({
            title: res.Tips,
            duration: 2000,
            icon: 'none'
          })
        }
      })
  },
  setNickname (e) {
    const nickname = e.detail.value

    if(!nickname){
      wx.showToast({
        title: '昵称不能为空',
        duration: 2000,
        icon: 'none'
      })
    }else{
      this.setData({ nickname })
    }
  }
})