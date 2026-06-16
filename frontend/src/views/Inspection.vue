<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">质检工作台</div>
    </div>

    <el-row :gutter="16" style="margin-bottom: 16px;">
      <el-col :span="8">
        <el-card>
          <div class="stat-title">待质检</div>
          <div class="stat-num warning">{{ pendingCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <div class="stat-title">今日通过</div>
          <div class="stat-num success">{{ passCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <div class="stat-title">今日返工</div>
          <div class="stat-num danger">{{ reworkCount }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-alert type="warning" :closable="false" style="margin-bottom: 16px;" title="质检项目：边缘密合度、颜色匹配、强度测试、咬合关系" show-icon />

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
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="goDetail(row)">详情</el-button>
          <el-button type="success" size="small" @click="quickPass(row)" v-if="row.status === 'inspection'">一键通过</el-button>
          <el-button type="warning" size="small" @click="openInspect(row)" v-if="row.status === 'inspection'">质检</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="inspectVisible" title="质检" width="550px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="边缘密合">
          <el-radio-group v-model="form.marginPass">
            <el-radio :label="true">合格</el-radio>
            <el-radio :label="false">不合格</el-radio>
          </el-radio-group>
          <el-input v-model="form.marginNote" placeholder="备注" size="small" style="margin-top: 6px;" />
        </el-form-item>
        <el-form-item label="颜色">
          <el-radio-group v-model="form.colorPass">
            <el-radio :label="true">合格</el-radio>
            <el-radio :label="false">不合格</el-radio>
          </el-radio-group>
          <el-input v-model="form.colorNote" placeholder="备注" size="small" style="margin-top: 6px;" />
        </el-form-item>
        <el-form-item label="强度">
          <el-radio-group v-model="form.strengthPass">
            <el-radio :label="true">合格</el-radio>
            <el-radio :label="false">不合格</el-radio>
          </el-radio-group>
          <el-input v-model="form.strengthNote" placeholder="备注" size="small" style="margin-top: 6px;" />
        </el-form-item>
        <el-form-item label="咬合">
          <el-radio-group v-model="form.occlusionPass">
            <el-radio :label="true">合格</el-radio>
            <el-radio :label="false">不合格</el-radio>
          </el-radio-group>
          <el-input v-model="form.occlusionNote" placeholder="备注" size="small" style="margin-top: 6px;" />
        </el-form-item>
        <el-form-item label="质检结果" required>
          <el-radio-group v-model="form.result">
            <el-radio label="pass">通过</el-radio>
            <el-radio label="rework">返工</el-radio>
            <el-radio label="fail">不合格</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="inspectVisible = false">取消</el-button>
        <el-button type="primary" @click="submitInspect">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { getTeeth } from '@/api/tooth'
import { createInspection } from '@/api/inspection'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const teethList = ref([])
const pendingCount = ref(0)
const passCount = ref(0)
const reworkCount = ref(0)

const inspectVisible = ref(false)
const currentToothId = ref(null)
const form = reactive({
  marginPass: true, colorPass: true, strengthPass: true, occlusionPass: true,
  result: 'pass', marginNote: '', colorNote: '', strengthNote: '', occlusionNote: '', remark: '',
})

async function loadData() {
  loading.value = true
  try {
    teethList.value = await getTeeth('inspection')
    pendingCount.value = teethList.value.length

    const all = await getTeeth()
    const today = new Date().toDateString()
    passCount.value = 0
    reworkCount.value = 0
  } finally {
    loading.value = false
  }
}

function openInspect(row) {
  currentToothId.value = row.id
  Object.assign(form, {
    marginPass: true, colorPass: true, strengthPass: true, occlusionPass: true,
    result: 'pass', marginNote: '', colorNote: '', strengthNote: '', occlusionNote: '', remark: '',
  })
  inspectVisible.value = true
}

async function submitInspect() {
  await createInspection({
    toothId: currentToothId.value,
    inspectorId: userStore.user.id,
    ...form,
  })
  ElMessage.success('质检提交成功')
  inspectVisible.value = false
  loadData()
}

async function quickPass(row) {
  await createInspection({
    toothId: row.id,
    inspectorId: userStore.user.id,
    marginPass: true, colorPass: true, strengthPass: true, occlusionPass: true,
    result: 'pass',
    remark: '质检通过',
  })
  ElMessage.success('已通过质检')
  loadData()
}

function goDetail(row) {
  router.push(`/teeth/${row.id}`)
}

onMounted(loadData)
</script>

<style scoped>
.stat-title {
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
}
.stat-num {
  font-size: 32px;
  font-weight: 600;
}
.stat-num.warning { color: #e6a23c; }
.stat-num.success { color: #67c23a; }
.stat-num.danger { color: #f56c6c; }
</style>
