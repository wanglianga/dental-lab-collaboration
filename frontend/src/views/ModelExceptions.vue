<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">模型异常管理</div>
      <div class="header-actions">
        <el-select v-model="statusFilter" placeholder="按状态筛选" style="width: 160px;" clearable @change="loadData">
          <el-option label="已上报" value="reported" />
          <el-option label="通知患者中" value="notifying_patient" />
          <el-option label="医生确认中" value="doctor_confirming" />
          <el-option label="记录损耗中" value="recording_loss" />
          <el-option label="重新排期中" value="rescheduling" />
          <el-option label="已解决" value="resolved" />
          <el-option label="已关闭" value="closed" />
        </el-select>
        <el-button type="primary" @click="openCreate">上报异常</el-button>
      </div>
    </div>

    <el-table :data="exceptions" border v-loading="loading">
      <el-table-column label="异常类型" width="140">
        <template #default="{ row }">
          <el-tag :type="exceptionTypeTag(row.exceptionType)" size="small">{{ exceptionTypeText(row.exceptionType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="关联订单" width="150">
        <template #default="{ row }">{{ row.order?.orderNo || '-' }}</template>
      </el-table-column>
      <el-table-column label="关联牙位" width="80">
        <template #default="{ row }">
          <el-tag v-if="row.tooth" type="danger" size="small">#{{ row.tooth.toothNumber }}</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="患者" width="100">
        <template #default="{ row }">{{ row.order?.patient?.name || '-' }}</template>
      </el-table-column>
      <el-table-column label="上报人" width="100">
        <template #default="{ row }">{{ row.reporter?.name }}</template>
      </el-table-column>
      <el-table-column prop="description" label="问题描述" show-overflow-tooltip min-width="180" />
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <span class="status-tag" :class="'status-' + row.status">{{ statusText(row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="原交付日期" width="140">
        <template #default="{ row }">{{ formatDate(row.originalDeliveryDate) }}</template>
      </el-table-column>
      <el-table-column label="新交付日期" width="140">
        <template #default="{ row }">
          <span :class="{ 'text-red': row.newDeliveryDate && row.originalDeliveryDate && new Date(row.newDeliveryDate) > new Date(row.originalDeliveryDate) }">
            {{ formatDate(row.newDeliveryDate) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="上报时间" width="170">
        <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="viewDetail(row)">详情</el-button>
          <el-button v-if="canNotifyPatient(row)" type="success" link size="small" @click="openNotifyPatient(row)">通知患者</el-button>
          <el-button v-if="canDoctorConfirm(row)" type="warning" link size="small" @click="openDoctorConfirm(row)">医生确认</el-button>
          <el-button v-if="canRecordLoss(row)" type="warning" link size="small" @click="openRecordLoss(row)">记录损耗</el-button>
          <el-button v-if="canReschedule(row)" type="primary" link size="small" @click="openReschedule(row)">重新排期</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="createVisible" title="上报模型异常" width="600px">
      <el-form :model="createForm" label-width="110px">
        <el-form-item label="异常类型" required>
          <el-select v-model="createForm.exceptionType" style="width: 100%;">
            <el-option label="口扫文件损坏" value="scan_file_corrupted" />
            <el-option label="石膏模型破损" value="plaster_model_damaged" />
            <el-option label="比色照片缺失" value="shade_photo_missing" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联订单">
          <el-input v-model="createForm.orderId" placeholder="订单ID（可选）" />
        </el-form-item>
        <el-form-item label="关联牙位">
          <el-input v-model="createForm.toothId" placeholder="牙齿ID（可选）" />
        </el-form-item>
        <el-form-item label="问题描述" required>
          <el-input v-model="createForm.description" type="textarea" :rows="3" placeholder="请详细描述异常情况..." />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="createForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCreate">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="notifyVisible" title="通知患者" width="500px">
      <el-form :model="notifyForm" label-width="110px">
        <el-form-item label="处理方式" required>
          <el-select v-model="notifyForm.patientAction" style="width: 100%;">
            <el-option label="补拍照片" value="retake_photo" />
            <el-option label="重新取模" value="reimpression" />
            <el-option label="重新预约" value="reschedule" />
          </el-select>
        </el-form-item>
        <el-form-item label="通知内容" required>
          <el-input v-model="notifyForm.patientNotification" type="textarea" :rows="3" placeholder="请填写通知患者的内容..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="notifyVisible = false">取消</el-button>
        <el-button type="primary" @click="submitNotifyPatient">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="doctorConfirmVisible" title="医生确认" width="550px">
      <el-form :model="doctorForm" label-width="110px">
        <el-form-item label="是否影响原方案" required>
          <el-radio-group v-model="doctorForm.affectsOriginalPlan">
            <el-radio :label="false">不影响</el-radio>
            <el-radio :label="true">有影响</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理决定" required>
          <el-radio-group v-model="doctorForm.doctorDecision">
            <el-radio label="no_change">维持原方案</el-radio>
            <el-radio label="adjust_plan">调整方案</el-radio>
            <el-radio label="cancel_tooth">取消该牙位</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="医生备注">
          <el-input v-model="doctorForm.doctorRemark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="doctorConfirmVisible = false">取消</el-button>
        <el-button type="primary" @click="submitDoctorConfirm">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="lossVisible" title="记录工序与材料损耗" width="550px">
      <el-form :model="lossForm" label-width="110px">
        <el-form-item label="已完成工序">
          <el-input v-model="lossForm.completedStages" type="textarea" :rows="2" placeholder="例如：模型设计、蜡型制作..." />
        </el-form-item>
        <el-form-item label="材料损耗">
          <el-input v-model="lossForm.materialLoss" type="textarea" :rows="3" placeholder="请记录已投入的材料损耗情况..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="lossVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRecordLoss">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="rescheduleVisible" title="重新计算交付日期" width="550px">
      <el-form :model="rescheduleForm" label-width="110px">
        <el-form-item label="原交付日期">
          <el-date-picker v-model="rescheduleForm.originalDeliveryDate" type="date" style="width: 100%;" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="新交付日期" required>
          <el-date-picker v-model="rescheduleForm.newDeliveryDate" type="date" style="width: 100%;" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="rescheduleForm.deliveryDateNote" type="textarea" :rows="2" placeholder="交付日期调整说明..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rescheduleVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReschedule">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="异常详情" width="700px">
      <el-descriptions v-if="currentDetail" :column="2" border size="small">
        <el-descriptions-item label="异常类型">{{ exceptionTypeText(currentDetail.exceptionType) }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ statusText(currentDetail.status) }}</el-descriptions-item>
        <el-descriptions-item label="订单号">{{ currentDetail.order?.orderNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="牙位号">{{ currentDetail.tooth ? '#' + currentDetail.tooth.toothNumber : '-' }}</el-descriptions-item>
        <el-descriptions-item label="患者">{{ currentDetail.order?.patient?.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="上报人">{{ currentDetail.reporter?.name }}</el-descriptions-item>
        <el-descriptions-item label="前台通知人">{{ currentDetail.receptionist?.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="确认医生">{{ currentDetail.doctor?.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="记录技师">{{ currentDetail.technician?.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="上报时间">{{ formatDate(currentDetail.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="问题描述" :span="2">{{ currentDetail.description }}</el-descriptions-item>
        <el-descriptions-item label="患者处理方式">{{ patientActionText(currentDetail.patientAction) }}</el-descriptions-item>
        <el-descriptions-item label="是否影响方案">{{ currentDetail.affectsOriginalPlan === true ? '是' : (currentDetail.affectsOriginalPlan === false ? '否' : '-') }}</el-descriptions-item>
        <el-descriptions-item label="患者通知内容" :span="2">{{ currentDetail.patientNotification || '-' }}</el-descriptions-item>
        <el-descriptions-item label="医生决定">{{ doctorDecisionText(currentDetail.doctorDecision) }}</el-descriptions-item>
        <el-descriptions-item label="医生备注">{{ currentDetail.doctorRemark || '-' }}</el-descriptions-item>
        <el-descriptions-item label="已完成工序" :span="2">{{ currentDetail.completedStages || '-' }}</el-descriptions-item>
        <el-descriptions-item label="材料损耗" :span="2">{{ currentDetail.materialLoss || '-' }}</el-descriptions-item>
        <el-descriptions-item label="原交付日期">{{ formatDate(currentDetail.originalDeliveryDate) }}</el-descriptions-item>
        <el-descriptions-item label="新交付日期">{{ formatDate(currentDetail.newDeliveryDate) }}</el-descriptions-item>
        <el-descriptions-item label="交付说明" :span="2">{{ currentDetail.deliveryDateNote || '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="primary" @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import {
  getModelExceptions,
  createModelException,
  notifyPatientForException,
  doctorConfirmException,
  recordExceptionLoss,
  rescheduleException,
} from '@/api/model-exception'

const userStore = useUserStore()
const loading = ref(false)
const statusFilter = ref('')
const exceptions = ref([])

const createVisible = ref(false)
const createForm = reactive({ exceptionType: '', orderId: '', toothId: '', description: '', remark: '' })

const notifyVisible = ref(false)
const currentExceptionId = ref(null)
const notifyForm = reactive({ patientAction: '', patientNotification: '' })

const doctorConfirmVisible = ref(false)
const doctorForm = reactive({ affectsOriginalPlan: false, doctorDecision: 'no_change', doctorRemark: '' })

const lossVisible = ref(false)
const lossForm = reactive({ completedStages: '', materialLoss: '' })

const rescheduleVisible = ref(false)
const rescheduleForm = reactive({ originalDeliveryDate: '', newDeliveryDate: '', deliveryDateNote: '' })

const detailVisible = ref(false)
const currentDetail = ref(null)

const statusMap = {
  reported: '已上报', notifying_patient: '通知患者中', doctor_confirming: '医生确认中',
  recording_loss: '记录损耗中', rescheduling: '重新排期中', resolved: '已解决', closed: '已关闭',
}
const exceptionTypeMap = {
  scan_file_corrupted: '口扫文件损坏', plaster_model_damaged: '石膏模型破损',
  shade_photo_missing: '比色照片缺失', other: '其他',
}
const patientActionMap = {
  retake_photo: '补拍照片', reimpression: '重新取模', reschedule: '重新预约',
}
const doctorDecisionMap = {
  no_change: '维持原方案', adjust_plan: '调整方案', cancel_tooth: '取消该牙位',
}
function statusText(s) { return statusMap[s] || s }
function exceptionTypeText(t) { return exceptionTypeMap[t] || t }
function patientActionText(t) { return patientActionMap[t] || t || '-' }
function doctorDecisionText(t) { return doctorDecisionMap[t] || t || '-' }
function exceptionTypeTag(t) {
  const m = { scan_file_corrupted: 'danger', plaster_model_damaged: 'warning', shade_photo_missing: 'info', other: '' }
  return m[t] || ''
}
function formatDate(d) { return d ? new Date(d).toLocaleString('zh-CN') : '-' }

function canNotifyPatient(row) {
  return ['receptionist', 'doctor'].includes(userStore.user?.role) && row.status === 'reported'
}
function canDoctorConfirm(row) {
  return userStore.user?.role === 'doctor' && row.status === 'doctor_confirming'
}
function canRecordLoss(row) {
  return userStore.user?.role === 'technician' && row.status === 'recording_loss'
}
function canReschedule(row) {
  return ['technician', 'receptionist', 'doctor'].includes(userStore.user?.role) && row.status === 'rescheduling'
}

async function loadData() {
  loading.value = true
  try {
    exceptions.value = await getModelExceptions(statusFilter.value || undefined)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  Object.assign(createForm, { exceptionType: '', orderId: '', toothId: '', description: '', remark: '' })
  createVisible.value = true
}
async function submitCreate() {
  if (!createForm.exceptionType || !createForm.description.trim()) {
    ElMessage.warning('请填写异常类型和问题描述')
    return
  }
  const data = {
    reporterId: userStore.user.id,
    exceptionType: createForm.exceptionType,
    description: createForm.description,
    remark: createForm.remark || undefined,
  }
  if (createForm.orderId) data.orderId = +createForm.orderId
  if (createForm.toothId) data.toothId = +createForm.toothId
  await createModelException(data)
  ElMessage.success('异常已上报')
  createVisible.value = false
  loadData()
}

function openNotifyPatient(row) {
  currentExceptionId.value = row.id
  notifyForm.patientAction = row.patientAction || ''
  notifyForm.patientNotification = row.patientNotification || ''
  notifyVisible.value = true
}
async function submitNotifyPatient() {
  if (!notifyForm.patientAction || !notifyForm.patientNotification.trim()) {
    ElMessage.warning('请填写处理方式和通知内容')
    return
  }
  await notifyPatientForException(currentExceptionId.value, notifyForm)
  ElMessage.success('已通知患者，等待医生确认')
  notifyVisible.value = false
  loadData()
}

function openDoctorConfirm(row) {
  currentExceptionId.value = row.id
  doctorForm.affectsOriginalPlan = row.affectsOriginalPlan || false
  doctorForm.doctorDecision = row.doctorDecision || 'no_change'
  doctorForm.doctorRemark = row.doctorRemark || ''
  doctorConfirmVisible.value = true
}
async function submitDoctorConfirm() {
  if (!doctorForm.doctorDecision) {
    ElMessage.warning('请选择处理决定')
    return
  }
  await doctorConfirmException(currentExceptionId.value, doctorForm)
  ElMessage.success('确认已提交')
  doctorConfirmVisible.value = false
  loadData()
}

function openRecordLoss(row) {
  currentExceptionId.value = row.id
  lossForm.completedStages = row.completedStages || ''
  lossForm.materialLoss = row.materialLoss || ''
  lossVisible.value = true
}
async function submitRecordLoss() {
  await recordExceptionLoss(currentExceptionId.value, lossForm)
  ElMessage.success('损耗已记录')
  lossVisible.value = false
  loadData()
}

function openReschedule(row) {
  currentExceptionId.value = row.id
  rescheduleForm.originalDeliveryDate = row.originalDeliveryDate || ''
  rescheduleForm.newDeliveryDate = row.newDeliveryDate || ''
  rescheduleForm.deliveryDateNote = row.deliveryDateNote || ''
  rescheduleVisible.value = true
}
async function submitReschedule() {
  if (!rescheduleForm.newDeliveryDate) {
    ElMessage.warning('请选择新交付日期')
    return
  }
  await rescheduleException(currentExceptionId.value, rescheduleForm)
  ElMessage.success('交付日期已更新')
  rescheduleVisible.value = false
  loadData()
}

async function viewDetail(row) {
  const data = await getModelExceptions()
  currentDetail.value = data.find(e => e.id === row.id) || row
  detailVisible.value = true
}

onMounted(loadData)
</script>

<style scoped>
.text-red {
  color: #f56c6c;
  font-weight: 600;
}
</style>
