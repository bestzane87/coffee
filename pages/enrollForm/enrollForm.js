const Utils = require('../../utils/util.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 页面下方按钮配置
    btnObj: {
      text: '保存'
    },
    name: '',
    phone: '',
    sex: '',
    birthday: '',
    education: '',
    profession: '',
    height: '',
    income: '',
    workPlace: '',
    houseState: '',
    carState: '',
    idCard: '',
    otherName: '',
    otherPhone: '',
    otherIdCard: '',
    // 用户需要填写的表单集合
    formItemList: [
      { itemName: '出生年月', itemId: 'birthday', required: true },
      { itemName: '学历', itemId: 'education', required: true },
      { itemName: '职业', itemId: 'profession', required: true },
      { itemName: '身高', itemId: 'height', required: true },
      { itemName: '收入', itemId: 'income', required: true },
      { itemName: '工作地', itemId: 'workPlace', required: true },
      { itemName: '住房情况', itemId: 'houseState', required: true },
      { itemName: '有无购车', itemId: 'carState', required: true },
      { itemName: '身份证号码', itemId: 'idCard', required: true },
      { itemName: '伴侣姓名', itemId: 'otherName', required: true },
      { itemName: '伴侣手机号', itemId: 'otherPhone', required: true },
      { itemName: '伴侣身份证号码', itemId: 'otherIdCard', required: true }
    ],
    coverState: false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()
    this.getInitialFormSettings()
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
   * 点击这招取消按钮
   */
  toggleCover: function(){
    const that = this
    this.setData({ coverState: !that.data.coverState })
  },
  /**
   * 选中和取消选中表单项
   */
  toggleLabelItem: function (e) {
    const { id, boolean } = e.currentTarget.dataset
    let { formItemList } = this.data

    formItemList.filter((item, index) => {
      if ( item.itemId === id ) {
        formItemList[index].required = !boolean
      }
      this.setData({ formItemList })
    })
  },
  getInitialFormSettings: function () {
    Utils.request({
      url: '/1_4/ConfigActivityFormList.aspx'
    })
      .then(res => {
        console.log(res.Result)
      })
  }
})