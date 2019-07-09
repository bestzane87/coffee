// pages/enrollerSearch/enrollorSearch.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ageArr: [],
    heightArr: [],
    eduArr: [],
    ageText: '',
    ageMin: '',
    ageMax: '',
    heightMin: '',
    heightMax: '',
    edu: '',
    eduText: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()
    
    let age = 18, height = 110
    let ageArr = ['不限'], heightArr = ['不限']
    for(let i = age; i < 61; i++) {
      ageArr.push(i)
    }
    for(let i = height; i < 220; i++) {
      heightArr.push(i + 'cm')
    }
    let eduArr = ['不限','高中及以下','中专','大专','本科','硕士','博士']

    this.setData({
      ageArr,
      heightArr,
      eduArr,
      id: options.id
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
  handleAgeChange (e) {
    const { value } = e.detail
    const { ageArr } = this.data

    if (value[0] > value[1] && ageArr[value[1]] != '不限') {
      wx.showToast({
        title: '最小值不可大于最大值',
        icon: 'none'
      })

      return
    }

    let ageText = ''
    if (ageArr[value[0]] == '不限' && ageArr[value[1]] != '不限') {
      ageText = ageArr[value[1]] + '以下'
    } else if (ageArr[value[0]] != '不限' && ageArr[value[1]] == '不限') {
      ageText = ageArr[value[0]] + '以上'
    } else if (ageArr[value[0]] == '不限' && ageArr[value[1]] == '不限'){
      ageText = ''
    } else if (ageArr[value[0]] == ageArr[value[1]]) {
      ageText = ageArr[value[0]]
    } else {
      ageText = `${ageArr[value[0]]}-${ageArr[value[1]]}`
    }

    this.setData({
      ageMin: value[0] == 0 ? '' : ageArr[value[0]],
      ageMax: value[1] == 0 ? '' : ageArr[value[1]],
      ageText
    })
  },

  handleHeightChange(e) {
    const { value } = e.detail
    const { heightArr } = this.data

    if (value[0] > value[1] && heightArr[value[1]] != '不限') {
      wx.showToast({
        title: '最小值不可大于最大值',
        icon: 'none'
      })

      return
    }

    let heightText = ''
    if (heightArr[value[0]] == '不限' && heightArr[value[1]] != '不限') {
      heightText = heightArr[value[1]] + '以下'
    } else if (heightArr[value[0]] != '不限' && heightArr[value[1]] == '不限') {
      heightText = heightArr[value[0]] + '以上'
    } else if (heightArr[value[0]] == '不限' && heightArr[value[1]] == '不限') {
      heightText = ''
    } else if (heightArr[value[0]] == heightArr[value[1]]) {
      heightText = heightArr[value[0]]
    } else {
      heightText = `${heightArr[value[0]]}-${heightArr[value[1]]}`
    }


    this.setData({
      heightMin: value[0] == 0 ? '' : parseInt(heightArr[value[0]]),
      heightMax: value[1] == 0 ? '' : parseInt(heightArr[value[1]]),
      heightText
    })
  },
  handleEduChange (e) {
    const {value} = e.detail
    const { eduArr } = this.data

    let eduText
    console.log(value)
    if (value == 0) {
      eduText = ''
    } else if (value == 1) {
      eduText = eduArr[value]
    } else {
      eduText = eduArr[value] + '及以上'
    }

    this.setData({
      edu: value == '0' ? '' : eduArr[value],
      eduText
    })
  },
  ensureSearch () {
    const { ageMin, ageMax, heightMin, heightMax, edu, id } = this.data
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    console.log(111)
    prevPage.setData({
      activityId: id,
      AgeMin: ageMin || '',
      AgeMax: ageMax || '',
      HeightMin: heightMin || '',
      HeightMax: heightMax || '',
      Education: edu || '',
      LastEnrollCode: '',
      chooseList: [],
      noMore: false,
    }, () => {
      prevPage.getChooseList()
    })
    
    setTimeout(() => {
      wx.navigateBack()
    }, 300)
  }
})