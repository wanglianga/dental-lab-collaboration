<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">牙齿工序追踪</div>
      <div class="header-actions">
        <el-select v-model="statusFilter" placeholder="按状态筛选" style="width: 160px; margin-right: 12px;" clearable @change="loadData">
          <el-option label="待处理" value="pending" />
          <el-option label="加工中" value="processing" />
          <el-option label="质检中" value="inspection" />
          <el-option label="返修中" value="rework" />
          <el-option label="已发货" value="shipped" />
          <el-option label="已送达" value="delivered" />
          <el-option label="已完成" value="completed" />
        </el-select>
      </div>
    </div>

    <el-alert
      type="info"
      :closable="false"
      style="margin-bottom: 16px;"
      title="提示：每颗义齿有独立的工序和返修履历，避免多颗义齿分批到货时漏试戴、漏收费或错发"
      show-icon
    />

    <el-table :data="teethList" border v-loading="loading">
      <el-table-column label="牙位号" width="90">
        <template #default="{ row }">
          <el-tag type="primary" size="small">#{{ row.toothNumber }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="患者" width="120">
        <template #default="{ row }">{{ row.order?.patient?.name }}</template>
      </el-table-column>
      <el-table-column label="订单号" width="160">
        <template #default="{ row }">{{ row.order?.orderNo }}</template>
      </el-table-column>
      <el-table-column prop="restorationType" label="修复类型" width="100" />
      <el-table-column prop="material" label="材料" width="110" />
      <el-table-column prop="shade" label="比色" width="80" />
      <el-table-column label="当前工序" width="140">
        <template #default="{ row }">
          <el-steps :active="stageIndex(row.currentStage)" size="small" finish-status="success" align-center>
            <el-step v-for="s in stages" :key="s.key" :title="s.label" />
          </el-steps>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <span class="status-tag" :class="'status-' + row.status">{{ statusText(row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="返修" width="80">
        <template #default="{ row }">
          <el-tag type="danger" size="small" v-if="row.repairs?.length">{{ row.repairs.length }}</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="170">
        <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="goDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getTeeth } from '@/api/tooth'

const router = useRouter()
const loading = ref(false)
const teethList = ref([])
const statusFilter = ref('')

const stages = [
  { key: 'model_design', label: '模型设计' },
  { key: 'wax_pattern', label: '蜡型' },
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
function statusText(s) { return statusMap[s] || s }
function stageIndex(key) {
  const i = stages.findIndex(s => s.key === key)
  return i >= 0 ? i + 1 : 0
}
function formatDate(d) { return d ? new Date(d).toLocaleString('zh-CN') : '' }

async function loadData() {
  loading.value = true
  try {
    teethList.value = await getTeeth(statusFilter.value || undefined)
  } finally {
    loading.value = false
  }
}

function goDetail(row) {
  router.push(`/teeth/${row.id}`)
}

onMounted(loadData)
</script>
