<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">工作台</div>
    </div>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">待处理订单</div>
          <div class="stat-value primary">{{ stats.pendingOrders }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">加工中牙齿</div>
          <div class="stat-value warning">{{ stats.processingTeeth }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">待质检</div>
          <div class="stat-value danger">{{ stats.pendingInspection }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">返修中</div>
          <div class="stat-value info">{{ stats.repairs }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">最近订单</div>
          </template>
          <el-table :data="recentOrders" size="small">
            <el-table-column prop="orderNo" label="订单号" width="150" />
            <el-table-column label="患者">
              <template #default="{ row }">{{ row.patient?.name }}</template>
            </el-table-column>
            <el-table-column label="牙齿数量">
              <template #default="{ row }">{{ row.teeth?.length || 0 }} 颗</template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <span class="status-tag" :class="'status-' + row.status">{{ statusText(row.status) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">最近返修</div>
          </template>
          <el-table :data="recentRepairs" size="small">
            <el-table-column label="牙位">
              <template #default="{ row }">{{ row.tooth ? row.tooth.toothNumber + '号牙' : '-' }}</template>
            </el-table-column>
            <el-table-column label="患者">
              <template #default="{ row }">{{ row.tooth?.order?.patient?.name }}</template>
            </el-table-column>
            <el-table-column prop="reason" label="原因" show-overflow-tooltip />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <span class="status-tag" :class="'status-' + row.status">{{ repairStatusText(row.status) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getOrders } from '@/api/order'
import { getTeeth } from '@/api/tooth'
import { getRepairs } from '@/api/repair'

const stats = reactive({
  pendingOrders: 0,
  processingTeeth: 0,
  pendingInspection: 0,
  repairs: 0,
})
const recentOrders = ref([])
const recentRepairs = ref([])

const statusMap = {
  pending: '待处理',
  processing: '加工中',
  partial_completed: '部分完成',
  completed: '已完成',
  returned: '已退回',
}
function statusText(s) { return statusMap[s] || s }

const repairStatusMap = {
  pending: '待处理',
  processing: '处理中',
  completed: '已完成',
  returned: '已退回',
}
function repairStatusText(s) { return repairStatusMap[s] || s }

async function loadData() {
  const orders = await getOrders()
  stats.pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length
  recentOrders.value = orders.slice(0, 5)

  const teeth = await getTeeth()
  stats.processingTeeth = teeth.filter(t => t.status === 'processing').length
  stats.pendingInspection = teeth.filter(t => t.status === 'inspection').length

  const repairs = await getRepairs()
  stats.repairs = repairs.filter(r => r.status === 'pending' || r.status === 'processing').length
  recentRepairs.value = repairs.slice(0, 5)
}

onMounted(loadData)
</script>

<style scoped>
.stat-card {
  text-align: center;
}
.stat-title {
  color: #909399;
  font-size: 14px;
  margin-bottom: 12px;
}
.stat-value {
  font-size: 32px;
  font-weight: 600;
}
.stat-value.primary { color: #409eff; }
.stat-value.warning { color: #e6a23c; }
.stat-value.danger { color: #f56c6c; }
.stat-value.info { color: #909399; }
.card-header {
  font-weight: 600;
  font-size: 15px;
}
</style>
