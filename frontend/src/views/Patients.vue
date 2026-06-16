<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">患者管理</div>
      <div class="header-actions">
        <el-input v-model="keyword" placeholder="搜索患者姓名或电话" style="width: 240px; margin-right: 12px;" clearable @input="loadPatients" />
        <el-button type="primary" @click="openAddDialog">
          <el-icon><Plus /></el-icon>新增患者
        </el-button>
      </div>
    </div>

    <el-table :data="patients" border v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="gender" label="性别" width="80" />
      <el-table-column prop="age" label="年龄" width="80" />
      <el-table-column prop="phone" label="电话" width="140" />
      <el-table-column prop="medicalHistory" label="病史" show-overflow-tooltip />
      <el-table-column prop="remark" label="备注" show-overflow-tooltip />
      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="openEditDialog(row)">编辑</el-button>
          <el-button type="primary" link size="small" @click="goToOrders(row)">查看订单</el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editMode ? '编辑患者' : '新增患者'" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="form.gender" placeholder="请选择" style="width: 100%;">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>
        <el-form-item label="年龄">
          <el-input-number v-model="form.age" :min="0" :max="150" />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="病史">
          <el-input v-model="form.medicalHistory" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getPatients, createPatient, updatePatient, deletePatient } from '@/api/patient'

const router = useRouter()
const loading = ref(false)
const keyword = ref('')
const patients = ref([])
const dialogVisible = ref(false)
const editMode = ref(false)
const editId = ref(null)
const formRef = ref()

const defaultForm = { name: '', gender: '', age: null, phone: '', medicalHistory: '', remark: '' }
const form = reactive({ ...defaultForm })
const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
}

function formatDate(d) {
  return d ? new Date(d).toLocaleString('zh-CN') : ''
}

async function loadPatients() {
  loading.value = true
  try {
    patients.value = await getPatients(keyword.value)
  } finally {
    loading.value = false
  }
}

function openAddDialog() {
  editMode.value = false
  editId.value = null
  Object.assign(form, defaultForm)
  dialogVisible.value = true
}

function openEditDialog(row) {
  editMode.value = true
  editId.value = row.id
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  if (editMode.value) {
    await updatePatient(editId.value, form)
    ElMessage.success('编辑成功')
  } else {
    await createPatient(form)
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
  loadPatients()
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定要删除患者 "${row.name}" 吗？`, '提示', { type: 'warning' })
    await deletePatient(row.id)
    ElMessage.success('删除成功')
    loadPatients()
  } catch {}
}

function goToOrders(row) {
  router.push(`/orders?patientId=${row.id}`)
}

onMounted(loadPatients)
</script>
