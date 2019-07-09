const md5 = require('../utils/md5.js')
const Utils = require('../utils/util.js')
import NIM from '../utils/NIM_Web_NIM_weixin_v6.0.0.js'
const constants = require('../utils/constants.js')

let tapEvents = {
  tapButtons (e, cb) {
    const { code, ticketmoney, id, activityid, enrollid, cost, paynumber, chatgroupid, userid, apnickname, avatarurl } = e.currentTarget.dataset
    const userMsg = wx.getStorageSync('userMsg')

    // 判断必填项用户信息，如有缺失项跳转注册页面
    const avatar = userMsg.HeadImage == 'https://ossqiyu.oss-cn-hangzhou.aliyuncs.com/Users/default.png'
    const { EmotionState, Sex, Education, MonthIncomeMin, MonthIncomeMax, WorkArea, Birthday, Profession, HeadImage, NickName } = userMsg
    const allFillIn = Sex && Education && (MonthIncomeMin || MonthIncomeMax) && WorkArea && Birthday && Profession

    // 立即报名不需要登录，点击必填项手机号的时候前往登录

    if(code == '1200') {
      wx.navigateTo({
        url: `/pages/ticketTypes/ticketTypes?id=${activityid}`
      })
      return
    }




    // 其余所有按钮操作先确认用户是否已经登录，未登录则先登录
    if (!userMsg){
      wx.navigateTo({
        url: `/pages/login/login?id=${activityid}&pageFrom=1`
      })
      return
    }

    if(code == '400'){
      wx.navigateTo({
        url: `/pages/refuseReason/refuseReason?id=${id}`
      })
    } else if (code == '500') {
      wx.showModal({
        title: '',
        content: '确定通过报名吗',
        success(res) {
          if (res.confirm) {
            Utils.request({
              url: '/1_4/ActivityEnrollIsStateUpdate.aspx',
              params: {
                EnrollId: id,
                ClickCode: code,
                Remark: ''
              }
            })
              .then(res => {
                if (res.Code == '1') {
                  wx.redirectTo({
                    url: `/pages/applicants/applicants?id=${activityid}`,
                    success(){
                      // 不需要支付且审核通过后，拉入活动群聊
                      if (ticketmoney == 0){
                        const nim = NIM.getInstance({
                          appKey: constants.appKey,
                          account: userMsg.UserId,
                          token: 'qiyu' + userMsg.UserId,
                          onmsg (res) {
                            console.log(res)
                          },
                          onconnect(res) {
                            const nimApplicant = NIM.getInstance({
                              appKey: constants.appKey,
                              account: userid,
                              token: 'qiyu' + userid,
                              onconnect(res) {
                                nimApplicant.updateMyInfo({
                                  nick: apnickname,
                                  avatar: avatarurl,
                                  done(err, res) {
                                    nim.addTeamMembers({
                                      teamId: chatgroupid,
                                      accounts: [userid],
                                      done(err, res){
                                        nim.disconnect();
                                      }
                                    })
                                  }
                                })
                              }
                            })
                          }
                        })
                      }
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
          }
        }
      })
    } else if (code == '600') {
      wx.showModal({
        title: '',
        content: `确定给${apnickname}签到吗？签到后无法撤销，如有押金则自动退还`,  
        success(res) {
          if (res.confirm) {
            Utils.request({
              url: '/1_4/ActivityEnrollIsStateUpdate.aspx',
              params: {
                EnrollId: id,
                ClickCode: code,
                Remark: ''
              }
            })
              .then(res => {
                if (res.Code == '1') {
                  wx.redirectTo({
                    url: `/pages/applicants/applicants?id=${activityid}`
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
        }
      })
    }else if (code == '700') {
      // 群聊按钮
      wx.showModal({
        title: '请下载约杯咖啡APP体验群聊功能',
        icon: 'none',
        success (res) {
          if(res.confirm){
            wx.navigateTo({
              url: '/pages/downloadApp/downloadApp'
            })
          }
        }
      })
    }else if (code == '900') {
      wx.navigateTo({
        url: `/pages/applicants/applicants?id=${activityid}`
      })
    }else if (code == '1000') {
      // 点击活动咨询
      wx.navigateTo({
        url: `/pages/interlocution/interlocution?id=${activityid}`
      })
    } else if (code == '1100') {
      Utils.request({
        url: '/1_4/ActivityEnrollIsStateUpdate.aspx',
        params: {
          EnrollId: id,
          ClickCode: code,
          Remark: ''
        }
      })
        .then(res => {
          if (res.Code == '1') {
            wx.redirectTo({
              url: `/pages/applicants/applicants?id=${activityid}`
            })
          } else {
            wx.showToast({
              title: res.Tips,
              duration: 2000,
              icon: 'none'
            })
          }
        })
    } else if (code == '1300') {
      wx.showLoading({
        title: '请稍候',
        icon: 'none'
      })
      const d = Utils.formatTimeYY(new Date())
      
      // 点击立即支付，支付完成后redirectTo活动管理页面
      const timestamp = new Date().getTime()
      
      const str = `19cc8dd9-7681-4ea9-863b-d145b81a227e${timestamp}eaca9fec-f32d-4ac3-b7e5-08bc8c17d00b`
      let bill_no = userMsg.QiyuId + d
      let nim = ''
      // 先调后台接口，成功后再调用BCloud
      Utils.request({
        url: '/1_4/ActivityEnrollImmediatelyPay.aspx',
        params: {
          EnrollId: enrollid,
          UserId: userMsg.UserId,
          PayMode: 2,
          PayNumber: bill_no,
          TicketMoney: cost
        }
      })
        .then(res => {
          if(res.Code == 1){
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
                        total_fee: cost * 100,
                        bill_no,
                        openid: r.Result.Value,
                        title: '报名支付',
                        optional: {
                          PayValue: paynumber,
                          UserId: userMsg.UserId,
                          PayKey: "6"
                        }
                      },
                      method: 'post',
                      success(res) {
                        if(res.data.result_msg == 'OK'){
                          wx.hideLoading()
                          wx.requestPayment({
                            timeStamp: res.data.timestamp,
                            nonceStr: res.data.nonce_str,
                            package: res.data.package,
                            signType: res.data.sign_type,
                            paySign: res.data.pay_sign,
                            success () {
                              const { UserId } = wx.getStorageSync('userMsg')
                              // 支付成功后加入群聊
                              console.log('开始加入群聊')
                              nim = NIM.getInstance({
                                appKey: constants.appKey,
                                account: UserId,
                                token: 'qiyu' + UserId,
                                onmsg(res) {
                                  console.log(res)
                                },
                                onconnect(res) {
                                  console.log('已连接')
                                  nim.updateMyInfo({
                                    nick: NickName,
                                    avatar: HeadImage,
                                    done(err, res) {
                                      console.log('已更新资料')
                                      nim.applyTeam({
                                        teamId: chatgroupid,
                                        done(res) {
                                          console.log(res)
                                        }
                                      })
                                    }
                                  })
                                }
                              })
                            },
                            complete() {
                              wx.redirectTo({
                                url: '/pages/allActivities/allActivities',
                                success () {
                                  if(nim){
                                    nim.disconnect();
                                  }
                                }
                              })
                            }
                          })
                        }else{
                          wx.hideLoading()
                          wx.showToast({
                            title: res.data.err_detail,
                            icon: 'none'
                          })
                        }
                      }
                    })
                  })
              }
            })
          }
        })
    } else if (code == '1400') {
      // 点击立即评价，跳转活动评价页面
      wx.navigateTo({
        url: `/pages/evaluate/evaluate?id=${activityid}&enrollId=${enrollid}`
      })
    } else if (code == '1500') {
      // 点击主办方的嘉宾互选按钮
      wx.navigateTo({
        url: `/pages/sponsorChooseList/sponsorChooseList?id=${activityid}`
      })
    } else if (code == '1600') {
      if (!allFillIn) {
        wx.showModal({
          title: '',
          content: '在互选前需要补充一点资料，方便对方认识',
          cancelText: '取消',
          confirmText: '确定',
          success (res) {
            if(res.confirm){
              wx.navigateTo({
                // url: `/pages/addMsg/addMsg?activityId=${activityid}&userId=${userMsg.UserId}`,
                url: `/pages/addMsg/addMsg`
              })
            }
          }
        })
        return
      }
      // 嘉宾互选按钮，跳转未选界面
      wx.navigateTo({
        url: `/pages/mutualChoose/mutualChoose?id=${activityid}`
      })
    } else if (code == '1700') {
      if (!allFillIn) {
        wx.navigateTo({
          url: `/pages/addMsg/addMsg`
        })
        return
      }
      // 嘉宾互选按钮，跳转已选
      wx.navigateTo({
        url: `/pages/chooseList/chooseList?activityId=${activityid}&userId=${userMsg.UserId}`
      })
    } else if (code == '1800') {
      if (!allFillIn) {
          wx.showModal({
            title: '',
            content: '在互选前需要补充一点资料，方便对方认识',
            cancelText: '取消',
            confirmText: '确定',
            success(res) {
              if (res.confirm) {
                wx.navigateTo({
                  // url: `/pages/addMsg/addMsg?activityId=${activityid}&userId=${userMsg.UserId}`,
                  url: `/pages/addMsg/addMsg`
                })
              }
            }
          })
          return
      }
      // 嘉宾互选按钮不跳转，提示
      wx.showToast({
        title: '活动开始后方可互选',
        duration: 2000,
        icon: 'none'
      })
    } else if (code == '1900' || code == '800') {
      // 嘉宾互选按钮不跳转，提示
      wx.showToast({
        title: '请先报名',
        duration: 2000,
        icon: 'none'
      })
    } else if (code == '2000' || code == '2200') {
      // 嘉宾互选按钮不跳转，提示
      wx.showToast({
        title: '等待主办方审核',
        duration: 2000,
        icon: 'none'
      })
    } else if (code == '2100' || code == '2300') {
      // 嘉宾互选按钮不跳转，提示
      wx.showToast({
        title: '请先支付活动费用',
        duration: 2000,
        icon: 'none'
      })
    } else if (code == '2400') {
      // 嘉宾互选成功后，点击聊一聊按钮
      wx.showModal({
        title: '',
        content: '请下载约杯咖啡APP体验聊一聊功能，对方可能给你发了消息',
        success (res) {
          if(res.confirm){
            wx.navigateTo({
              url: '/pages/downloadApp/downloadApp'
            })
          }
        }
      })
    } else if (code == '2700') {
      // 点击分享有奖按钮
      const pages = getCurrentPages()
      const curPage = pages[pages.length - 1]

      curPage.getShareImg(activityid)
    } else if (code == '2800') {
      wx.showModal({
        title: '',
        content: '确定取消报名吗',
        success (res) {
          if (res.confirm) {
            Utils.request({
              url: '/1_4/ActivityEnrollCancel.aspx',
              params: {
                EnrollId: enrollid
              }
            })
              .then(res => {
                if (res.Code == '1') {
                  wx.showToast({
                    title: '取消报名成功', 
                    duration: 2000,
                    icon: 'none'
                  })
                  
                  setTimeout(() => {
                    wx.redirectTo({
                      url: '/pages/allActivities/allActivities',
                    })
                  }, 2000)
                } else {
                  wx.showToast({
                    title: res.Tips || '操作失败'
                  })
                }
              })
          }
        }
      })
    } else if (code == '2900') {
      const that = this

      Utils.request({
        url: '/1_4/ActivityEnrollOutMoneyRefundableSingle.aspx',
        params: {
          EnrollId: id
        }
      })
        .then(res => {
          if (res.Code == '1') {
            const pages = getCurrentPages()
            const curPage = pages[pages.length - 1]
            
            curPage.toggleRefundModal()
            curPage.setData({
              refundMax: res.Result.Value,
              realRefund: '',
              curEnrollId: id
            })
          } else {
            wx.showToast({
              title: res.Tips || '操作失败',
              icon: 'none'
            })
          }
        })
    }
  }
}

export default tapEvents