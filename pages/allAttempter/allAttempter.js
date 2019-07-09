const Utils = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 心动列表
    heartedArr: [],
    chooseList: [],
    LastEnrollCode: '',
    // 请求开关
    noMore: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()
    this.setData({
      activityId: options.id,
      AgeMin: options.ageMin || '',
      AgeMax: options.ageMax || '',
      HeightMin: options.heightMin || '',
      HeightMax: options.heightMax || '',
      Education: options.edu || ''
    }, () => this.getChooseList())
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const height = wx.getSystemInfoSync().windowHeight

    this.setData({
      height: height * 2 - 134 - 1
    })
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
   * 获取互选列表
   * @id {string} 活动id
   */
  getChooseList() {
    const userMsg = wx.getStorageSync('userMsg')
    const that = this
    const {
      LastEnrollCode,
      activityId,
      chooseList,
      noMore,
      AgeMax,
      AgeMin,
      HeightMax,
      HeightMin,
      Education
    } = this.data
    if (!noMore) {
      Utils.request({
        url: '/1_5/ActivitySelectOptional.aspx',
        params: {
          ActivityId: activityId,
          UserId: userMsg.UserId,
          Location: wx.getStorageSync('location') || '',
          LastEnrollCode,
          AgeMax,
          AgeMin,
          HeightMax,
          HeightMin,
          Education
        }
      })
        .then(res => {
          if (res.Result) {
            const newList = res.Result.map(item => {
              return {
                ...item,
                // 控制右侧爱心点亮
                choosed: false
              }
            })
            that.setData({
              count: res.Tips,
              chooseList: [...chooseList, ...newList],
              activityId,
              LastEnrollCode: newList[newList.length - 1].EnrollCode
            })
          } else {
            that.setData({
              noMore: true
            })
          }
        })
    }
  },
  /**
   * 点击嘉宾，更新数据，添加心动列表
   */
  chooseUser(e) {
    const {
      id,
      index
    } = e.currentTarget.dataset
    let {
      heartedArr,
      chooseList,
      count
    } = this.data
    const i = heartedArr.indexOf(id)

    // 点击的id存在于当前所选id数组中，移除
    if (i > -1) {
      heartedArr.splice(i, 1)
    } else {
      // 当前所选id数组已满，给出提示，不再往下执行，直接返回
      if (heartedArr.length == count) {
        wx.showModal({
          title: '',
          content: '互选人数最多' + count + '人'
        })
        return
      } else {
        // 当前所选数组未满，添加
        heartedArr.push(id)
      }
    }
    // 渲染并保存数据
    chooseList = chooseList.map(item => {
      if (heartedArr.indexOf(item.UserSimple.UserId) > -1) {
        return {
          ...item,
          choosed: true
        }
      } else {
        return {
          ...item,
          choosed: false
        }
      }
    })
    this.setData({
      chooseList,
      heartedArr
    })
  },
  /**
   * 传递互选结果
   */
  saveChooseResult() {
    const that = this
    const {
      activityId,
      heartedArr
    } = this.data
    const userMsg = wx.getStorageSync('userMsg')

    if (heartedArr.length) {
      wx.showModal({
        title: '',
        content: '确定提交吗？提交后无法修改',
        success(res) {
          if (res.confirm) {
            Utils.request({
              url: '/1_4/ActivitySelectAdd.aspx',
              params: {
                ActivityId: activityId,
                FromUserId: userMsg.UserId,
                ToUserIdString: heartedArr.join(',')
              }
            })
              .then(res => {
                if (res.Code == '1') {
                  wx.redirectTo({
                    url: `/pages/chooseList/chooseList?activityId=${activityId}&userId=${userMsg.UserId}`
                  })
                } else {
                  wx.showToast({
                    title: '互选失败',
                    duration: 2000,
                    icon: 'none'
                  })
                }
              })
          }
        }
      })
    } else {
      wx.showModal({
        title: '',
        content: '请至少选择一位嘉宾'
      })
    }
  },
  getAvatarDetail(e) {
    const { id } = e.currentTarget.dataset

    wx.navigateTo({
      url: '/pages/userDetail/userDetail?user_id=' + id
    })
  },
  navigateToEnrollerSearch() {
    const { activityId } = this.data
    wx.navigateTo({
      url: '/pages/enrollerSearch/enrollorSearch?id=' + activityId
    })
  }
})