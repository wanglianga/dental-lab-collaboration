<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">技师工作台</div>
      <div class="header-actions">
        <el-select v-model="stageFilter" placeholder="按工序筛选" style="width: 160px;" clearable @change="loadData">
          <el-option v-for="s in stages" :key="s.key" :label="s.label" :value="s.key" />
        </el-select>
      </div>
    </div>

    <el-row :gutter="16" style="margin-bottom: 16px;">
      <el-col :span="6" v-for="s in stageStats" :key="s.key">
        <el-card shadow="hover" class="stat-card" :class="'stage-' + s.key" @click="stageFilter = s.key; loadData()">
          <div class="stat-label">{{ s.label }}</div>
          <div class="stat-num">{{ s.count }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-table :data="teethList" border v-loading="loading">
      <el-table-column label="牙位号" width="90">
        <template #default="{ row }">
          <el-tag type="primary" size="small">#{{ row.toothNumber }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="患者" width="110">
        <template #default="{ row }">{{ row.order?.patient?.name }}</template>
      </el-table-column>
      <el-table-column label="订单号" width="150">
        <template #default="{ row }">{{ row.order?.orderNo }}</template>
      </el-table-column>
      <el-table-column prop="restorationType" label="修复类型" width="100" />
      <el-table-column prop="material" label="材料" width="100" />
      <el-table-column prop="shade" label="比色" width="80" />
      <el-table-column label="当前工序" width="110">
        <template #default="{ row }">{{ stageText(row.currentStage) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <span class="status-tag" :class="'status-' + row.status">{{ statusText(row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="要求" show-overflow-tooltip>
        <template #default="{ row }">{{ row.requirement || '-' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="260" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="goDetail(row)">查看详情</el-button>
          <el-dropdown @command="(cmd) => quickUpdate(row, cmd)" v-if="row.status !== 'completed' && row.status !== 'shipped'">
            <el-button type="success" size="small">
              推进工序<el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="s in stages" :key="s.key" :command="s.key">进入：{{ s.label }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { getTeeth, updateToothStatus } from '@/api/tooth'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const teethList = ref([])
const stageFilter = ref('')

const stages = [
  { key: 'model_design', label: '模型设计' },
  { key: 'wax_pattern', label: '蜡型制作' },
  { key: 'casting', label: '铸造' },
  { key: 'porcelain', label: '瓷层制作' },
  { key: 'glazing', label: '上釉' },
  { key: 'color_adjustment', label: '改色' },
  { key: 'quality_check', label: '送质检' },
  { key: 'completed', label: '完成' },
]

const statusMap = {
  pending: '待处理', processing: '加工中', inspection: '质检中', rework: '返修中',
  shipped: '已发货', delivered: '已送达', completed: '已完成',
}
function statusText(s) { return statusMap[s] || s }
function stageText(s) { return stages.find(t => t.key === s)?.label || s }

const stageStats = reactive(stages.map(s => ({ ...s, count: 0 })))

async function loadData() {
  loading.value = true
  try {
    const statuses = ['pending', 'processing', 'rework']
    let all = []
    for (const st of statuses) {
      const list = await getTeeth(st)
      all = all.concat(list)
    }
    if (stageFilter.value) {
      teethList.value = all.filter(t => t.currentStage === stageFilter.value)
    } else {
      teethList.value = all
    }
    stages.forEach((s, i) => {
      stageStats[i].count = all.filter(t => t.currentStage === s.key).length
    })
  } finally {
    loading.value = false
  }
}

async function quickUpdate(row, stage) {
  await updateToothStatus(row.id, {
    stage,
    status: stage === 'quality_check' ? 'inspection' : (stage === 'completed' ? 'completed' : 'processing'),
    note: `技师推进至：${stageText(stage)}`,
  })
  ElMessage.success('工序已更新')
  loadData()
}

function goDetail(row) {
  router.push(`/teeth/${row.id}`)
}

onMounted(loadData)
</script>

<style scoped>
.stat-card {
  cursor: pointer;
  text-align: center;
  padding: 8px 0;
  transition: all 0.3s;
}
.stat-card:hover {
  transform: translateY(-2px);
}
.stat-label {
  font-size: 13px;
  color: #606266;
  margin-bottom: 6px;
}
.stat-num {
  font-size: 28px;
  font-weight: 600;
  color: #409eff;
}
.stage-model_design .stat-num { color: #409eff; }
.stage-wax_pattern .stat-num { color: #e6a23c; }
.stage-casting .stat-num { color: #f56c6c; }
.stage-porcelain .stat-num { color: #67c23a; }
.stage-glazing .stat-num { color: #909399; }
.stage-color_adjustment .stat-num { color: #8e44ad; }
.stage-quality_check .stat-num { color: #16a085; }
.stage-completed .stat-num { color: #27ae60; }
</style>
