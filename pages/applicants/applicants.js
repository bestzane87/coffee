const Utils = require('../../utils/util.js');
import tapEvents from '../../template/template.js';
const constants = require('../../utils/constants.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    dataList: [],
    noData: false,
    LastDataCreateTime: '',
    // 初始化排序筛选参数
    allSex: '0',
    allEnrollState: '0',
    ticketType: '0',
    allSexText: '全部性别',
    allEnrollStateText: '全部状态',
    ticketTypeText: '全部票种',
    lastItem: '',
    // 是否展开tab列表项
    showMenu: false,
    // 目前点选的tab
    checked: '',
    queueList: [
      { title: '全部性别', id: 'allSex' },
      { title: '全部状态', id: 'allEnrollState' },
      { title: '全部票种', id: 'ticketType' }
    ],
    modalShow: false,
    refundMax: ''
  },
  /**
   * 点击topbar的tab响应事件
   */
  toggleList: function (e) {
    const { type, list } = e.currentTarget.dataset
    // const 
    this.setData({
      showMenu: type === this.data.checked ? false : true,
      checked: type === this.data.checked ? '' : type,
      typeList: list || Object.keys(constants[type])
    })
  },
  /** 
   * 点击tab列表项响应事件
   */
  chooseType: function (e) {
    const { name, title, index } = e.currentTarget.dataset
    const { typeList } = this.data

    this.setData({
      [title]: constants[title][name] || index,
      [this.data.checked + 'Text']: name,
      // 点选展开的菜单栏后，隐藏菜单栏，选中的主菜单也取消选中
      showMenu: false,
      checked: '',
      dataList: [],
      noData: false,
      LastDataCreateTime: ''
    }, () => this.getApplicantsList())
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu()
    this.setData({ options })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    const height = wx.getSystemInfoSync().windowHeight

    this.setData({
      height: height * 2 - 100 - 134 - 1
    })
  },
  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    const { options } = this.data
    this.getTicketTypes(options.id)

    this.setData({
      activityId: options.id
    }, () => this.getApplicantsList())

    this.getActivityDetail(options.id)
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
    const { activityMsg } = this.data

    return {
      title: activityMsg.Title,
      path: '/pages/activityDetail/activityDetail?activity_id=' + activityMsg.ActivityId,
      imageUrl: activityMsg.PosterImage + '?x-oss-process=image/crop,w_500,h_400,g_center'
    }
  },

  /**
   * 签到操作
   */
  handleArrived: function() {
    this.setData({
      arrived: !this.data.arrived
    })
  },

  /**
   * 获取报名者列表
   */
  getApplicantsList() {
    const {
      activityId,
      LastDataCreateTime,
      dataList,
      noData,
      allSex,
      allEnrollState,
      ticketType
    } = this.data
    const that = this
    const { UserId } = wx.getStorageSync('userMsg')

    if (!noData) {
        Utils.request({
          url: '/1_5/ActivityEnrollListOrganiser.aspx',
          params: {
            UserId,
            ActivityId: activityId,
            Sex: allSex,
            IsState: allEnrollState,
            TicketId: ticketType,
            Location: wx.getStorageSync('location') || '',
            LastDataCreateTime
          }
        })
        .then(res => {
          const r = res.Result

          if (res.Result) {
            that.setData({
              count: res.Tips,
              dataList: [...dataList, ...r],
              LastDataCreateTime: r[r.length - 1].TicketCreateTimeText,
              noData: false,
              dataArr: res.Tips.split(',')
            })
          } else {
            that.setData({
              count: res.Tips,
              noData: true,
              dataArr: res.Tips.split(',')
            })
          }
        })
    }
  },
  tapButtons (e) {
    tapEvents.tapButtons(e)
  },
  getAvatarDetail (e) {
    const { enrollid } = e.currentTarget.dataset
    const { activityId } = this.data

    wx.navigateTo({
      url: `/pages/avatarDetail/avatarDetail?id=${enrollid}&activityId=${activityId}`
    })
  },
  // 获取票种筛选数据
  getTicketTypes (id) {
    const that = this

    Utils.request({
      url: '/1_4/ActivityTicketListEnroll.aspx',
      params: {
        ActivityId: id
      }
    })
      .then(res => {
        let ticketList = {0: '全部票种'}
        
        res.Result.map(item => {
          ticketList[item.Key] = item.Value
        })

        that.setData({
          ticketList
        })
      })
  },
  /**
   * 获取活动详情，用于分享
   */
  getActivityDetail (id) {
    const that = this

    Utils.request({
      url: '/1_4/ActivityInfo.aspx',
      params: {
        UserId: '0',
        ActivityId: id
      }
    })
      .then(res => {
        that.setData({ activityMsg: res.Result })
      })
  },

  toggleRefundModal () {
    const { modalShow } = this.data

    this.setData({ modalShow: !modalShow })
  },
  confirmRefund () {
    const { realRefund, refundMax, curEnrollId } = this.data
    const that = this

    wx.showModal({
      title: '',
      content: `确定退款${realRefund || refundMax}元吗？`,
      success(res) {
        if (res.confirm) {
          that.toggleRefundModal()
          Utils.request({
            url: '/1_4/ActivityEnrollOutMoneySingle.aspx',
            params: {
              EnrollId: curEnrollId,
              OutMoney: realRefund || refundMax,
              UserId: wx.getStorageSync('userMsg').UserId
            }
          })
            .then(res => {
              if (res.Code == '1') {
                wx.showToast({
                  title: '退款成功',
                  icon: 'none'
                })

                wx.redirectTo({
                  url: '/pages/applicants/applicants?id=' + that.data.activityId
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
    })
 
  },
  getRefundMoney (e) {
    let realRefund;

    if (parseFloat(e.detail.value) > parseFloat(this.data.refundMax)) {
      realRefund = this.data.refundMax
    } else {
      realRefund = e.detail.value || ''
    }
    console.log(e.detail.value)
    console.log(this.data.refundMax)
    console.log(e.detail.value > this.data.refundMax)

    this.setData({ realRefund })
  },
  navigateToRefund () {
    const that = this
    
    wx.navigateTo({
      url: '/pages/refund/refund?id=' + that.data.activityId
    })
  }
})