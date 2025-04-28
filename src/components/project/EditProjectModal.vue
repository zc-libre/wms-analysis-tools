<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

// 定义项目类型
interface ProjectData {
  id: number
  name: string
  code: string
  manager: string
  department: string
  team: string[]
  startDate: string
  endDate: string | null
  status: string
  description: string
  progress: number
  [key: string]: any // 添加索引签名
}

// 定义props和事件
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  project: {
    type: Object as () => ProjectData | null,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive<ProjectData>({
  id: 0,
  name: '',
  code: '',
  manager: '',
  department: '',
  team: [] as string[],
  startDate: '',
  endDate: '',
  status: 'inProgress',
  description: '',
  progress: 0
})

// 表单验证规则
const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入项目编号', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9-]+$/, message: '只能包含字母、数字和连字符', trigger: 'blur' }
  ],
  manager: [
    { required: true, message: '请输入项目负责人', trigger: 'blur' }
  ],
  department: [
    { required: true, message: '请输入所属部门', trigger: 'blur' }
  ],
  startDate: [
    { required: true, message: '请选择开始日期', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择项目状态', trigger: 'change' }
  ],
  progress: [
    { required: true, message: '请输入项目进度', trigger: 'blur' },
    { type: 'number', min: 0, max: 100, message: '进度范围为0-100', trigger: 'blur' }
  ]
})

// 状态选项
const statusOptions = [
  { label: '进行中', value: 'inProgress' },
  { label: '已完成', value: 'completed' },
  { label: '已暂停', value: 'paused' },
  { label: '已取消', value: 'cancelled' }
]

// 新增团队成员
const newTeamMember = ref('')
const addTeamMember = () => {
  if (newTeamMember.value.trim()) {
    if (!form.team.includes(newTeamMember.value)) {
      form.team.push(newTeamMember.value)
      newTeamMember.value = ''
    } else {
      ElMessage.warning('该成员已存在')
    }
  }
}

// 移除团队成员
const removeTeamMember = (index: number) => {
  form.team.splice(index, 1)
}

// 初始化表单数据
const initFormData = () => {
  if (props.project) {
    Object.keys(form).forEach(key => {
      if (key === 'team' && props.project?.team) {
        form.team = [...props.project.team]
      } else if (props.project && key in props.project) {
        form[key] = props.project[key]
      }
    })
  }
}

// 关闭模态框
const close = () => {
  emit('update:modelValue', false)
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid, fields) => {
    if (valid) {
      // 模拟表单提交
      setTimeout(() => {
        // 实际项目中应调用 API 服务
        emit('success')
        close()
      }, 600)
    }
  })
}

// 监听 modelValue 变化
const isShow = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val)
})

// 当模态框显示或项目数据变化时初始化表单
watch([() => props.modelValue, () => props.project], ([visible, project]) => {
  if (visible && project) {
    initFormData()
  }
})
</script>

<template>
  <el-dialog
    v-model="isShow"
    title="编辑项目"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      label-position="right"
    >
      <el-form-item label="项目名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入项目名称" />
      </el-form-item>
      
      <el-form-item label="项目编号" prop="code">
        <el-input v-model="form.code" placeholder="请输入项目编号" />
      </el-form-item>
      
      <el-form-item label="项目负责人" prop="manager">
        <el-input v-model="form.manager" placeholder="请输入项目负责人" />
      </el-form-item>
      
      <el-form-item label="所属部门" prop="department">
        <el-input v-model="form.department" placeholder="请输入所属部门" />
      </el-form-item>
      
      <el-form-item label="项目团队">
        <div class="team-input-wrapper">
          <el-input 
            v-model="newTeamMember" 
            placeholder="请输入团队成员"
            @keyup.enter="addTeamMember"
          >
            <template #append>
              <el-button @click="addTeamMember">添加</el-button>
            </template>
          </el-input>
        </div>
        
        <div class="team-tags" v-if="form.team.length > 0">
          <el-tag
            v-for="(member, index) in form.team"
            :key="index"
            class="team-tag"
            closable
            @close="removeTeamMember(index)"
          >
            {{ member }}
          </el-tag>
        </div>
        <div v-else class="team-empty">暂无团队成员</div>
      </el-form-item>
      
      <el-form-item label="开始日期" prop="startDate">
        <el-date-picker
          v-model="form.startDate"
          type="date"
          placeholder="请选择开始日期"
          style="width: 100%"
        />
      </el-form-item>
      
      <el-form-item label="结束日期" prop="endDate">
        <el-date-picker
          v-model="form.endDate"
          type="date"
          placeholder="请选择结束日期"
          style="width: 100%"
        />
      </el-form-item>
      
      <el-form-item label="项目状态" prop="status">
        <el-select v-model="form.status" placeholder="请选择项目状态" style="width: 100%">
          <el-option
            v-for="option in statusOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="项目进度" prop="progress">
        <div class="progress-input">
          <el-slider v-model="form.progress" :max="100" :min="0" :step="1" />
          <div class="progress-value">{{ form.progress }}%</div>
        </div>
      </el-form-item>
      
      <el-form-item label="项目描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="4"
          placeholder="请输入项目描述"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="submitForm">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.team-input-wrapper {
  margin-bottom: 10px;
}

.team-tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 5px;
}

.team-tag {
  margin-right: 6px;
  margin-bottom: 6px;
}

.team-empty {
  font-size: 14px;
  color: #909399;
  padding: 5px 0;
}

.progress-input {
  display: flex;
  align-items: center;
}

.progress-value {
  width: 50px;
  text-align: center;
  margin-left: 10px;
  font-size: 14px;
}
</style> 