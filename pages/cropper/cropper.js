Page({
  data: {
    src: ''
  },
  onLoad: function (options) {
    //获取到image-cropper对象
    this.cropper = this.selectComponent("#image-cropper");
    //开始裁剪
    this.setData({
      src: options.path,
    })
  },
  loadimage(e) {
    wx.hideLoading()
    //重置图片角度、缩放、位置
    this.cropper.imgReset()
  },
  cutImg() {
    const that = this

    this.cropper.getImg(function (obj) {
      const pages = getCurrentPages()
      const upperPage = pages[pages.length - 2]
      
      upperPage.setData({ 
        avatarUrl: obj.url,
        // 修改头像页面是否已经修改头像标记
        avatarChanged: true 
      }, () => {
        wx.navigateBack()
      })
    })
  },

  cancelChoose () {
    wx.navigateBack()
  }
})