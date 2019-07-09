const Utils = require('../../utils/util.js')
const constants = require('../../utils/constants.js')
const date = new Date()
const years = []
const months = []
const days = []
import pca from '../../utils/city.js'

for (let i = 1960; i <= date.getFullYear() - 18; i++) {
  years.push(i)
}

for (let i = 1; i <= 12; i++) {
  months.push(i)
}

for (let i = 1; i <= 31; i++) {
  days.push(i)
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showTips: false,
    src: '',
    years,
    year: date.getFullYear(),
    months,
    month: 1,
    days,
    day: 1,
    value: [30, 0, 0],
    emotionStates: ['单身', '恋爱中', '已婚'],
    educationArr: constants.educationArr,
    salaryArr: constants.salaryArr
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu()
    this.initCityData([0, 0, 0])
    this.initCareerData([0, 0])
    const userMsg = wx.getStorageSync('userMsg')
    
    this.setData({
      gender: userMsg.Sex,
      birthday: userMsg.Birthday,
      emotion: userMsg.EmotionState,
      education: userMsg.Education,
      // 都为0，则未设置收入，需要显示
      salary: '',
      workPlace: userMsg.WorkArea,
      career: userMsg.Profession,
      avatarUrl: userMsg.HeadImage && userMsg.HeadImage.indexOf('default') > 0 ? '' : userMsg.HeadImage,
    })

    this.cropper = this.selectComponent('#image-cropper')
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

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
   * 选择性别
   */
  resetMsg(e) {
    const {
      state,
      setting
    } = e.currentTarget.dataset

    this.setData({
      [setting]: state
    })
  },
  /**
   * 获取出生年月日
   */
  bindChange(e) {
    const val = e.detail.value
    console.log(val)
    const year = years[val[0]],
      month = months[val[1]],
      day = days[val[2]]
    let d
    let fullYear = [1, 3, 5, 7, 8, 10, 12]

    if (month == 2 && ((year % 4 === 0) && ((year % 100) !== 0))) {
      // 如果为闰年，2月有29天
      d = days.slice(0, 29)
    } else if (month == 2) {
      // 为非闰年，2月有28天
      d = days.slice(0, 28)
    } else if (fullYear.indexOf(month) > -1) {
      // 为单数月份
      d = days
    } else {
      d = days.slice(0, 30)
    }

    this.setData({
      year,
      month,
      day,
      days: d
    })
  },
  /**
   * 点击下一步获取出生日期
   */
  getBirthday() {
    const {
      year,
      month,
      day
    } = this.data
    this.setData({
      birthday: `${year}-${this.addZero(month)}-${this.addZero(day)}`
    })
  },
  /**
   * 给月日加上0
   * @d {number} 需要转换的参数
   */
  addZero(d) {
    return String(d).length == 1 ? `0${d}` : d
  },
  getWorkPlace(e) {
    const {
      provinces,
      citys,
      areas,
      regionValue
    } = this.data
    const workPlace = `${provinces[regionValue[0]]}-${citys[regionValue[1]]}-${areas[regionValue[2]]}`

    this.setData({
      workPlace
    })
  },
  /**
   * 处理城市数据
   * @arr {array} 长度为三的数组，三项分别代表省市区的下标
   */
  initCityData(arr) {
    const provinces = Object.keys(pca)
    const citys = Object.keys(pca[provinces[arr[0]]])
    const d = pca[provinces[arr[0]]]
    const areas = d[citys[arr[1]]]

    this.setData({
      provinces,
      citys,
      areas,
      regionValue: arr
    })
  },
  bindRegionChange(e) {
    const curRegion = e.detail.value

    this.initCityData(curRegion)
  },
  /**
   * 处理职业数据
   * @arr {array} 长度为二的数组
   */
  initCareerData(arr = [0, 0]) {
    const {
      professionArr
    } = constants
    const professions = professionArr.map(item => item.parent)
    const careers = professionArr[arr[0]].children

    this.setData({
      professions,
      careers,
      careerValue: arr
    })
  },
  bindCareerChange(e) {
    this.initCareerData(e.detail.value)
  },
  getCareer() {
    const {
      professions,
      careers,
      careerValue
    } = this.data
    this.setData({
      career: `${professions[careerValue[0]]}-${careers[careerValue[1]]}`
    })
  },
  /**
   * 上传头像到oss，接口修改用户头像并修改本地缓存头像
   */
  chooseAvatar() {
    const that = this
    const userMsg = wx.getStorageSync('userMsg')

    var file = this.data.avatarUrl
    var myDate = new Date().getTime()
    var namePath = userMsg.QiyuId + Utils.formatTimeYY(new Date())
    var ossPath = 'Users/' + namePath

    if (file.indexOf('tmp') > 0) {
      wx.showLoading({
        title: '加载中'
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
        success: function(res) {
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
                const avatarUrl = constants.ossUrl + '/' + ossPath + '.jpg'
                that.setData({
                  avatarUrl
                }, () => {
                  // 更新用户数据
                  that.addUserMsg()
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
    } else {
      that.addUserMsg()
    }
  },
  toCutAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: 'compressed',
      success(res) {
        const path = res.tempFilePaths[0]
        
        wx.navigateTo({
          url: '/pages/cropper/cropper?path=' + path
        })
      }
    })
  },
  loadimage(e) {
    wx.hideLoading();
    //重置图片角度、缩放、位置
    this.cropper.imgReset();
  },
  /**
   * 选取裁剪区域的图片
   */
  cutImg() {
    const that = this
    this.cropper.getImg(function(obj) {
      that.setData({
        cutImgUrl: obj.url,
        cutAvatar: !that.data.cutAvatar
      })
    })
  },
  cancelChoose() {
    this.setData({
      cutAvatar: !this.data.cutAvatar
    })
  },
  /**
   * 显示是否隐身的弹窗
   */
  showOnlineModal() {
    const that = this
    const userMsg = wx.getStorageSync('userMsg')
    // IsInvite 为“1”不弹框，为“0”弹框
    if (userMsg.IsInvite == '0') {
      this.setData({ showTips: true })
    }else{
      this.chooseAvatar()
    }
  },
  /**
   * 设置隐身
   * @state {string} 隐身状态，1是正常，2是隐身
   */
  toggleOnlineState(e) {
    const userMsg = wx.getStorageSync('userMsg')
    const that = this
    this.setData({ showTips: false })
    Utils.request({
      url: '/1_4/UserIsStateUpdate.aspx',
      params: {
        UserId: userMsg.UserId,
        IsState: e.currentTarget.dataset.state
      }
    })
      .then(res => {
        that.chooseAvatar()
      })
  },
  /**
   * 设置个人资料
   */
  addUserMsg() {
    const userMsg = wx.getStorageSync('userMsg')

    const {
      gender,
      birthday,
      emotion,
      education,
      salary,
      workPlace,
      career,
      avatarUrl
    } = this.data
    const nickName = wx.getStorageSync('nickName')

    // 筛选收入数组
    const curSalaryObj = constants.salaryObj.filter(item => item.salaryText === salary)[0]

    // 更新数据请求的参数
    const params = {
      UserId: userMsg.UserId,
      EmotionState: emotion,
      NickName: userMsg.NickName || nickName,
      Sex: gender,
      Birthday: birthday,
      MonthIncomeMin: curSalaryObj.min,
      MonthIncomeMax: curSalaryObj.max,
      WorkArea: workPlace,
      Education: education,
      MarriageState: '',
      Height: '',
      Weight: '',
      ShapeState: '',
      BabyState: '',
      BabyWant: '',
      Profession: career,
      HouseState: '',
      CarState: '',
      NativePlace: '',
      SmokingState: '',
      DrinkState: '',
      Constellation: '',
      Nation: '',
      MarryWant: '',
      ToAgeMin: '',
      ToAgeMax: '',
      ToHeightMin: '',
      ToHeightMax: '',
      ToMonthIncomeMin: '',
      ToMonthIncomeMax: '',
      ToEducation: '',
      ToMarriageState: '',
      ToShapeState: '',
      ToWorkArea: '',
      ToBabyState: '',
      ToBabyWant: '',
      ToSmokingState: '',
      ToDrinkState: '',
      ToPhotoState: '',
      Location: ''
    }

      Utils.request({
        url: '/1_4/UserUpdate.aspx',
        params
      })
      .then(res => {
        wx.hideLoading()
        if (res.Code == '1') {
          // 请求成功，更新缓存中的数据
          wx.setStorageSync('userMsg', res.Result)

          wx.navigateBack()
        } else if (res.Code == '2'){
          wx.setStorageSync('userMsg', res.Result)
          
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
                    success() {
                      nim.disconnect();
                    }
                  })
                }
              })
            }
          })
        } else {
          wx.showToast({
            title: res.Tips,
            duration: 2000,
            icon: 'none'
          })
        }
      })
  },
  hideTipsModal () {
    this.setData({ showTips: false })
  }
})