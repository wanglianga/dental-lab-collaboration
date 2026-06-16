<template>
  <div class="page-container" v-loading="loading">
    <div class="page-header">
      <div>
        <el-button link @click="$router.back()">← 返回</el-button>
        <span class="page-title">牙齿详情 - {{ tooth?.toothNumber }}号牙</span>
      </div>
      <div class="header-actions" v-if="tooth">
        <el-button type="primary" plain size="small" @click="openStatusDialog" v-if="canUpdateStatus">更新工序状态</el-button>
        <el-button type="danger" plain size="small" @click="openRepairDialog" v-if="canCreateRepair">申请返修</el-button>
        <el-button type="primary" plain size="small" @click="openInspectionDialog" v-if="canInspect">质检</el-button>
        <el-button type="warning" plain size="small" @click="openLogisticsDialog" v-if="canLogistics">物流操作</el-button>
        <el-button type="success" plain size="small" @click="openFeedbackDialog" v-if="canSubmitFeedback">提交试戴反馈</el-button>
      </div>
    </div>

    <el-row v-if="tooth" :gutter="20">
      <el-col :span="10">
        <el-card style="margin-bottom: 20px;">
          <template #header><span class="card-header">基本信息</span></template>
          <el-descriptions column="1" border size="small">
            <el-descriptions-item label="牙位号">#{{ tooth.toothNumber }}</el-descriptions-item>
            <el-descriptions-item label="患者">{{ tooth.order?.patient?.name }}</el-descriptions-item>
            <el-descriptions-item label="订单号">{{ tooth.order?.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="修复类型">{{ tooth.restorationType }}</el-descriptions-item>
            <el-descriptions-item label="材料">{{ tooth.material }}</el-descriptions-item>
            <el-descriptions-item label="比色">{{ tooth.shade }}</el-descriptions-item>
            <el-descriptions-item label="当前工序">{{ stageText(tooth.currentStage) }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <span class="status-tag" :class="'status-' + tooth.status">{{ statusText(tooth.status) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="要求">{{ tooth.requirement || '-' }}</el-descriptions-item>
            <el-descriptions-item label="试戴反馈">{{ tooth.tryFeedback || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card>
          <template #header><span class="card-header">工序进度</span></template>
          <el-steps :active="stageIndex(tooth.currentStage)" direction="vertical" finish-status="success">
            <el-step v-for="s in stages" :key="s.key" :title="s.label" />
          </el-steps>
        </el-card>
      </el-col>

      <el-col :span="14">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="工序记录" name="process">
            <el-timeline v-if="tooth.processRecords?.length">
              <el-timeline-item
                v-for="p in tooth.processRecords"
                :key="p.id"
                :timestamp="formatDate(p.createdAt)"
                :type="timelineType(p.status)"
              >
                <el-card shadow="never" size="small">
                  <div><strong>{{ stageText(p.stage) }}</strong> - <span class="status-tag" :class="'status-' + p.status">{{ statusText(p.status) }}</span></div>
                  <div style="color: #606266; font-size: 12px; margin-top: 4px;">操作人：{{ p.operator?.name }}</div>
                  <div v-if="p.note" style="color: #909399; font-size: 12px; margin-top: 4px;">备注：{{ p.note }}</div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
            <el-empty v-else description="暂无工序记录" />
          </el-tab-pane>

          <el-tab-pane label="质检记录" name="inspection">
            <el-table :data="tooth.inspections || []" size="small" border>
              <el-table-column label="质检时间" width="170">
                <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
              </el-table-column>
              <el-table-column label="质检员" width="100">
                <template #default="{ row }">{{ row.inspector?.name }}</template>
              </el-table-column>
              <el-table-column label="边缘密合" width="90">
                <template #default="{ row }">
                  <el-tag :type="row.marginPass ? 'success' : 'danger'" size="small">{{ row.marginPass ? '合格' : '不合格' }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="颜色" width="90">
                <template #default="{ row }">
                  <el-tag :type="row.colorPass ? 'success' : 'danger'" size="small">{{ row.colorPass ? '合格' : '不合格' }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="强度" width="90">
                <template #default="{ row }">
                  <el-tag :type="row.strengthPass ? 'success' : 'danger'" size="small">{{ row.strengthPass ? '合格' : '不合格' }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="咬合" width="90">
                <template #default="{ row }">
                  <el-tag :type="row.occlusionPass ? 'success' : 'danger'" size="small">{{ row.occlusionPass ? '合格' : '不合格' }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="结果" width="90">
                <template #default="{ row }">
                  <el-tag :type="row.result === 'pass' ? 'success' : (row.result === 'rework' ? 'warning' : 'danger')" size="small">
                    {{ row.result === 'pass' ? '通过' : (row.result === 'rework' ? '返工' : '不合格') }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="备注" show-overflow-tooltip>
                <template #default="{ row }">{{ row.remark || '-' }}</template>
              </el-table-column>
            </el-table>
            <el-empty v-if="!tooth.inspections?.length" description="暂无质检记录" />
          </el-tab-pane>

          <el-tab-pane label="返修履历" name="repair">
            <el-table :data="tooth.repairs || []" size="small" border>
              <el-table-column label="申请时间" width="170">
                <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
              </el-table-column>
              <el-table-column label="申请人" width="100">
                <template #default="{ row }">{{ row.reporter?.name }}</template>
              </el-table-column>
              <el-table-column label="处理人" width="100">
                <template #default="{ row }">{{ row.handler?.name || '-' }}</template>
              </el-table-column>
              <el-table-column prop="reason" label="原因" show-overflow-tooltip />
              <el-table-column prop="repairAction" label="处理措施" show-overflow-tooltip />
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <span class="status-tag" :class="'status-' + row.status">{{ repairStatusText(row.status) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="remark" label="备注" show-overflow-tooltip />
            </el-table>
            <el-empty v-if="!tooth.repairs?.length" description="暂无返修记录" />
          </el-tab-pane>

          <el-tab-pane label="物流记录" name="logistics">
            <el-table :data="tooth.logistics || []" size="small" border>
              <el-table-column label="时间" width="170">
                <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
              </el-table-column>
              <el-table-column label="类型" width="90">
                <template #default="{ row }">
                  <el-tag :type="row.type === 'ship' ? 'primary' : (row.type === 'deliver' ? 'success' : 'warning')" size="small">
                    {{ row.type === 'ship' ? '发货' : (row.type === 'deliver' ? '签收' : '退回') }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作人" width="100">
                <template #default="{ row }">{{ row.operator?.name }}</template>
              </el-table-column>
              <el-table-column prop="carrier" label="快递" width="100" />
              <el-table-column prop="trackingNo" label="运单号" width="160" />
              <el-table-column prop="receiver" label="收件人" width="100" />
              <el-table-column prop="receiverPhone" label="电话" width="120" />
              <el-table-column prop="address" label="地址" show-overflow-tooltip />
            </el-table>
            <el-empty v-if="!tooth.logistics?.length" description="暂无物流记录" />
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>

    <el-dialog v-model="statusVisible" title="更新工序状态" width="450px">
      <el-form :model="statusForm" label-width="90px">
        <el-form-item label="工序">
          <el-select v-model="statusForm.stage" style="width: 100%;">
            <el-option v-for="s in stages" :key="s.key" :label="s.label" :value="s.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="statusForm.status" style="width: 100%;">
            <el-option label="待处理" value="pending" />
            <el-option label="加工中" value="processing" />
            <el-option label="质检中" value="inspection" />
            <el-option label="返修中" value="rework" />
            <el-option label="已发货" value="shipped" />
            <el-option label="已送达" value="delivered" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="statusForm.note" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusVisible = false">取消</el-button>
        <el-button type="primary" @click="submitStatus">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="repairVisible" title="申请返修" width="500px">
      <el-form :model="repairForm" label-width="90px">
        <el-form-item label="返修原因" required>
          <el-input v-model="repairForm.reason" type="textarea" :rows="3" placeholder="请详细说明返修原因..." />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="repairForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="repairVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRepair">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="inspectionVisible" title="质检" width="550px">
      <el-form :model="inspectionForm" label-width="90px">
        <el-form-item label="边缘密合">
          <el-radio-group v-model="inspectionForm.marginPass">
            <el-radio :label="true">合格</el-radio>
            <el-radio :label="false">不合格</el-radio>
          </el-radio-group>
          <el-input v-model="inspectionForm.marginNote" placeholder="备注" size="small" style="margin-top: 6px;" />
        </el-form-item>
        <el-form-item label="颜色">
          <el-radio-group v-model="inspectionForm.colorPass">
            <el-radio :label="true">合格</el-radio>
            <el-radio :label="false">不合格</el-radio>
          </el-radio-group>
          <el-input v-model="inspectionForm.colorNote" placeholder="备注" size="small" style="margin-top: 6px;" />
        </el-form-item>
        <el-form-item label="强度">
          <el-radio-group v-model="inspectionForm.strengthPass">
            <el-radio :label="true">合格</el-radio>
            <el-radio :label="false">不合格</el-radio>
          </el-radio-group>
          <el-input v-model="inspectionForm.strengthNote" placeholder="备注" size="small" style="margin-top: 6px;" />
        </el-form-item>
        <el-form-item label="咬合">
          <el-radio-group v-model="inspectionForm.occlusionPass">
            <el-radio :label="true">合格</el-radio>
            <el-radio :label="false">不合格</el-radio>
          </el-radio-group>
          <el-input v-model="inspectionForm.occlusionNote" placeholder="备注" size="small" style="margin-top: 6px;" />
        </el-form-item>
        <el-form-item label="质检结果" required>
          <el-radio-group v-model="inspectionForm.result">
            <el-radio label="pass">通过</el-radio>
            <el-radio label="rework">返工</el-radio>
            <el-radio label="fail">不合格</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="inspectionForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="inspectionVisible = false">取消</el-button>
        <el-button type="primary" @click="submitInspection">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="logisticsVisible" title="物流操作" width="500px">
      <el-form :model="logisticsForm" label-width="90px">
        <el-form-item label="操作类型" required>
          <el-radio-group v-model="logisticsForm.type">
            <el-radio label="ship">发货</el-radio>
            <el-radio label="deliver">签收</el-radio>
            <el-radio label="return">退回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="快递公司">
          <el-select v-model="logisticsForm.carrier" style="width: 100%;">
            <el-option label="顺丰速运" value="顺丰速运" />
            <el-option label="京东物流" value="京东物流" />
            <el-option label="德邦快递" value="德邦快递" />
            <el-option label="圆通速递" value="圆通速递" />
          </el-select>
        </el-form-item>
        <el-form-item label="运单号">
          <el-input v-model="logisticsForm.trackingNo" />
        </el-form-item>
        <el-form-item label="收件人">
          <el-input v-model="logisticsForm.receiver" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="logisticsForm.receiverPhone" />
        </el-form-item>
        <el-form-item label="收件地址">
          <el-input v-model="logisticsForm.address" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="logisticsForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="logisticsVisible = false">取消</el-button>
        <el-button type="primary" @click="submitLogistics">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="feedbackVisible" title="提交试戴反馈" width="450px">
      <el-form label-width="90px">
        <el-form-item label="反馈内容" required>
          <el-input v-model="feedbackForm" type="textarea" :rows="4" placeholder="请输入试戴反馈..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="feedbackVisible = false">取消</el-button>
        <el-button type="primary" @click="submitFeedback">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { getTooth, updateToothStatus, submitToothTryFeedback } from '@/api/tooth'
import { createRepair } from '@/api/repair'
import { createInspection } from '@/api/inspection'
import { createLogistics } from '@/api/logistics'

const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)
const tooth = ref(null)
const activeTab = ref('process')

const canUpdateStatus = computed(() => ['technician', 'inspector', 'doctor', 'receptionist', 'logistics'].includes(userStore.user?.role))
const canCreateRepair = computed(() => ['doctor', 'inspector', 'technician', 'receptionist'].includes(userStore.user?.role))
const canInspect = computed(() => ['inspector', 'technician'].includes(userStore.user?.role))
const canLogistics = computed(() => ['logistics', 'receptionist'].includes(userStore.user?.role))
const canSubmitFeedback = computed(() => ['doctor'].includes(userStore.user?.role))

const stages = [
  { key: 'model_design', label: '模型设计' },
  { key: 'wax_pattern', label: '蜡型制作' },
  { key: 'casting', label: '铸造' },
  { key: 'porcelain', label: '瓷层' },
  { key: 'glazing', label: '上釉' },
  { key: 'color_adjustment', label: '改色' },
  { key: 'quality_check', label: '质检' },
  { key: 'completed', label: '完成' },
]
const statusMap = {
  pending: '待处理', processing: '加工中', inspection: '质检中', rework: '返修中',
  shipped: '已发货', delivered: '已送达', completed: '已完成',
}
const repairStatusMap = {
  pending: '待处理', processing: '处理中', completed: '已完成', returned: '已退回',
}
function statusText(s) { return statusMap[s] || s }
function repairStatusText(s) { return repairStatusMap[s] || s }
function stageText(s) { return stages.find(t => t.key === s)?.label || s }
function stageIndex(key) {
  const i = stages.findIndex(s => s.key === key)
  return i >= 0 ? i + 1 : 0
}
function timelineType(status) {
  const map = { completed: 'success', processing: 'primary', inspection: 'warning', rework: 'danger', pending: 'info' }
  return map[status] || 'primary'
}
function formatDate(d) { return d ? new Date(d).toLocaleString('zh-CN') : '' }

async function loadData() {
  loading.value = true
  try {
    tooth.value = await getTooth(route.params.id)
  } finally {
    loading.value = false
  }
}

const statusVisible = ref(false)
const statusForm = reactive({ stage: '', status: '', note: '' })
function openStatusDialog() {
  statusForm.stage = tooth.value.currentStage
  statusForm.status = tooth.value.status
  statusForm.note = ''
  statusVisible.value = true
}
async function submitStatus() {
  await updateToothStatus(tooth.value.id, statusForm)
  ElMessage.success('状态更新成功')
  statusVisible.value = false
  loadData()
}

const repairVisible = ref(false)
const repairForm = reactive({ reason: '', remark: '' })
function openRepairDialog() {
  repairForm.reason = ''
  repairForm.remark = ''
  repairVisible.value = true
}
async function submitRepair() {
  if (!repairForm.reason.trim()) {
    ElMessage.warning('请填写返修原因')
    return
  }
  await createRepair({
    toothId: tooth.value.id,
    reporterId: userStore.user.id,
    reason: repairForm.reason,
    remark: repairForm.remark,
  })
  ElMessage.success('返修申请已提交')
  repairVisible.value = false
  loadData()
}

const inspectionVisible = ref(false)
const inspectionForm = reactive({
  marginPass: true, colorPass: true, strengthPass: true, occlusionPass: true,
  result: 'pass', marginNote: '', colorNote: '', strengthNote: '', occlusionNote: '', remark: '',
})
function openInspectionDialog() {
  Object.assign(inspectionForm, {
    marginPass: true, colorPass: true, strengthPass: true, occlusionPass: true,
    result: 'pass', marginNote: '', colorNote: '', strengthNote: '', occlusionNote: '', remark: '',
  })
  inspectionVisible.value = true
}
async function submitInspection() {
  await createInspection({
    toothId: tooth.value.id,
    inspectorId: userStore.user.id,
    ...inspectionForm,
  })
  ElMessage.success('质检提交成功')
  inspectionVisible.value = false
  loadData()
}

const logisticsVisible = ref(false)
const logisticsForm = reactive({
  type: 'ship', trackingNo: '', carrier: '', address: '', receiver: '', receiverPhone: '', remark: '',
})
function openLogisticsDialog() {
  Object.assign(logisticsForm, { type: 'ship', trackingNo: '', carrier: '', address: '', receiver: '', receiverPhone: '', remark: '' })
  logisticsVisible.value = true
}
async function submitLogistics() {
  await createLogistics({
    toothId: tooth.value.id,
    operatorId: userStore.user.id,
    ...logisticsForm,
  })
  ElMessage.success('物流记录已提交')
  logisticsVisible.value = false
  loadData()
}

const feedbackVisible = ref(false)
const feedbackForm = ref('')
function openFeedbackDialog() {
  feedbackForm.value = ''
  feedbackVisible.value = true
}
async function submitFeedback() {
  if (!feedbackForm.value.trim()) {
    ElMessage.warning('请输入反馈内容')
    return
  }
  await submitToothTryFeedback(tooth.value.id, feedbackForm.value)
  ElMessage.success('反馈提交成功')
  feedbackVisible.value = false
  loadData()
}

onMounted(loadData)
</script>

<style scoped>
.card-header {
  font-weight: 600;
}
</style>
