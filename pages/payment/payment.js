const md5 = require('../../utils/md5.js')
const Utils = require('../../utils/util.js')
import NIM from '../../utils/NIM_Web_NIM_weixin_v6.0.0.js'
const constants = require('../../utils/constants.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ticketCost: '',
    ticketCostText: '',
    btnObj: {
      disabled: false,
      text: '确认支付'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu()
    const ticketMsg = wx.getStorageSync('enrollTicket')
    this.setData({
      ticketCost: ticketMsg.TicketMoney * 100,
      ticketCostText: ticketMsg.TicketMoneyText
    })
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  /**
   * 确认支付
   */
  payForActivity() {
    const enrollTicket = wx.getStorageSync('enrollTicket')
    const formObj = wx.getStorageSync('formObj')
    const userMsg = wx.getStorageSync('userMsg')
    const activityId = wx.getStorageSync('activityId')
    const sex = wx.getStorageSync('sex')
    const {ticketCost} = this.data
    const that = this
    const {
      TicketId,
      TicketType,
      TicketName,
      TicketMoney,
      TicketExplain,
      IsCheck
    } = enrollTicket
    const { QiyuId, UserId, NickName, HeadImage } = userMsg

    const d = Utils.formatTimeYY(new Date())

    // 首先设置button不可点击状态，防止重复提交订单
    this.setData({
      btnObj: {
        disabled: true,
        text: '报名成功，等待支付'
      }
    })
    const timestamp = new Date().getTime()
    const str = `19cc8dd9-7681-4ea9-863b-d145b81a227e${timestamp}eaca9fec-f32d-4ac3-b7e5-08bc8c17d00b`
    
    const bill_no = userMsg.QiyuId + d

    let nim = ''
    // 先调后台接口，成功后再调用BCloud
    Utils.request({
      url: '/1_4/ActivityEnrollAdd.aspx',
      params: {
        UserId,
        ActivityId: activityId,
        PayNumber: bill_no,
        PayMode: 2,
        TicketId,
        TicketType,
        TicketName,
        TicketMoney,
        TicketExplain,
        TicketIsCheck: IsCheck,
        EnrollSerialNumbr: bill_no,
        EnrollNickName: NickName,
        EnrollSex: sex || userMsg.Sex,
        // EnrollSex: userMsg.Sex,
        Detail: formObj
      }
    })
      .then(res => {
        wx.login({
          success(res) {
            Utils.request({
              url: '/1_4/WeiXinOpenId.aspx',
              params: {
                Code: res.code
              }
            })
              .then(r => {
                wx.request({
                  url: 'https://api.beecloud.cn/2/rest/bill',
                  data: {
                    app_id: '19cc8dd9-7681-4ea9-863b-d145b81a227e',
                    timestamp,
                    app_sign: md5.md5(str),
                    channel: 'WX_MINI',
                    total_fee: ticketCost,
                    bill_no,
                    openid: r.Result.Value,
                    title: '报名支付',
                    optional: {
                      PayValue: bill_no,
                      UserId: userMsg.UserId,
                      PayKey: "6"
                    }
                  },
                  method: 'post',
                  success(res) {
                    wx.requestPayment({
                      timeStamp: res.data.timestamp,
                      nonceStr: res.data.nonce_str,
                      package: res.data.package,
                      signType: res.data.sign_type,
                      paySign: res.data.pay_sign,
                      success(res) {
                        wx.showToast({
                          title: '支付成功！',
                          duration: 2000,
                          icon: 'success'
                        })

                        nim = NIM.getInstance({
                          appKey: constants.appKey,
                          account: userMsg.UserId,
                          token: 'qiyu' + userMsg.UserId,
                          onmsg(res) {
                            console.log(res)
                          },
                          onconnect(res) {

                            nim.updateMyInfo({
                              nick: NickName,
                              avatar: HeadImage,
                              done(err, res) {
                                nim.applyTeam({
                                  teamId: wx.getStorageSync('chatGroupId'),
                                  done (res) {
                                    console.log(res)
                                  }
                                })
                              }
                            })
                          }
                        })
                      },
                      complete() {
                        setTimeout(() => {
                          if (wx.getStorageSync('roleName')) {
                            wx.removeStorageSync('roleName')
                          }
                          wx.reLaunch({
                            url: '/pages/userCenter/userCenter?skip=1',
                            success () {
                              if(nim){
                                nim.disconnect();
                              }
                            }
                          })
                        }, 1000)
                      }
                    })
                  }
                })
              })
          }
        })
      })
  }
})