const allSex = {
  '全部性别': '0',
  '男士': '男士',
  '女士': '女士'
}

const allEnrollState = {
  '全部状态': '0',
  '待审核': '1',
  '待支付': '2',
  '待签到': '3',
  '待评价': '4',
  '已评价': '5',
  '取消报名': '16'
}

const allType = {
  '全类型': '0',
  '单身室内': '1',
  '单身户外': '2',
  '自带伴侣': '3'
};

const allTime = {
  '全时段': '0',
  '今天': '1',
  '明天': '2',
  '本周': '3',
  '本周末': '4',
  '本月': '5'
};
const activityTypeList = ['单身室内', '单身户外', '自带伴侣']

const allCost = {
  '全价格': '0',
  '收费票': '1',
  '免费票': '2',
  '自费票': '3'
}

const multiple = {
  '综合排序': '0',
  '最新发布': '1',
  '热门点击': '2',
  '最近距离': '3'
}

const multipleObj = {
  '综合排序': 'StartTime',
  '最新发布' : 'CreateTime',
  '热门点击' : 'SeeNumber',
  '最近距离' : 'Distance'
}

// 活动标签
const labels = [
  {state: '0', text: '全部'},
  { state: '1', text: '待审核' },
  { state: '2', text: '待支付' },
  { state: '3', text: '待签到' },
  { state: '4', text: '待评价' },
  { state: '5', text: '已评价' },
  { state: '6', text: '未通过' },
  { state: '7', text: '已过期' },
  { state: '8', text: '已取消' },
]

// 嘉宾互选标签
const chooseLabels = [
  { state: '0', text: '全部' },
  { state: '3', text: '成功' },
  { state: '1', text: '失败' },
  { state: '2', text: '待选' },
  { state: '4', text: '未选' }
]

const professionArr = [
  {
    parent: '传媒/艺术',
    children: ['主编', '编辑', '作家', '撰稿人', '文案策划', '出版发行', '导演', '记者', '主持人', '演员', '模特', '经纪人', '摄影师', '影视后期制作', '设计师', '画家', '音乐家', '舞蹈', '传媒/艺术']
  },
  {
    parent: '物流/仓储',
    children: ['物流经理', '物流主管', '物流专员', '仓库经理', '仓库管理员', '货运代理', '集装箱业务', '海关事务管理', '报单员', '快递员', '物流/仓储']
  },
  {
    parent: '生产/制造',
    children: ['工厂经理', '工程师', '项目主管', '营运经理', '营运主管', '车间主任', '物料主管', '生产领班', '操作工人', '安全管理', '生产制造']
  },
  {
    parent: '在校学生',
    children: ['在校学生']
  },
  {
    parent: '医疗/护理',
    children: ['医疗管理', '医生', '心理医生', '药剂师', '护士', '兽医', '医疗/护理']
  },
  {
    parent: '财会/审计',
    children: ['财务总监', '财务经理', '财务主管', '会计', '注册会计师', '审计师', '税务经理', '税务专员', '成本经理', '财会/审计']
  },
  {
    parent: '生物/制药',
    children: ['生物工程', '药品生产', '临床研究', '医疗器械', '医疗代表', '化工工程师', '生物/制药']
  },
  {
    parent: '服务业',
    children: ['餐饮管理', '厨师', '餐厅服务员', '酒店管理', '大堂经理', '酒店服务员', '导游', '美容师', '健身教练', '商场经理', '零售店店长', '店员', '保安经理', '保安人员', '家政服务', '服务业']
  },
  {
    parent: '咨询/顾问',
    children: ['专业顾问', '咨询经理', '咨询师', '培训师', '咨询/顾问']
  },
  {
    parent: '客户服务',
    children: ['客服经理', '客服主管', '客服专员', '客服协调', '客服技术支持', '客户服务']
  },
  {
    parent: '计算机/互联网',
    children: ['IT技术总监', 'IT技术经理', 'IT工程师', '系统管理员', '测试专员', '运营管理', '网页设计', '网站编辑', '网站产品经理', '计算机/互联网']
  },
  {
    parent: '教育/科研',
    children: ['教授', '讲师/助教', '中学教师', '小学教师', '幼师', '教务管理人员', '职业技术教师', '培训师', '科研管理人员', '科研人员', '教育/科研']
  },
  {
    parent: '销售',
    children: ['销售总监', '销售经理', '销售主管', '销售专员', '渠道/分销管理', '渠道/分销专员', '经销商', '客户经理', '客户代表', '销售']
  },
  {
    parent: '待业',
    children: ['待业']
  },
  {
    parent: '军人/警察',
    children: ['军人/警察']
  },
  {
    parent: '其他职业',
    children: ['其他职业']
  },
  {
    parent: '广告/市场',
    children: ['广告客户经理', '广告客户专员', '广告设计经理', '广告设计专员', '广告策划', '市场营销经理', '市场营销专员', '市场策划', '市场调研与分析', '市场拓展', '公关经理', '公关专员', '媒介经理', '媒介专员', '品牌经理', '品牌专员', '广告/市场']
  },
  {
    parent: '建筑/房地产',
    children: ['建筑师', '工程师', '规划师', '景观设计', '房地产策划', '房地产交易', '物业管理', '建筑/房地产']
  },
  {
    parent: '人事/行政',
    children: ['人事总监', '人事经理', '人事主管', '人事专员', '招聘经理', '招聘专员', '培训经理', '培训专员', '秘书', '文员', '后勤', '人事/行政']
  },
  {
    parent: '农林牧渔',
    children: ['农林牧渔']
  },
  {
    parent: '自由职业',
    children: ['自由职业']
  },
  {
    parent: '法律',
    children: ['律师', '律师助理', '法务经理', '法务专员', '知识产权专员', '法律']
  },
  {
    parent: '政府机构',
    children: ['公务员', '政府机构']
  },
  {
    parent: '交通运输',
    children: ['飞行员', '空乘人员', '地勤人员', '列车司机', '乘务员', '船长', '船员', '司机', '交通运输']
  },
  {
    parent: '通讯/电子',
    children: ['通讯技术', '电子技术', '通讯/电子']
  },
  {
    parent: '金融/银行/保险',
    children: ['投资', '保险', '金融', '银行', '证券', '金融/银行/保险']
  },
  {
    parent: '商贸/采购',
    children: ['商务经理', '商务专员', '采购经理', '采购专员', '外贸经理', '外贸专员', '业务跟单', '报关员', '商贸/采购']
  },
  {
    parent: '高级管理',
    children: ['总经理', '副总经理', '合伙人', '总监', '经理', '总裁助理', '高级管理']
  },
];

const ossUrl = 'https://ossqiyu.oss-cn-hangzhou.aliyuncs.com'
const policy = 'eyJleHBpcmF0aW9uIjoiMjAyMC0wMS0wMVQxMjowMDowMC4wMDBaIiwiY29uZGl0aW9ucyI6W1siY29udGVudC1sZW5ndGgtcmFuZ2UiLDAsMTA0ODU3NjAwMF1dfQ=='
const signature = 'yWKDyyHE95tfg11VDmCJopVdYDk='
const OSSAccessKeyId = 'LTAI5mLChc6ua6lg'
const appKey = '7c12f402736340c40638aaf57f59772f'

const salaryArr = ['3000元以下', '3001-5000元', '5001-8000元', '8001-20000元', '20001-50000元', '50000元以上'];
const salaryObj = [
  { salaryText: '3000元以下', min: '', max: 3000 },
  { salaryText: '3001-5000元', min: 3001, max: 5000 },
  { salaryText: '5001-8000元', min: 5001, max: 8000 },
  { salaryText: '8001-20000元', min: 8001, max: 20000 },
  { salaryText: '20001-50000元', min: 20001, max: 50000 },
  { salaryText: '50000元以上', min: 50000, max: '' },
]
const educationArr = ['高中及以下', '中专', '大专', '本科', '硕士', '博士'];

const mapKey = 'b554b42563ee9f46ffdb6063e70afec6';

const ticketType = [
  { name: '收费', type: '1' },
  { name: '免费', type: '2' },
  { name: '自费', type: '3' },
]

const ticketTypeObj = {
  '1': '收费',
  '2': '免费',
  '3': '自费'
}
const verifyTypeObj = {
  '1': '不需要审核',
  '2': '需要主办方审核',
  '3': '需要系统审核'
}
const marriageArr = ['未婚', '离异', '丧偶'];
const sexArr = ['男士', '女士'];
const carArr = ['已买车', '未买车'];
const houseArr = ['和家人同住', '已购房', '租房', '打算婚后购房', '住在单位宿舍'];

let heightArr = []
for (let i = 110; i < 230; i ++) {
  heightArr.push(i + 'cm')
}

module.exports = {
  allEnrollState,
  allSex,
  allType,
  allTime,
  allCost,
  multiple,
  professionArr,
  multipleObj,
  activityTypeList,
  mapKey,
  ticketType,
  ticketTypeObj,
  verifyTypeObj,
  educationArr,
  heightArr,
  salaryArr,
  salaryObj,
  marriageArr,
  houseArr,
  carArr,
  sexArr,
  labels,
  policy,
  signature,
  OSSAccessKeyId,
  ossUrl,
  chooseLabels,
  appKey
}