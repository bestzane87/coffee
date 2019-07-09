const Utils = require('/utils/util.js')
let { mapKey } = require('/utils/constants.js')

App({
  setActiveState () {
    const { UserId } = wx.getStorageSync('userMsg')
    let location = wx.getStorageSync('location') || ''
    
    if(UserId){
      Utils.request({
        url: '/1_4/UserActiveAdd.aspx',
        params: {
          UserId,
          Location: location || ''
        }
      })
    }
  },
  onLaunch: function () {
    if (wx.getStorageSync('sex')) {
      wx.removeStorageSync('sex')
    }

    if (wx.getStorageSync('roleName')) {
      wx.removeStorageSync('roleName')
    }
    
    const that = this

    const userMsg = wx.getStorageSync('userMsg')

    if (!userMsg) {
      wx.reLaunch({
        url: '/pages/chooseLogin/chooseLogin'
      })
    }
    
    // Utils.request({
    //   url: '/1_4/UserDetail.aspx',
    //   params: {
    //     // UserId: 1053 //依玲
    //     // UserId: 6507 //熊总
    //     UserId: 6830 //测试柏林
    //     // UserId: 235 //测试安卓
    //     // UserId: 1186 //徐晴
    //   }
    // })
    //   .then(res => {
    //     wx.setStorageSync('userMsg', res.Result)
    //   })

    this.setActiveState()
    
    wx.getSetting({
      success (res) {
        const locationAuth = res.authSetting['scope.userLocation']
        if (!locationAuth){
          wx.getLocation({
            success: function (res) {
              wx.request({
                url: 'https://restapi.amap.com/v3/geocode/regeo',
                data: {
                  key: mapKey,
                  location: `${res.longitude},${res.latitude}`,
                  extensions: "all",
                  s: "rsx",
                  sdkversion: "sdkversion",
                  logversion: "logversion"
                },
                success(r) {
                  const city = r.data.regeocode.addressComponent.city || '杭州市'
                  
                  const idx = city.indexOf('市')
                  
                  that.globalData.location = `${res.longitude},${res.latitude}`
                  that.globalData.city = city.substring(0, idx)
                  
                  wx.setStorageSync('city', city.substring(0, idx))

                  wx.setStorageSync('location', `${res.longitude},${res.latitude}`)

                }
              })
            },
            fail () {
              that.globalData.location = ''
              that.globalData.city = '杭州'

              wx.setStorageSync('city', '杭州')

              wx.setStorageSync('location', '')
            }
          })
        }
      }
    })
  },
  globalData: {
    location: ''
  }
})