<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">返修管理</div>
      <div class="header-actions">
        <el-select v-model="statusFilter" placeholder="按状态筛选" style="width: 140px;" clearable @change="loadData">
          <el-option label="待处理" value="pending" />
          <el-option label="处理中" value="processing" />
          <el-option label="技师完成" value="technician_completed" />
          <el-option label="质检中" value="inspecting" />
          <el-option label="已完成" value="completed" />
          <el-option label="已退回" value="returned" />
        </el-select>
        <el-select v-model="typeFilter" placeholder="按类型筛选" style="width: 140px;" clearable @change="loadData">
          <el-option label="普通返修" value="general" />
          <el-option label="试戴返修" value="try_in" />
        </el-select>
      </div>
    </div>

    <el-table :data="repairs" border v-loading="loading">
      <el-table-column label="类型" width="100">
        <template #default="{ row }">
          <el-tag :type="row.repairType === 'try_in' ? 'warning' : 'info'" size="small">
            {{ row.repairType === 'try_in' ? '试戴返修' : '普通返修' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="问题类型" width="110">
        <template #default="{ row }">{{ issueText(row.issue) }}</template>
      </el-table-column>
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
      <el-table-column label="影响收费" width="90">
        <template #default="{ row }">
          <el-tag v-if="row.affectsCharging" type="danger" size="small">是</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="复诊时间" width="140">
        <template #default="{ row }">{{ formatDate(row.revisitDate) }}</template>
      </el-table-column>
      <el-table-column prop="reason" label="返修原因" show-overflow-tooltip min-width="150" />
      <el-table-column label="技师处理" width="100">
        <template #default="{ row }">{{ technicianActionText(row.technicianAction) }}</template>
      </el-table-column>
      <el-table-column prop="repairAction" label="处理措施" show-overflow-tooltip min-width="120" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <span class="status-tag" :class="'status-' + row.status">{{ statusText(row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="申请时间" width="170">
        <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="260" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="viewDetail(row)">详情</el-button>
          <el-button type="primary" link size="small" @click="goTooth(row)">查看牙齿</el-button>
          <el-button v-if="canTechnicianHandle(row)" type="warning" link size="small" @click="openTechnicianHandle(row)">技师处理</el-button>
          <el-button v-if="canInspectorReview(row)" type="success" link size="small" @click="openInspectorReview(row)">质检复核</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="technicianVisible" title="技师处理返修" width="550px">
      <el-form :model="technicianForm" label-width="110px">
        <el-form-item label="返修原因">
          <el-input v-model="technicianForm.reason" type="textarea" :rows="2" disabled />
        </el-form-item>
        <el-form-item label="处理方式" required>
          <el-select v-model="technicianForm.technicianAction" style="width: 100%;">
            <el-option label="改色" value="recolor" />
            <el-option label="重做" value="remake" />
            <el-option label="微调" value="fine_tune" />
            <el-option label="要求重新取模" value="reimpression" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理措施" required>
          <el-input v-model="technicianForm.repairAction" type="textarea" :rows="3" placeholder="请填写详细处理措施..." />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="technicianForm.status" style="width: 100%;">
            <el-option label="处理中" value="processing" />
            <el-option label="处理完成，待质检" value="technician_completed" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="technicianForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="technicianVisible = false">取消</el-button>
        <el-button type="primary" @click="submitTechnicianHandle">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="inspectorVisible" title="质检员复核" width="550px">
      <el-form :model="inspectorForm" label-width="110px">
        <el-form-item label="返修原因">
          <el-input v-model="inspectorForm.reason" type="textarea" :rows="2" disabled />
        </el-form-item>
        <el-form-item label="技师处理方式">
          <el-input :value="technicianActionText(inspectorForm.technicianAction)" disabled />
        </el-form-item>
        <el-form-item label="处理措施">
          <el-input v-model="inspectorForm.repairAction" type="textarea" :rows="2" disabled />
        </el-form-item>
        <el-form-item label="复核结果" required>
          <el-radio-group v-model="inspectorForm.inspectionPassed">
            <el-radio :label="true">复核通过，发回门诊</el-radio>
            <el-radio :label="false">复核不通过，退回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="复核备注">
          <el-input v-model="inspectorForm.inspectionRemark" type="textarea" :rows="3" placeholder="请填写复核意见..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="inspectorVisible = false">取消</el-button>
        <el-button type="primary" @click="submitInspectorReview">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="返修详情" width="700px">
      <el-descriptions v-if="currentDetail" :column="2" border size="small">
        <el-descriptions-item label="类型">{{ currentDetail.repairType === 'try_in' ? '试戴返修' : '普通返修' }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ statusText(currentDetail.status) }}</el-descriptions-item>
        <el-descriptions-item label="牙位号">#{{ currentDetail.tooth?.toothNumber }}</el-descriptions-item>
        <el-descriptions-item label="患者">{{ currentDetail.tooth?.order?.patient?.name }}</el-descriptions-item>
        <el-descriptions-item label="订单号">{{ currentDetail.tooth?.order?.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="问题类型">{{ issueText(currentDetail.issue) }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ currentDetail.reporter?.name }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ formatDate(currentDetail.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="返修原因" :span="2">{{ currentDetail.reason }}</el-descriptions-item>
        <el-descriptions-item label="影响收费">{{ currentDetail.affectsCharging ? '是' : '否' }}</el-descriptions-item>
        <el-descriptions-item label="复诊时间">{{ formatDate(currentDetail.revisitDate) }}</el-descriptions-item>
        <el-descriptions-item label="处理人">{{ currentDetail.handler?.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="处理方式">{{ technicianActionText(currentDetail.technicianAction) }}</el-descriptions-item>
        <el-descriptions-item label="处理措施" :span="2">{{ currentDetail.repairAction || '-' }}</el-descriptions-item>
        <el-descriptions-item label="质检员">{{ currentDetail.inspector?.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="复核结果">
          <span v-if="currentDetail.inspectionPassed === true">通过</span>
          <span v-else-if="currentDetail.inspectionPassed === false">不通过</span>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="复核备注" :span="2">{{ currentDetail.inspectionRemark || '-' }}</el-descriptions-item>
        <el-descriptions-item label="试戴照片" :span="2" v-if="currentDetail.tryPhotos?.length">
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <el-image
              v-for="f in currentDetail.tryPhotos"
              :key="f.id"
              :src="f.filePath"
              :preview-src-list="currentDetail.tryPhotos.map(p => p.filePath)"
              :initial-index="currentDetail.tryPhotos.indexOf(f)"
              fit="cover"
              style="width: 80px; height: 80px; border-radius: 4px;"
            />
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentDetail.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="primary" @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { getRepairs, technicianHandleRepair, inspectorReviewRepair } from '@/api/repair'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const statusFilter = ref('')
const typeFilter = ref('')
const repairs = ref([])

const technicianVisible = ref(false)
const inspectorVisible = ref(false)
const detailVisible = ref(false)
const currentRepairId = ref(null)
const currentDetail = ref(null)

const technicianForm = reactive({
  reason: '', technicianAction: '', repairAction: '', status: 'processing', remark: '',
})
const inspectorForm = reactive({
  reason: '', technicianAction: '', repairAction: '', inspectionPassed: true, inspectionRemark: '',
})

const statusMap = {
  pending: '待处理', processing: '处理中', technician_completed: '技师完成',
  inspecting: '质检中', completed: '已完成', returned: '已退回',
}
const issueMap = {
  margin_gap: '边缘不密合', color_gray: '颜色偏灰',
  occlusion_high: '咬合过高', contact_tight: '邻接过紧', other: '其他',
}
const technicianActionMap = {
  recolor: '改色', remake: '重做', fine_tune: '微调', reimpression: '重新取模',
}
function statusText(s) { return statusMap[s] || s }
function issueText(i) { return issueMap[i] || '-' }
function technicianActionText(a) { return technicianActionMap[a] || '-' }
function formatDate(d) { return d ? new Date(d).toLocaleString('zh-CN') : '-' }

async function loadData() {
  loading.value = true
  try {
    repairs.value = await getRepairs(statusFilter.value || undefined, undefined, typeFilter.value || undefined)
  } finally {
    loading.value = false
  }
}

function canTechnicianHandle(row) {
  return userStore.user?.role === 'technician' && ['pending', 'processing'].includes(row.status)
}
function canInspectorReview(row) {
  return userStore.user?.role === 'inspector' && ['technician_completed', 'inspecting'].includes(row.status)
}

function goTooth(row) {
  router.push(`/teeth/${row.toothId}`)
}

async function viewDetail(row) {
  const list = await getRepairs()
  currentDetail.value = list.find(r => r.id === row.id) || row
  detailVisible.value = true
}

function openTechnicianHandle(row) {
  currentRepairId.value = row.id
  technicianForm.reason = row.reason
  technicianForm.technicianAction = row.technicianAction || ''
  technicianForm.repairAction = row.repairAction || ''
  technicianForm.status = row.status === 'pending' ? 'processing' : (row.status === 'technician_completed' ? 'technician_completed' : row.status)
  technicianForm.remark = row.remark || ''
  technicianVisible.value = true
}
async function submitTechnicianHandle() {
  if (!technicianForm.technicianAction || !technicianForm.repairAction.trim()) {
    ElMessage.warning('请选择处理方式并填写处理措施')
    return
  }
  await technicianHandleRepair(currentRepairId.value, technicianForm)
  ElMessage.success('处理已提交')
  technicianVisible.value = false
  loadData()
}

function openInspectorReview(row) {
  currentRepairId.value = row.id
  inspectorForm.reason = row.reason
  inspectorForm.technicianAction = row.technicianAction || ''
  inspectorForm.repairAction = row.repairAction || ''
  inspectorForm.inspectionPassed = row.inspectionPassed !== false
  inspectorForm.inspectionRemark = row.inspectionRemark || ''
  inspectorVisible.value = true
}
async function submitInspectorReview() {
  await inspectorReviewRepair(currentRepairId.value, inspectorForm)
  ElMessage.success(inspectorForm.inspectionPassed ? '复核通过，已发回门诊' : '已退回')
  inspectorVisible.value = false
  loadData()
}

onMounted(loadData)
</script>
