const Utils = require('../../utils/util.js');
const constants = require('../../utils/constants.js');
const careerParent = constants.professionArr.map(item => item.parent)
import NIM from '../../utils/NIM_Web_NIM_weixin_v6.0.0.js'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    tapState: false,
    requiredTime: Utils.requiredTime(),
    sexChanged: false,
    // 所有表单集合
    formList: {},
    // 进入页面后所有输入框是否都可以点击
    tapCase: true,
    // 有用户资料的选项自动填入
    initialFormList: {
      '姓名': '',
      '手机号': '',
      '性别': '',
      '出生日期': '',
      '学历': '',
      '身高': '',
      '职业': '',
      '收入': '',
      '工作地': '',
      '籍贯': '',
      '婚姻状况': '',
      '住房情况': '',
      '有无购车': '',
      '身份证号码(买保险用)': ''
    },
    constants,
    // 默认职业初始项
    careerArr: [careerParent, constants.professionArr[0].children]
  }, 
  // 设置已有信息
  setInitialData() {  
    const userMsg = wx.getStorageSync('userMsg')
    const inputName = wx.getStorageSync('inputName')
    const roleName = wx.getStorageSync('roleName')
    const sex = wx.getStorageSync('sex')
    const that = this
    
    const initialFormList = {
      '姓名': inputName || userMsg.RealName || userMsg.NickName,
      '手机号': userMsg.Phone,
      '性别': userMsg.Sex || sex || '',
      '年龄': userMsg.Birthday ? userMsg.Birthday.split(' ')[0] : '',
      '出生日期': userMsg.Birthday ? userMsg.Birthday.split(' ')[0] : '',
      '学历': userMsg.Education,
      '身高': Number(userMsg.Height) || '',
      '职业': userMsg.Profession,
      '收入': that.handleSalary(userMsg),
      '工作地': userMsg.WorkArea,
      '婚姻状况': userMsg.MarriageState,
      '住房情况': userMsg.HouseState,
      '有无购车': userMsg.CarState,
      '身份证号码(买保险用)': userMsg.CardId,
      '角色名称': roleName || ''
    }
    
    this.setData({ initialFormList })
  },
  // 收入数组筛选
  handleSalary(userMsg) {
    if(userMsg){
      const min = userMsg.MonthIncomeMin
      const max = userMsg.MonthIncomeMax
      let userIncome = ''
  
      if (min == '0' && max == '0') {
        userIncome = ''
      } else if (min == '0' && max != '0') {
        userIncome = `${max}元以下`
      } else if (min != '0' && max == '0') {
        userIncome = `${min}元以上`
      } else {
        userIncome = `${min}-${max}元`
      }

      return userIncome
    }

    return ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu()
    this.setData({ activityId: options.id })
    wx.setStorageSync('activityId', options.id)
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
    const { activityId } = this.data
    const userMsg = wx.getStorageSync('userMsg')
    this.getActivityForms(activityId)
    this.setData({ userMsg })
    this.setInitialData()
    if (userMsg) {
      this.setData({ tapCase: false })
    }
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
   * 改变职业左侧父项，更新右侧子项
   */
  handleCareerColumnChange(e) {
    const {
      column,
      value
    } = e.detail

    if (column === 0) {
      this.setData({
        careerArr: [careerParent, constants.professionArr[value].children]
      })
    }
  },
  handleCareerChange(e) {
    const {
      careerArr
    } = this.data
    const arr = e.detail.value
    const {
      name
    } = e.currentTarget.dataset

    let initialFormList = {
      ...this.data.initialFormList,
      [name]: `${careerArr[0][arr[0]]}-${careerArr[1][arr[1]]}`
    }
    this.setData({
      initialFormList
    })
  },
  /**
   * 处理省市区picker事件
   */
  handleRegionPickerChange(e) {
    const {
      name
    } = e.currentTarget.dataset
    let area = e.detail.value

    let province = area[0]
    let p = province.replace('市', '')

    area.splice(0, 1, p)

    let str = area.join('-')

    let initialFormList = {
      ...this.data.initialFormList,
      [name]: str
    }

    this.setData({
      initialFormList
    })
  },
  /**
   * 统一处理一维picker
   */
  handlePickerChange(e) {
    const {
      name,
      arr
    } = e.currentTarget.dataset
    const index = e.detail.value

    let initialFormList = {
      ...this.data.initialFormList,
      [name]: arr[index]
    }
    this.setData({
      initialFormList
    })
  },
  handleSetInputName (e) {
    // 姓名需要缓存到本地，以供登陆后返回时替换
    this.handleSetInput(e)
    wx.setStorageSync('inputName', e.detail.value)
  },
  /**
   * 处理input框的值变化
   */
  handleSetInput(e) {
    const {
      name
    } = e.currentTarget.dataset

    let initialFormList = {
      ...this.data.initialFormList,
      [name]: e.detail.value
    }

    this.setData({
      initialFormList
    })
  },
  /**
   * 获取报名条件
   */
  getActivityForms(id) {
    const that = this
    // 必填项集合
    const requiredArr = []

    Utils.request({
        url: '/1_4/ActivityFormList.aspx',
        params: {
          ActivityId: id
        }
      })
      .then(res => {
        if (res.Result.length) {
          // 单选和多选对应的数组
          let chooseObj = {}

          res.Result.map(item => {
            item.IsFill == 1 ? requiredArr.push(item.Name) : ''
            if (item.DropDownListValue && item.DropDownListValue.length) {
              chooseObj[item.Name] = item.DropDownListValue.map(i => {
                // 多选
                if(item.Style == 3){
                  return {
                    choosed: false,
                    value: i.Value
                  }
                }else if(item.Style == 2){
                  return i.Value
                }
              })
            }
          })
          this.setData({
            enrollMsgList: res.Result,
            requiredArr,
            chooseObj
          })
          wx.setStorageSync('enrollMsgList', res.Result)
        }
      })
  },
  /**
   * 点击下一步，
   * 1、先验证是否必填项都已填写
   * 2、再请求手机号接口验证号码是否正确
   */
  ensureEnroll() {
    const {
      requiredArr,
      initialFormList,
      enrollMsgList,
      activityId,
      sexChanged
    } = this.data

    if (wx.getStorageSync('roleName')) {
      wx.removeStorageSync('roleName')
    }

    // 判断所有必选条件是否都已填
    for (let i of requiredArr) {
      if (!initialFormList[i] || initialFormList[i] == '0') {
        wx.showToast({
          title: '请输入必填项报名信息',
          icon: 'none'
        })
        
        return
      }
    }

    this.validatePhoneNumber(initialFormList['手机号'])
      .then(res => {
        // 号码都验证成功后，进行下一步操作
        
      })
      .catch(err => {
        wx.showToast({
          title: '号码错误',
          duration: 2000,
          icon: 'none'
        })
      })
    // 当条件全部输入，设置表单值, 先将条件对象数组设置为空
    const initialInputArr = enrollMsgList.map(item => {
      return {
        ActivityFormId: item.ActivityFormId,
        FormValue: ''
      }
    })
    // 获取已填条件对象数组
    let filledInputArr = this.objToArr(initialFormList)

    const detailArr = [...initialInputArr, ...filledInputArr]

    const detailObj = {}
    
    for (let i of detailArr) {
      detailObj[i.ActivityFormId] = i.FormValue
    }
    // // 需要传递的表单信息对象
    let detail = this.changeObjToArr(detailObj)

    wx.setStorageSync('formObj', detail)

    const that = this

    if(sexChanged){
      wx.showModal({
        title: '',
        content: `确定选择${initialFormList['性别']}吗？性别选定后不可再修改`,
        success (res) {
          if(res.confirm){
            that.handlePageNavigate()
          }
        }
      })
    }else{
      this.handlePageNavigate()
    }
  },
  /**
   * 根据选择票种信息，判断是跳转支付页面还是直接跳转活动管理页面
   */
  handlePageNavigate() {
    this.setData({ tapState:true })

    if (wx.getStorageSync('roleName')) {
      wx.removeStorageSync('roleName')
    }
    
    const enrollTicket = wx.getStorageSync('enrollTicket')
    const formObj = wx.getStorageSync('formObj')
    const userMsg = wx.getStorageSync('userMsg')
    
    const {
      TicketId,
      TicketType,
      TicketName,
      TicketMoney,
      TicketExplain,
      IsCheck
    } = enrollTicket
    
    const { activityId, initialFormList } = this.data

    const d = Utils.formatTimeYY(new Date())

    const { QiyuId, UserId, NickName, HeadImage } = userMsg

    if (TicketMoney > 0 && IsCheck == 1) {
      // 当票价大于0且不需要审核时，直接跳转支付页
      wx.navigateTo({
        url: `/pages/payment/payment?id=${activityId}`
      })
    } else {
      // 其余情况皆先报名，然后跳转活动管理界面
      Utils.request({
          url: '/1_4/ActivityEnrollAdd.aspx',
          params: {
            UserId,
            ActivityId: activityId,
            TicketId,
            TicketType,
            TicketName,
            TicketMoney,
            TicketExplain,
            TicketIsCheck: IsCheck,
            EnrollSerialNumbr: `${QiyuId}${d}`,
            EnrollNickName: initialFormList['姓名'],
            EnrollSex: initialFormList['性别'],
            Detail: formObj
          }
        })
        .then(res => {
          if (res.Code == 1) {

            // 如果报名条件为不需审核，且票价为0，报名成功后自动加群
            if (TicketMoney == 0 && IsCheck != 3){
              const nim = NIM.getInstance({
                appKey: constants.appKey,
                account: UserId,
                token: 'qiyu' + UserId,
                onmsg (res) {
                  console.log(res)
                },
                onconnect(res) {
                
                  nim.updateMyInfo({
                    nick: NickName,
                    avatar: HeadImage,
                    done(err, res) {
                      // 更新用户信息后再申请加群
                      nim.applyTeam({
                        teamId: wx.getStorageSync('chatGroupId'),
                        done(err, obj) {
                          wx.showToast({
                            title: '报名成功',
                            duration: 2000,
                            icon: 'none'
                          })

                          setTimeout(() => {
                            wx.reLaunch({
                              url: '/pages/userCenter/userCenter?skip=1',
                              success () {
                                console.log(nim)
                                nim.disconnect();
                              }
                            })
                          }, 1000)
                        }
                      })
                    }
                  })
                }
              })
            } else if (IsCheck == 3) {
              wx.showToast({
                title: '报名成功，请等待审核',
                duration: 2000,
                icon: 'none'
              })
              
              setTimeout(() => {
                wx.reLaunch({
                  url: '/pages/userCenter/userCenter?skip=1'
                })
              }, 1000)
            } else if (IsCheck == 2){
              // 系统审核且报名条件通过
              wx.navigateTo({
                url: `/pages/payment/payment?id=${activityId}`
              })
            }
          } else {
            wx.showToast({
              title: res.Tips || '报名失败',
              duration: 2000,
              icon: 'none'
            })
          }
        })
    }
  },
  /**
   * 对象转数组方法
   * @obj {Object} 需要转换的对象
   */
  objToArr(obj) {
    let emptyArr = []
    let {
      enrollMsgList,
      initialFormList
    } = this.data

    for (let i of enrollMsgList) {
      emptyArr.push({
        ActivityFormId: i.ActivityFormId,
        FormValue: initialFormList[i.Name]
      })
    }

    return emptyArr
  },
  /**
   * 将对象转成带FormId的数组，报名时需要带上
   */
  changeObjToArr(obj) {
    let emptyArr = []
    const d = wx.getStorageSync('enrollMsgList')
    let idObj = {}
    for (let i of d) {
      idObj[i.ActivityFormId] = i.FormId
    }
    for (let i in obj) {
      emptyArr.push({
        FormId: idObj[i],
        ActivityFormId: i,
        FormValue: obj[i]
      })
    }
    console.log(emptyArr)
    return emptyArr
  },
  handleSexChange(e) {
    this.handlePickerChange(e)

    const {
      arr
    } = e.currentTarget.dataset
    const index = e.detail.value

    wx.setStorageSync('sex', arr[index])

    console.log(arr[index])
    
    this.setData({ sexChanged: true })
  },
  /**
   * 验证手机号
   */
  validatePhoneNumber(number) {
    return new Promise((resolve, reject) => {
      Utils.request({
          url: '/1_4/PhoneVerification.aspx',
          params: {
            Phone: number
          }
        })
        .then(res => {
          if (res.Code == 1) {
            resolve()
          } else {
            reject(res.Tips)
          }
        })
    })
  },
  /**
   * 验证身份证号
   */
  handleSetIDCard(e) {
    const reg = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
    const {
      required
    } = e.currentTarget.dataset
    if (reg.test(e.detail.value) == false && required) {
      wx.showToast({
        title: '身份证号码格式不正确！',
        duration: 2000,
        icon: 'none'
      })
      return
    } else {
      this.handleSetInput(e)
    }
  },

  navigateToLogin () {
    const { initialFormList } = this.data
    // 没有号码，前往验证号码界面
    wx.navigateTo({
      url: '/pages/inputPhone/inputPhone'
    })
  },
  chooseCheckbox (e) {
    const next = this.navigateValidatePhone(e)
    if(next){
      const { name } = e.currentTarget.dataset
      // 深拷贝记录最新的值，当唤起多选框但点击取消时，用该值替换
      const d = JSON.parse(JSON.stringify(this.data.chooseObj))

      this.setData({
        curCheckbox: name,
        prevCheckboxData: d
      })
    }
  },
  cancelChoose () {
    this.setData({ chooseObj: this.data.prevCheckboxData })
    this.hideCheckboxArea()
  },
  confirmChoosebox () {
    let { chooseObj, curCheckbox, initialFormList } = this.data
    let strArr = []

    for (let i of chooseObj[curCheckbox]){
      if(i.choosed){
        strArr.push(i.value)
      }
    }
    initialFormList = {
      ...initialFormList,
      [curCheckbox]: strArr.join(',')
    }
    this.setData({ initialFormList })

    this.hideCheckboxArea()
  },
  hideCheckboxArea () {
    this.setData({ curCheckbox: '' })
  },
  chooseCheckboxItem (e) {
    const { index, name } = e.currentTarget.dataset
    const { chooseObj } = this.data

    let curObj = chooseObj[name][index]
    curObj.choosed = !curObj.choosed

    chooseObj[name].splice(index, 1, curObj)

    this.setData({ chooseObj })
    
  },
  // 用户未登录时，点击其余表单，提示先前往验证手机号
  navigateValidatePhone (e) {
    const { tapCase } = this.data
    const userMsg = wx.getStorageSync('userMsg')
    const { name } = e.currentTarget.dataset

    if (tapCase){
      wx.showToast({
        title: '请先验证手机号',
        icon: 'none',
        duration: 2000
      })
      return false
    }

    if (name == '性别' && userMsg.Sex){
      wx.showToast({
        title: '性别不可修改',
        icon: 'none',
        duration: 2000
      })
    }

    return true
  },
  navigateToChooseRole (e) {
    const { activityid, formid } = e.currentTarget.dataset
    const { tapCase } = this.data

    if (tapCase) {
      wx.showToast({
        title: '请先验证手机号',
        icon: 'none',
        duration: 2000
      })
      return
    }

    wx.navigateTo({
      url: `/pages/chooseRole/chooseRole?activityId=${activityid}&formId=${formid}`
    })
  },
  getPhoneNumber (e) {
    const that = this

    if (e.detail.errMsg.indexOf('ok') > 0) {
      console.log(e)
    } else {
      wx.showToast({
        title: '请先允许授权',
        icon: 'none'
      })
      return
    }

    wx.login({
      success(res) {
        Utils.request({
          url: '/1_4/WeiXinPhone.aspx',
          params: {
            code: res.code,
            iv: e.detail.iv,
            encryptedData: e.detail.encryptedData
          }
        })
          .then(res => {
            if (res.Code == '1') {
              Utils.request({
                url: '/1_5/LoginRegister.aspx',
                params: {
                  Type: 3,
                  Phone: res.Result.Value,
                  SMSCode: '',
                  WeiXinCode: '',
                  IsInvite: 0,
                  FromUserId: ''
                }
              })
                .then(res => {
                  if (res.Code == 1) {
                    wx.setStorageSync('userMsg', res.Result)
                    that.onShow()
                  } else {
                    wx.showToast({
                      title: res.Tips || '登录失败',
                      icon: 'none'
                    })
                  }
                })
            } else {
              wx.showToast({
                title: res.Tips,
                icon: 'none'
              })
            }
          })
      }
    })
  }
})