<template>
  <div class="page-container" v-loading="loading">
    <div class="page-header">
      <div>
        <el-button link @click="$router.back()">← 返回</el-button>
        <span class="page-title">订单详情 - {{ order?.orderNo }}</span>
      </div>
    </div>

    <el-descriptions v-if="order" border column="2" style="margin-bottom: 20px;">
      <el-descriptions-item label="订单号">{{ order.orderNo }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <span class="status-tag" :class="'status-' + order.status">{{ statusText(order.status) }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="患者">{{ order.patient?.name }}（{{ order.patient?.gender }}/{{ order.patient?.age }}岁）</el-descriptions-item>
      <el-descriptions-item label="医生">{{ order.doctor?.name }}</el-descriptions-item>
      <el-descriptions-item label="咬合关系">{{ order.occlusion || '-' }}</el-descriptions-item>
      <el-descriptions-item label="设计要求">{{ order.designRequirement || '-' }}</el-descriptions-item>
      <el-descriptions-item label="临床备注" :span="2">{{ order.clinicalNote || '-' }}</el-descriptions-item>
    </el-descriptions>

    <el-card style="margin-bottom: 20px;">
      <template #header>
        <div class="card-header">
          <span>牙齿列表（单颗独立工序追踪）</span>
        </div>
      </template>
      <el-table :data="order?.teeth || []" border>
        <el-table-column prop="toothNumber" label="牙位号" width="80" />
        <el-table-column prop="restorationType" label="修复类型" width="100" />
        <el-table-column prop="material" label="材料" width="120" />
        <el-table-column prop="shade" label="比色" width="80" />
        <el-table-column label="当前工序" width="140">
          <template #default="{ row }">{{ stageText(row.currentStage) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span class="status-tag" :class="'status-' + row.status">{{ toothStatusText(row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="返修次数" width="100">
          <template #default="{ row }">
            <el-tag type="danger" size="small" v-if="row.repairs?.length">{{ row.repairs.length }} 次</el-tag>
            <span v-else style="color: #909399;">0 次</span>
          </template>
        </el-table-column>
        <el-table-column prop="requirement" label="要求" show-overflow-tooltip />
        <el-table-column label="试戴反馈" show-overflow-tooltip>
          <template #default="{ row }">{{ row.tryFeedback || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="goToothDetail(row)">工序详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card v-if="canSubmitFeedback">
      <template #header><span>提交试戴反馈</span></template>
      <el-input v-model="feedback" type="textarea" :rows="3" placeholder="请输入试戴反馈..." />
      <el-button type="primary" style="margin-top: 10px;" @click="submitFeedback">提交反馈</el-button>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { getOrder, submitTryFeedback } from '@/api/order'

const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)
const order = ref(null)
const feedback = ref('')

const canSubmitFeedback = computed(() => ['doctor'].includes(userStore.user?.role))

const statusMap = {
  pending: '待处理', processing: '加工中', partial_completed: '部分完成', completed: '已完成', returned: '已退回',
}
const toothStatusMap = {
  pending: '待处理', processing: '加工中', inspection: '质检中', rework: '返修中', shipped: '已发货', delivered: '已送达', completed: '已完成',
}
const stageMap = {
  model_design: '模型设计', wax_pattern: '蜡型制作', casting: '铸造', porcelain: '瓷层', glazing: '上釉', color_adjustment: '改色', quality_check: '质检', completed: '完成',
}
function statusText(s) { return statusMap[s] || s }
function toothStatusText(s) { return toothStatusMap[s] || s }
function stageText(s) { return stageMap[s] || s }

async function loadData() {
  loading.value = true
  try {
    order.value = await getOrder(route.params.id)
  } finally {
    loading.value = false
  }
}

function goToothDetail(row) {
  window.open(`/#/teeth/${row.id}`, '_blank')
}

async function submitFeedback() {
  if (!feedback.value.trim()) {
    ElMessage.warning('请输入反馈内容')
    return
  }
  await submitTryFeedback(route.params.id, feedback.value)
  ElMessage.success('反馈提交成功')
  feedback.value = ''
  loadData()
}

onMounted(loadData)
</script>

<style scoped>
.card-header {
  font-weight: 600;
}
</style>
