<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import { regionData } from './regionData'

interface CompanyLocation {
  [key: string]: string[]
}

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const emit = defineEmits(['update:visible', 'save'])

// 表单引用
const formRef = ref<FormInstance>()

// 分公司选项
const companyOptions = [
  '江苏分公司',
  '上海分公司',
  '广东分公司',
  '北京分公司',
  '浙江分公司',
  '四川分公司'
]

// 分公司与省市区映射
const companyToLocation: CompanyLocation = {
  '江苏分公司': ['江苏省', '南京市', '江宁区'],
  '上海分公司': ['上海市', '上海市', '嘉定区'],
  '广东分公司': ['广东省', '广州市', '番禺区'],
  '北京分公司': ['北京市', '北京市', '朝阳区'],
  '浙江分公司': ['浙江省', '杭州市', '滨江区'],
  '四川分公司': ['四川省', '成都市', '武侯区']
}

// 使用完整的中国省市区数据
const regionOptions = regionData

// 表单数据
const form = reactive({
  name: '',
  company: '',
  location: [] as string[]
})

// 表单验证规则
const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  company: [
    { required: true, message: '请选择所属分公司', trigger: 'change' }
  ],
  location: [
    { required: true, message: '请选择项目所在地', trigger: 'change' }
  ]
})

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  form.location = []
}

// 获取分公司对应的省份
const getProvinceByCompany = (company: string): string => {
  const location = companyToLocation[company]
  return location ? location[0] : ''
}

// 监听分公司选择变化
const handleCompanyChange = (val: string) => {
  if (companyToLocation[val]) {
    const province = companyToLocation[val][0]
    
    // 在regionData中查找对应省份
    const provinceObj = regionOptions.find(item => item.value === province)
    
    if (provinceObj && provinceObj.children && provinceObj.children.length > 0) {
      // 获取第一个市
      const firstCity = provinceObj.children[0]
      
      // 获取第一个区
      const firstDistrict = firstCity.children && firstCity.children.length > 0 
        ? firstCity.children[0].value 
        : ''
      
      // 设置为第一个市和第一个区
      form.location = [province, firstCity.value, firstDistrict]
      
      // 显示提示
      ElMessage.info(`已自动设置项目所在地为: ${firstCity.label}${firstDistrict ? firstCity.children[0].label : ''}`)
    } else {
      // 如果没有找到省份数据，则使用原来的默认设置
      form.location = companyToLocation[val]
      ElMessage.info(`已自动设置项目所在地为: ${form.location[1]}${form.location[2]}`)
    }
  } else {
    form.location = []
  }
}

// 获取地区显示文本
const getLocationText = (location: string[]): string => {
  if (location.length < 2) return ''
  return location.slice(1).join('')
}

// 取消
const handleCancel = () => {
  resetForm()
  emit('update:visible', false)
}

// 保存
const handleSave = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      emit('save', {
        name: form.name,
        company: form.company,
        location: form.location[2] ? `${form.location[1]}${form.location[2]}` : ''
      })
      handleCancel()
      ElMessage.success('创建成功')
    }
  })
}
</script>

<template>
  <el-dialog
    v-model="visible"
    title="新建项目"
    width="500px"
    :close-on-click-modal="false"
    @closed="resetForm"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      label-position="left"
    >
      <el-form-item label="项目名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入项目名称" />
      </el-form-item>
      
      <el-form-item label="所属分公司" prop="company">
        <el-select 
          v-model="form.company" 
          placeholder="请选择分公司"
          style="width: 100%"
          @change="handleCompanyChange"
          filterable
        >
          <el-option
            v-for="company in companyOptions"
            :key="company"
            :label="company"
            :value="company"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="项目所在地" prop="location">
        <el-cascader
          v-model="form.location"
          :options="regionOptions"
          :props="{ 
            checkStrictly: false,
            value: 'value',
            label: 'label',
            children: 'children',
            expandTrigger: 'hover'
          }"
          placeholder="例如：南京市江宁区"
          style="width: 100%"
          filterable
          clearable
        >
          <template #default="{ data }">
            <span>{{ data.label }}</span>
            <span v-if="data.value === getProvinceByCompany(form.company) && form.company" 
                  style="color: #67c23a; margin-left: 5px; font-size: 12px;">
              (当前分公司所在省份)
            </span>
          </template>
        </el-cascader>
        
        <div v-if="form.location.length >= 2" style="margin-top: 5px; font-size: 12px; color: #909399;">
          当前选择: {{ getLocationText(form.location) }}
        </div>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style> 