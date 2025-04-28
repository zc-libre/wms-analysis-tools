// 模拟项目数据
export const mockProjects = [
  {
    id: 1,
    name: '广州仓储项目',
    company: '广州物流有限公司',
    location: '广州市黄埔区',
    createdAt: '2023-05-10',
    files: [
      { id: 1, name: '项目计划书.pdf', type: 'document', size: '2.5MB', uploadTime: '2023-05-11' },
      { id: 2, name: '仓库平面图.dwg', type: 'blueprint', size: '5.1MB', uploadTime: '2023-05-12' }
    ]
  },
  {
    id: 2,
    name: '深圳配送中心',
    company: '深圳快递物流科技公司',
    location: '深圳市南山区',
    createdAt: '2023-06-15',
    files: [
      { id: 3, name: '配送中心方案.pdf', type: 'document', size: '3.2MB', uploadTime: '2023-06-16' },
      { id: 4, name: '设备清单.xlsx', type: 'spreadsheet', size: '1.8MB', uploadTime: '2023-06-17' }
    ]
  },
  {
    id: 3,
    name: '上海物流中心',
    company: '上海国际物流集团',
    location: '上海市浦东新区',
    createdAt: '2023-07-20',
    files: [
      { id: 5, name: '合同协议.pdf', type: 'document', size: '4.1MB', uploadTime: '2023-07-21' },
      { id: 6, name: '进度计划表.xlsx', type: 'spreadsheet', size: '2.3MB', uploadTime: '2023-07-22' }
    ]
  }
]

// 模拟订单数据
export const mockOrders = [
  {
    id: 'SO-20230501-001',
    customer: '广州百货商场',
    createTime: '2023-05-01 09:30:45',
    orderType: '销售订单',
    status: '已完成',
    totalAmount: 125000,
    items: [
      { sku: 'SKU-A10001', name: '高级办公椅', quantity: 50, price: 1200, total: 60000 },
      { sku: 'SKU-B20002', name: '办公桌', quantity: 25, price: 2600, total: 65000 }
    ]
  },
  {
    id: 'SO-20230610-002',
    customer: '深圳科技园办公区',
    createTime: '2023-06-10 14:22:10',
    orderType: '销售订单',
    status: '待发货',
    totalAmount: 84500,
    items: [
      { sku: 'SKU-A10005', name: '人体工学椅', quantity: 35, price: 1500, total: 52500 },
      { sku: 'SKU-C30001', name: '文件柜', quantity: 20, price: 1600, total: 32000 }
    ]
  },
  {
    id: 'PO-20230715-001',
    supplier: '优品家具制造厂',
    createTime: '2023-07-15 10:05:32',
    orderType: '采购订单',
    status: '待收货',
    totalAmount: 156000,
    items: [
      { sku: 'SKU-A10001', name: '高级办公椅', quantity: 80, price: 950, total: 76000 },
      { sku: 'SKU-B20002', name: '办公桌', quantity: 40, price: 2000, total: 80000 }
    ]
  }
]

// 模拟物料数据
export const mockMaterials = [
  {
    id: 'M-A10001',
    name: '高级办公椅',
    category: '家具',
    specification: '黑色皮质，可升降，带轮',
    unit: '把',
    price: 1200,
    stock: 150,
    supplier: '优品家具制造厂',
    properties: {
      material: '皮质+金属',
      weight: '15kg',
      dimensions: '60x60x110cm',
      warranty: '3年'
    }
  },
  {
    id: 'M-B20002',
    name: '办公桌',
    category: '家具',
    specification: '木质，1.5米长',
    unit: '张',
    price: 2600,
    stock: 85,
    supplier: '优品家具制造厂',
    properties: {
      material: '实木+钢架',
      weight: '45kg',
      dimensions: '150x75x73cm',
      warranty: '5年'
    }
  },
  {
    id: 'M-C30001',
    name: '文件柜',
    category: '存储设备',
    specification: '四层，带锁',
    unit: '个',
    price: 1600,
    stock: 60,
    supplier: '钢宝办公用品有限公司',
    properties: {
      material: '冷轧钢板',
      weight: '35kg',
      dimensions: '90x40x180cm',
      warranty: '10年'
    }
  }
]

// 模拟入库单据数据
export const mockInboundOrders = [
  {
    id: 'IN-20230605-001',
    supplier: '优品家具制造厂',
    createTime: '2023-06-05 11:20:35',
    operator: '张三',
    status: '已完成',
    relatedOrder: 'PO-20230601-001',
    items: [
      { sku: 'SKU-A10001', name: '高级办公椅', quantity: 60, location: 'A-01-01' },
      { sku: 'SKU-B20002', name: '办公桌', quantity: 30, location: 'A-02-01' }
    ]
  },
  {
    id: 'IN-20230720-002',
    supplier: '钢宝办公用品有限公司',
    createTime: '2023-07-20 09:15:42',
    operator: '李四',
    status: '已完成',
    relatedOrder: 'PO-20230715-002',
    items: [
      { sku: 'SKU-C30001', name: '文件柜', quantity: 40, location: 'B-01-01' }
    ]
  }
]

// 模拟库存记录数据
export const mockInventoryRecords = [
  {
    id: 'INV-A10001-0001',
    sku: 'SKU-A10001',
    name: '高级办公椅',
    quantity: 30,
    location: 'A-01-01',
    status: '可用',
    updateTime: '2023-06-05 14:30:22',
    operator: '张三',
    container: 'CN-0010'
  },
  {
    id: 'INV-A10001-0002',
    sku: 'SKU-A10001',
    name: '高级办公椅',
    quantity: 30,
    location: 'A-01-02',
    status: '可用',
    updateTime: '2023-06-05 14:35:10',
    operator: '张三',
    container: 'CN-0011'
  },
  {
    id: 'INV-B20002-0001',
    sku: 'SKU-B20002',
    name: '办公桌',
    quantity: 30,
    location: 'A-02-01',
    status: '可用',
    updateTime: '2023-06-05 15:10:45',
    operator: '张三',
    container: 'CN-0012'
  },
  {
    id: 'INV-C30001-0001',
    sku: 'SKU-C30001',
    name: '文件柜',
    quantity: 40,
    location: 'B-01-01',
    status: '可用',
    updateTime: '2023-07-20 11:25:18',
    operator: '李四',
    container: 'CN-0013'
  }
] 