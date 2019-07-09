const Utils = require('../../utils/util.js')
const constants = require('../../utils/constants.js')

// pages/activity/activity.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    pageIndex: 1,
    // 排序参数，当做key获取value,默认综合排序
    sortItem: 'StartTime',
    // 筛选条件没有数据时文字提示
    noActivity: false,
    // 下拉操作没有数据时底部提示开关
    noData: false,
    // 初始化排序筛选参数
    allType: '0',
    allTime: '0',
    allCost: '0',
    multiple: '0',
    allTypeText: '全类型',
    allTimeText: '全时段',
    allCostText: '全价格',
    multipleText: '综合排序',
    lastItem: '',
    // 是否展开tab列表项
    showMenu: false,
    // 目前点选的tab
    checked: '',
    queueList: [
      { title: '全类型', id: 'allType'},
      { title: '全时段', id: 'allTime'},
      { title: '全价格', id: 'allCost'},
      { title: '综合排序', id: 'multiple'}
    ],
    actList: [],
    showPage: false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let msg = wx.getStorageSync('userMsg')

    if (msg) {
      this.setData({
        showPage: true
      })
    } else {
      let pageUrl = `/pages/activity/activity${options.from_user_id ? '?fromUserId=' + options.from_user_id : ''}`
      
      wx.redirectTo({
        url: `/pages/chooseLogin/chooseLogin?pageUrl=${encodeURIComponent(pageUrl)}`
      })
      return
    }

    if(options.from_user_id){
      wx.setStorageSync('fromUserId', options.from_user_id)
    }

    const city = wx.getStorageSync('city')
    const userMsg = wx.getStorageSync('userMsg')

    if (userMsg) {
      this.getUserCenterNum(userMsg.UserId)
    }
    
    this.setData({ lastItem: '' }, () => {
      this.getActivityList()
        .then(actList => {
          this.setData({
            curCity: city || '杭州',
            actList,
            pageIndex: actList.length ? 2 : 1,
            lastItem: actList.length ? actList[actList.length - 1] : ''
          }, () => this.setData({ noData: !this.data.actList.length }))
        })
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
   *
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
    this.setData({
      pageIndex: 1
    }, () => {
      this.getActivityList('')
        .then(actList => {
          this.setData({
            noData: false,
            actList,
            pageIndex: actList.length ? 2 : 1,
            lastItem: actList.length ? actList[actList.length - 1] : ''
          })
        })
    })
  },
  
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // 当上一次请求数据条数不满10条，表示已无更多数据，再次下拉不再请求数据
    if(!this.data.noData){
      const that = this
      this.getActivityList()
        .then(actList => {
          this.setData({
            actList: [...this.data.actList, ...actList],
            pageIndex: actList.length ? this.data.pageIndex + 1 : this.data.pageIndex,
            lastItem: actList.length ? actList[actList.length - 1] : this.data.actList[this.data.actList.length - 1],
            noData: !actList.length
          })
        })
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    const userMsg = wx.getStorageSync('userMsg')
    return {
      path: `/pages/activity/activity?from_user_id=${userMsg.UserId || ""}`
    }
  },
  
  /**
   * 点击topbar的tab响应事件
   */
  toggleList: function(e){
    const { type } = e.currentTarget.dataset
    
    this.setData({
      showMenu: type === this.data.checked ? false : true,
      checked: type === this.data.checked ? '' : type,
      typeList: Object.keys(constants[type])
    })
  },
  /**
   * 点击tab列表项响应事件
   */
  chooseType: function(e){
    const { name, title, index } = e.currentTarget.dataset
    let sortItem
    const that = this
    // 当父级菜单为最右侧展开，点选后需要改变排序参数
    if (this.data.checked === 'multiple') {
      sortItem = constants.multipleObj[name]
    }
    // 选择最近距离需要传入location信息
    if(name == '最近距离'){
      const {location} = getApp().globalData
      if(!location){
        wx.getSetting({
          success (res) {
            const locationAuth = res.authSetting['scope.userLocation']
            if (locationAuth == false) {
              wx.showModal({
                title: '',
                content: '定位服务未开启，请前往设置',
                confirmText: '立即前往',
                success (res) {
                  if(res.confirm){
                    wx.openSetting({
                      success (res) {
                        console.log(res)
                        if (res.authSetting['scope.userLocation']){
                          wx.getLocation({
                            success: function(res) {
                              wx.setStorageSync('location', `${res.longitude},${res.latitude}`)

                              wx.reLaunch({
                                url: '/pages/activity/activity',
                              })
                            }
                          })
                        }
                      }
                    })
                  }else{
                    wx.showToast({
                      title: '获取位置信息失败',
                      duration: 2000,
                      icon: 'none'
                    })
                  }
                }
              })
            }else {
              that.setData({
                sortItem: sortItem || this.data.sortItem,
                [title]: constants[title][name],
                [that.data.checked + 'Text']: name,
                // 点选展开的菜单栏后，隐藏菜单栏，选中的主菜单也取消选中 
                showMenu: false,
                checked: '',
                actList: [],
                pageIndex: 1
              }, () => {
                that.getActivityList('')
                  .then(actList => {
                    that.setData({
                      actList,
                      pageIndex: actList.length ? 2 : 1,
                      lastItem: actList.length ? actList[actList.length - 1] : '',
                      noActivity: actList.length ? false : true
                    }, () => that.setData({ noData: !that.data.actList.length }))
                  })
              })
            }
          }
        })
      }else{
        that.setData({
          sortItem: sortItem || that.data.sortItem,
          [title]: constants[title][name],
          [that.data.checked + 'Text']: name,
          // 点选展开的菜单栏后，隐藏菜单栏，选中的主菜单也取消选中 
          showMenu: false,
          checked: '',
          actList: [],
          pageIndex: 1
        }, () => {
          that.getActivityList('')
            .then(actList => {
              that.setData({
                actList,
                pageIndex: actList.length ? 2 : 1,
                lastItem: actList.length ? actList[actList.length - 1] : '',
                noActivity: actList.length ? false : true
              }, () => that.setData({ noData: !that.data.actList.length }))
            })
        })
      }
    }else{
      this.setData({
        sortItem: sortItem || this.data.sortItem,
        [title]: constants[title][name],
        [this.data.checked + 'Text']: name,
        // 点选展开的菜单栏后，隐藏菜单栏，选中的主菜单也取消选中 
        showMenu: false,
        checked: '',
        actList: [],
        pageIndex: 1
      }, () => {
        this.getActivityList('')
          .then(actList => {
            this.setData({
              actList,
              pageIndex: actList.length ? 2 : 1,
              lastItem: actList.length ? actList[actList.length - 1] : '',
              noActivity: actList.length ? false : true
            }, () => this.setData({ noData: !this.data.actList.length }))
          })
      })

    }
  },
  /**
   * 根据排序条件筛选活动
   * @lastItem 为最后一条数据，用于服务器获取分页数据
   */
  getActivityList: function (lastItem = this.data.lastItem){
    const d = this.data
    const city = wx.getStorageSync('city')
    
    return new Promise((resolve, reject) => {
      Utils.request({
        url: '/1_4/ActivityList.aspx',
        params: {
          City: city || '杭州',
          Type: d.allType,
          Date: d.allTime,
          Price: d.allCost,
          Location: wx.getStorageSync('location'),
          OrderByKey: d.multiple,
          PageIndex: d.pageIndex,
          LastDateIsState: lastItem ? lastItem.IsState : '',
          OrderByValue: lastItem ? lastItem[d.sortItem] : ''
        }
      })
        .then(res => {
          const actList = res.Result ? res.Result : []
          
          resolve(actList)
        })
    })
  },
  /**
   * 跳转活动详情页面
   */
  skipToDetail: function (e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/activityDetail/activityDetail?activity_id=${id}`
    })
  },
  chooseCity () {
    wx.navigateTo({
      url: '/pages/chooseCity/chooseCity'
    })
  },
  tapHelper () {
    wx.showModal({
      title: '',
      content: '请下载约杯咖啡APP体验小助手功能'
    })
  },
  // 获取个人中心的数字显示
  getUserCenterNum(id) {
    const that = this
    const curDate = Utils.formatTimeYMD(new Date())
    Utils.request({
      url: '/1_4/UserCenterNew.aspx',
      params: {
        UserId: id,
        LastSeeMeDateTime: curDate,
        LastLightenMeDateTime: curDate
      }
    })
      .then(res => {
        const d = res.Result
        let userMsg = wx.getStorageSync('userMsg')
        
        if (d.ActivityWaitVerifyNumber || d.ActivityWaitPayNumber || d.ActivityWaitJoinNumber || d.ActivityWaitEvaluateNumber){
          wx.showTabBarRedDot({ index: 1 })
        }else{
          wx.hideTabBarRedDot({index: 1})
        }
      })
  }
})