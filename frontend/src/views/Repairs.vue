<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">返修管理</div>
      <div class="header-actions">
        <el-select v-model="statusFilter" placeholder="按状态筛选" style="width: 140px;" clearable @change="loadData">
          <el-option label="待处理" value="pending" />
          <el-option label="处理中" value="processing" />
          <el-option label="已完成" value="completed" />
          <el-option label="已退回" value="returned" />
        </el-select>
      </div>
    </div>

    <el-table :data="repairs" border v-loading="loading">
      <el-table-column label="牙位" width="80">
        <template #default="{ row }">
          <el-tag type="danger" size="small">#{{ row.tooth?.toothNumber }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="患者" width="100">
        <template #default="{ row }">{{ row.tooth?.order?.patient?.name }}</template>
      </el-table-column>
      <el-table-column label="订单号" width="150">
        <template #default="{ row }">{{ row.tooth?.order?.orderNo }}</template>
      </el-table-column>
      <el-table-column label="申请人" width="100">
        <template #default="{ row }">{{ row.reporter?.name }}</template>
      </el-table-column>
      <el-table-column label="处理人" width="100">
        <template #default="{ row }">{{ row.handler?.name || '-' }}</template>
      </el-table-column>
      <el-table-column prop="reason" label="返修原因" show-overflow-tooltip />
      <el-table-column prop="repairAction" label="处理措施" show-overflow-tooltip />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <span class="status-tag" :class="'status-' + row.status">{{ statusText(row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="申请时间" width="170">
        <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="goTooth(row)">查看牙齿</el-button>
          <el-button type="warning" link size="small" @click="openHandle(row)" v-if="row.status !== 'completed'">处理</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="handleVisible" title="处理返修" width="500px">
      <el-form :model="handleForm" label-width="90px">
        <el-form-item label="返修原因">
          <el-input v-model="handleForm.reason" type="textarea" :rows="2" disabled />
        </el-form-item>
        <el-form-item label="处理措施" required>
          <el-input v-model="handleForm.repairAction" type="textarea" :rows="3" placeholder="请填写处理措施..." />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="handleForm.status" style="width: 100%;">
            <el-option label="处理中" value="processing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已退回" value="returned" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="handleForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleVisible = false">取消</el-button>
        <el-button type="primary" @click="submitHandle">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { getRepairs, updateRepair } from '@/api/repair'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const statusFilter = ref('')
const repairs = ref([])

const handleVisible = ref(false)
const currentRepairId = ref(null)
const handleForm = reactive({ reason: '', repairAction: '', status: 'processing', remark: '' })

const statusMap = {
  pending: '待处理', processing: '处理中', completed: '已完成', returned: '已退回',
}
function statusText(s) { return statusMap[s] || s }
function formatDate(d) { return d ? new Date(d).toLocaleString('zh-CN') : '' }

async function loadData() {
  loading.value = true
  try {
    repairs.value = await getRepairs(statusFilter.value || undefined)
  } finally {
    loading.value = false
  }
}

function openHandle(row) {
  currentRepairId.value = row.id
  handleForm.reason = row.reason
  handleForm.repairAction = row.repairAction || ''
  handleForm.status = row.status === 'pending' ? 'processing' : row.status
  handleForm.remark = row.remark || ''
  handleVisible.value = true
}

async function submitHandle() {
  if (!handleForm.repairAction.trim()) {
    ElMessage.warning('请填写处理措施')
    return
  }
  await updateRepair(currentRepairId.value, {
    handlerId: userStore.user.id,
    ...handleForm,
  })
  ElMessage.success('处理已提交')
  handleVisible.value = false
  loadData()
}

function goTooth(row) {
  router.push(`/teeth/${row.toothId}`)
}

onMounted(loadData)
</script>
