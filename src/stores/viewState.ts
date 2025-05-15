import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'

// 辅助函数生成随机日期字符串
const randomDateStr = () => {
  const year = 2023 + Math.floor(Math.random() * 3); // 2023-2025
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 模拟后端API调用
const fakeApiCall = (dataType: string | null, fileName: string | null): Promise<any[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!dataType || !fileName) {
        resolve([])
        return
      }
      console.log(`模拟API调用: 获取 ${fileName} (${dataType}) 的数据 (已更新字段)`);
      ElMessage.success(`已加载文件: ${fileName} (${dataType}) 的数据 (含原始字段)`);
      
      let data: any[] = [];
      const recordCount = 2; // 生成两条模拟记录

      for (let i = 0; i < recordCount; i++) {
        const suffix = `_Rec${i+1}_(${fileName.substring(0,10)})`;
        switch (dataType) {
          case 'salesOrder':
            data.push({
              id: `SO_${Date.now()}_${i}${suffix}`,
              sku: `SKU_SO_${i}${suffix}`,
              orderType: '销售出库',
              projectItem: `项目P${i}${suffix}`,
              orderDate: randomDateStr(),
              materialCode: `MAT_SO_${i}${suffix}`,
              quantity: Math.floor(Math.random() * 200) + 50,
              customer: `客户C${i}${suffix}`,
              amount: parseFloat((Math.random() * 5000 + 1000).toFixed(2))
            });
            break;
          case 'materialData':
            data.push({
              materialCode: `MAT_${Date.now()}_${i}${suffix}`,
              materialName: `物料M${i}${suffix}`,
              specification: `规格S${i}${suffix}`,
              category: `类别Cat${i % 3}${suffix}`,
              unit: ['个', '件', '套'][i % 3],
              price: parseFloat((Math.random() * 100 + 10).toFixed(2)),
              inventory: Math.floor(Math.random() * 1000) + 100
            });
            break;
          case 'inboundOrder':
            data.push({
              orderNumber: `INB_${Date.now()}_${i}${suffix}`,
              relatedOrder: `PO_REL_${i}${suffix}`,
              orderType: ['采购入库', '生产入库'][i % 2],
              supplierName: `供应商SUP${i}${suffix}`,
              orderDate: randomDateStr(),
              plannedDate: randomDateStr(),
              actualDate: randomDateStr(),
              totalAmount: parseFloat((Math.random() * 10000 + 2000).toFixed(2)),
              itemCount: Math.floor(Math.random() * 10) + 1,
              warehouseName: `仓库W${i % 2}${suffix}`,
              status: ['pending', 'completed', 'partial'][i % 3]
            });
            break;
          case 'inventoryRecord':
            data.push({
              id: `INV_${Date.now()}_${i}${suffix}`,
              sku: `SKU_INV_${i}${suffix}`,
              materialName: `物料Inv${i}${suffix}`,
              warehouse: `仓库Inv${i % 2}${suffix}`,
              containerId: `CONT_INV_${i}${suffix}`,
              quantity: Math.floor(Math.random() * 500) + 50,
              lastUpdate: randomDateStr()
            });
            break;
        }
      }
      resolve(data);
    }, 500)
  })
}

// 文件接口定义
interface ProjectFile {
  id: string;
  name: string;
  date: string;
  size: string;
}

interface Project {
  id: number;
  name: string;
  company: string;
  location: string;
  filesVisible: boolean;
  files: ProjectFile[];
}

// 模拟获取项目和文件数据
const getProjectsAndFiles = (): Promise<{projects: Project[]}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 这里模拟了与 Sidebar.vue 中相同的项目和文件数据结构
      const projects: Project[] = [
        {
          id: 1,
          name: '南京物流中心项目',
          company: '江苏分公司',
          location: '南京市江宁区',
          filesVisible: true,
          files: [
            { id: 'file1', name: '销售出库订单_202503.xlsx', date: '2025-03-20', size: '3.4MB' },
            { id: 'file2', name: '物料主数据_202502.xlsx', date: '2025-02-15', size: '2.8MB' },
            { id: 'file3', name: '入库单据_202501.xlsx', date: '2025-01-10', size: '3.1MB' },
            { id: 'file4', name: '库存记录_202501.xlsx', date: '2025-01-15', size: '2.5MB' }
          ]
        },
        {
          id: 2,
          name: '上海配送中心项目',
          company: '上海分公司',
          location: '上海市嘉定区',
          filesVisible: false,
          files: [
            { id: 'file5', name: '销售出库订单_202503_SH.xlsx', date: '2025-03-18', size: '4.2MB' },
            { id: 'file6', name: '物料主数据_202502_SH.xlsx', date: '2025-02-12', size: '3.5MB' }
          ]
        }
      ];
      
      resolve({ projects });
    }, 300);
  });
};

export const useViewStateStore = defineStore('viewState', {
  state: () => ({
    activeOrderDataType: null as string | null,
    activeOrderData: null as any[] | null,
    activeOrderDataFileName: null as string | null,
    isLoading: false as boolean,
  }),
  actions: {
    setActiveOrderContext(dataType: string | null, fileName: string | null) {
      this.activeOrderDataType = dataType
      this.activeOrderDataFileName = fileName
      if (dataType && fileName) {
        this.fetchActiveOrderData()
      } else {
        this.clearActiveOrderData()
      }
    },
    async fetchActiveOrderData() {
      if (!this.activeOrderDataType || !this.activeOrderDataFileName) {
        this.activeOrderData = [] 
        return
      }
      this.isLoading = true
      try {
        const data = await fakeApiCall(this.activeOrderDataType, this.activeOrderDataFileName)
        this.activeOrderData = data
      } catch (error) {
        console.error('获取订单数据失败:', error)
        ElMessage.error('获取订单数据失败');
        this.activeOrderData = [] 
      } finally {
        this.isLoading = false
      }
    },
    clearActiveOrderData() {
      this.activeOrderData = null
      this.activeOrderDataType = null 
      this.activeOrderDataFileName = null
    },
    // 新增：加载第一个项目的第一个文件数据
    async loadFirstProjectFirstFile(defaultType: string = 'salesOrder'): Promise<boolean> {
      this.isLoading = true
      
      try {
        // 获取项目和文件数据
        const { projects } = await getProjectsAndFiles()
        
        // 如果没有项目，返回false
        if (projects.length === 0) {
          this.clearActiveOrderData()
          return false
        }
        
        // 获取第一个项目
        const firstProject = projects[0]
        
        // 如果项目没有文件，返回false
        if (!firstProject.files || firstProject.files.length === 0) {
          this.clearActiveOrderData()
          return false
        }
        
        // 文件类型映射
        const fileNameMap: Record<string, string> = {
          'salesOrder': '销售出库订单',
          'materialData': '物料主数据',
          'inboundOrder': '入库单据',
          'inventoryRecord': '库存记录'
        }
        
        // 尝试查找默认类型的文件
        let targetFile: ProjectFile | null = null
        let targetType = defaultType
        
        // 先尝试查找默认类型的文件
        for (const file of firstProject.files) {
          if (file.name.toLowerCase().includes(fileNameMap[defaultType].toLowerCase())) {
            targetFile = file
            break
          }
        }
        
        // 如果没找到默认类型文件，就用第一个文件
        if (!targetFile) {
          targetFile = firstProject.files[0]
          
          // 判断文件类型
          const fileName = targetFile.name.toLowerCase()
          let typeFound = false
          
          for (const [type, keyword] of Object.entries(fileNameMap)) {
            if (fileName.includes(keyword.toLowerCase())) {
              targetType = type
              typeFound = true
              break
            }
          }
          
          if (!typeFound) {
            // 如果无法判断类型，仍然使用默认类型
            targetType = defaultType
          }
        }
        
        // 设置激活的订单数据上下文并加载数据
        console.log(`自动加载首个项目(${firstProject.name})的文件: ${targetFile.name}`)
        this.setActiveOrderContext(targetType, targetFile.name)
        // 注意：setActiveOrderContext 内部会调用 fetchActiveOrderData
        return true
        
      } catch (error) {
        console.error('加载第一个项目的第一个文件数据失败:', error)
        ElMessage.error('加载初始数据失败')
        this.clearActiveOrderData()
        return false
      } finally {
        this.isLoading = false
      }
    },
  },
}) 