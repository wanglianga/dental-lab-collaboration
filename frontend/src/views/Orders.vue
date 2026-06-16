<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">订单管理</div>
      <div class="header-actions">
        <el-select v-model="statusFilter" placeholder="订单状态" style="width: 140px; margin-right: 12px;" clearable @change="loadOrders">
          <el-option label="待处理" value="pending" />
          <el-option label="加工中" value="processing" />
          <el-option label="部分完成" value="partial_completed" />
          <el-option label="已完成" value="completed" />
          <el-option label="已退回" value="returned" />
        </el-select>
        <el-button type="primary" @click="openCreateDialog" v-if="canCreateOrder">
          <el-icon><Plus /></el-icon>新建订单
        </el-button>
      </div>
    </div>

    <el-table :data="orders" border v-loading="loading">
      <el-table-column prop="orderNo" label="订单号" width="170" />
      <el-table-column label="患者" width="120">
        <template #default="{ row }">{{ row.patient?.name }}</template>
      </el-table-column>
      <el-table-column label="医生" width="100">
        <template #default="{ row }">{{ row.doctor?.name }}</template>
      </el-table-column>
      <el-table-column label="牙齿数量" width="100">
        <template #default="{ row }">{{ row.teeth?.length || 0 }} 颗</template>
      </el-table-column>
      <el-table-column label="牙齿明细">
        <template #default="{ row }">
          <el-tag
            v-for="t in row.teeth"
            :key="t.id"
            size="small"
            style="margin: 2px;"
            :class="'status-tag status-' + t.status"
          >
            {{ t.toothNumber }}号[{{ toothStatusText(t.status) }}]
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="订单状态" width="110">
        <template #default="{ row }">
          <span class="status-tag" :class="'status-' + row.status">{{ statusText(row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="170">
        <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="goToDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="createVisible" title="新建订单" width="700px">
      <el-form :model="orderForm" :rules="orderRules" ref="orderFormRef" label-width="90px">
        <el-form-item label="患者" prop="patientId">
          <el-select v-model="orderForm.patientId" filterable placeholder="选择患者" style="width: 100%;">
            <el-option v-for="p in patientList" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="医生" prop="doctorId">
          <el-select v-model="orderForm.doctorId" filterable placeholder="选择医生" style="width: 100%;">
            <el-option v-for="d in doctorList" :key="d.id" :label="d.name" :value="d.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="咬合关系">
          <el-input v-model="orderForm.occlusion" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="设计要求">
          <el-input v-model="orderForm.designRequirement" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="临床备注">
          <el-input v-model="orderForm.clinicalNote" type="textarea" :rows="2" />
        </el-form-item>

        <el-divider>牙齿信息</el-divider>
        <div v-for="(tooth, idx) in orderForm.teeth" :key="idx" class="tooth-form-row">
          <el-form-item label="牙位号" :prop="'teeth.' + idx + '.toothNumber'">
            <el-input-number v-model="tooth.toothNumber" :min="1" :max="48" />
          </el-form-item>
          <el-form-item label="修复类型">
            <el-select v-model="tooth.restorationType" style="width: 160px;">
              <el-option label="单冠" value="单冠" />
              <el-option label="桥体" value="桥体" />
              <el-option label="嵌体" value="嵌体" />
              <el-option label="贴面" value="贴面" />
              <el-option label="活动义齿" value="活动义齿" />
              <el-option label="种植体" value="种植体" />
            </el-select>
          </el-form-item>
          <el-form-item label="材料">
            <el-select v-model="tooth.material" style="width: 160px;">
              <el-option label="氧化锆" value="氧化锆" />
              <el-option label="钴铬合金" value="钴铬合金" />
              <el-option label="纯钛" value="纯钛" />
              <el-option label="贵金属" value="贵金属" />
              <el-option label="树脂" value="树脂" />
              <el-option label="玻璃陶瓷" value="玻璃陶瓷" />
            </el-select>
          </el-form-item>
          <el-form-item label="比色">
            <el-select v-model="tooth.shade" style="width: 120px;">
              <el-option label="A1" value="A1" /><el-option label="A2" value="A2" /><el-option label="A3" value="A3" /><el-option label="A3.5" value="A3.5" /><el-option label="A4" value="A4" />
              <el-option label="B1" value="B1" /><el-option label="B2" value="B2" /><el-option label="B3" value="B3" /><el-option label="B4" value="B4" />
              <el-option label="C1" value="C1" /><el-option label="C2" value="C2" /><el-option label="C3" value="C3" /><el-option label="C4" value="C4" />
              <el-option label="D1" value="D1" /><el-option label="D2" value="D2" /><el-option label="D3" value="D3" /><el-option label="D4" value="D4" />
            </el-select>
          </el-form-item>
          <el-form-item label="要求">
            <el-input v-model="tooth.requirement" style="width: 180px;" />
          </el-form-item>
          <el-button type="danger" link @click="removeTooth(idx)" v-if="orderForm.teeth.length > 1">删除</el-button>
        </div>
        <el-button type="primary" plain @click="addTooth">+ 添加牙齿</el-button>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateOrder">提交订单</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { getOrders, createOrder } from '@/api/order'
import { getPatients } from '@/api/patient'
import { getUsers } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const orders = ref([])
const statusFilter = ref('')
const patientList = ref([])
const doctorList = ref([])

const canCreateOrder = computed(() => ['doctor', 'receptionist'].includes(userStore.user?.role))

const statusMap = {
  pending: '待处理', processing: '加工中', partial_completed: '部分完成', completed: '已完成', returned: '已退回',
}
const toothStatusMap = {
  pending: '待处理', processing: '加工中', inspection: '质检中', rework: '返修', shipped: '已发货', delivered: '已送达', completed: '已完成',
}
function statusText(s) { return statusMap[s] || s }
function toothStatusText(s) { return toothStatusMap[s] || s }
function formatDate(d) { return d ? new Date(d).toLocaleString('zh-CN') : '' }

async function loadOrders() {
  loading.value = true
  try {
    orders.value = await getOrders(statusFilter.value || undefined)
  } finally {
    loading.value = false
  }
}

function goToDetail(row) {
  router.push(`/orders/${row.id}`)
}

const createVisible = ref(false)
const orderFormRef = ref()
const orderForm = reactive({
  patientId: null,
  doctorId: null,
  clinicalNote: '',
  occlusion: '',
  designRequirement: '',
  teeth: [{ toothNumber: 11, material: '氧化锆', shade: 'A2', restorationType: '单冠', requirement: '' }],
})
const orderRules = {
  patientId: [{ required: true, message: '请选择患者', trigger: 'change' }],
  doctorId: [{ required: true, message: '请选择医生', trigger: 'change' }],
}

function addTooth() {
  orderForm.teeth.push({ toothNumber: 11, material: '氧化锆', shade: 'A2', restorationType: '单冠', requirement: '' })
}
function removeTooth(idx) {
  orderForm.teeth.splice(idx, 1)
}

function openCreateDialog() {
  Object.assign(orderForm, {
    patientId: null,
    doctorId: userStore.user?.role === 'doctor' ? userStore.user.id : null,
    clinicalNote: '',
    occlusion: '',
    designRequirement: '',
    teeth: [{ toothNumber: 11, material: '氧化锆', shade: 'A2', restorationType: '单冠', requirement: '' }],
  })
  createVisible.value = true
}

async function handleCreateOrder() {
  const valid = await orderFormRef.value.validate().catch(() => false)
  if (!valid) return
  await createOrder(orderForm)
  ElMessage.success('订单创建成功')
  createVisible.value = false
  loadOrders()
}

onMounted(async () => {
  loadOrders()
  patientList.value = await getPatients()
  const users = await getUsers()
  doctorList.value = users.filter(u => u.role === 'doctor')
})
</script>

<style scoped>
.tooth-form-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  flex-wrap: wrap;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  margin-bottom: 10px;
}
.tooth-form-row :deep(.el-form-item) {
  margin-bottom: 0;
}
</style>
