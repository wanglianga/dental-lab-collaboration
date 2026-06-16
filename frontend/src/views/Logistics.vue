<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">物流管理</div>
      <div class="header-actions">
        <el-select v-model="typeFilter" placeholder="操作类型" style="width: 140px; margin-right: 12px;" clearable @change="loadData">
          <el-option label="发货" value="ship" />
          <el-option label="签收" value="deliver" />
          <el-option label="退回" value="return" />
        </el-select>
        <el-button type="primary" @click="openShipDialog">新建发货</el-button>
      </div>
    </div>

    <el-card style="margin-bottom: 16px;">
      <template #header><span class="card-header">待发货义齿列表</span></template>
      <el-table :data="readyToShip" border size="small">
        <el-table-column label="牙位号" width="80">
          <template #default="{ row }">#{{ row.toothNumber }}</template>
        </el-table-column>
        <el-table-column label="患者" width="100">
          <template #default="{ row }">{{ row.order?.patient?.name }}</template>
        </el-table-column>
        <el-table-column label="订单号" width="150">
          <template #default="{ row }">{{ row.order?.orderNo }}</template>
        </el-table-column>
        <el-table-column prop="material" label="材料" width="100" />
        <el-table-column prop="shade" label="比色" width="70" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="quickShip(row)">发货</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!readyToShip.length" description="暂无待发货义齿" />
    </el-card>

    <el-card>
      <template #header><span class="card-header">物流记录</span></template>
      <el-table :data="logisticsList" border v-loading="loading">
        <el-table-column label="时间" width="170">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.type === 'ship' ? 'primary' : (row.type === 'deliver' ? 'success' : 'warning')" size="small">
              {{ row.type === 'ship' ? '发货' : (row.type === 'deliver' ? '签收' : '退回') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="牙位" width="80">
          <template #default="{ row }">#{{ row.tooth?.toothNumber }}</template>
        </el-table-column>
        <el-table-column label="患者" width="100">
          <template #default="{ row }">{{ row.tooth?.order?.patient?.name }}</template>
        </el-table-column>
        <el-table-column label="操作人" width="100">
          <template #default="{ row }">{{ row.operator?.name }}</template>
        </el-table-column>
        <el-table-column prop="carrier" label="快递公司" width="110" />
        <el-table-column prop="trackingNo" label="运单号" width="160" />
        <el-table-column prop="receiver" label="收件人" width="100" />
        <el-table-column prop="receiverPhone" label="电话" width="120" />
        <el-table-column prop="address" label="地址" show-overflow-tooltip />
      </el-table>
    </el-card>

    <el-dialog v-model="shipVisible" title="发货" width="500px">
      <el-form :model="shipForm" label-width="90px">
        <el-form-item label="选择牙齿" required>
          <el-select v-model="shipForm.toothId" filterable placeholder="选择要发货的义齿" style="width: 100%;">
            <el-option
              v-for="t in readyToShip"
              :key="t.id"
              :label="`#${t.toothNumber} - ${t.order?.patient?.name} (${t.order?.orderNo})`"
              :value="t.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="操作类型">
          <el-radio-group v-model="shipForm.type">
            <el-radio label="ship">发货</el-radio>
            <el-radio label="deliver">签收</el-radio>
            <el-radio label="return">退回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="快递公司">
          <el-select v-model="shipForm.carrier" style="width: 100%;">
            <el-option label="顺丰速运" value="顺丰速运" />
            <el-option label="京东物流" value="京东物流" />
            <el-option label="德邦快递" value="德邦快递" />
          </el-select>
        </el-form-item>
        <el-form-item label="运单号">
          <el-input v-model="shipForm.trackingNo" />
        </el-form-item>
        <el-form-item label="收件人">
          <el-input v-model="shipForm.receiver" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="shipForm.receiverPhone" />
        </el-form-item>
        <el-form-item label="收件地址">
          <el-input v-model="shipForm.address" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="shipForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shipVisible = false">取消</el-button>
        <el-button type="primary" @click="submitShip">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { getTeeth } from '@/api/tooth'
import { getLogistics, createLogistics } from '@/api/logistics'

const userStore = useUserStore()
const loading = ref(false)
const typeFilter = ref('')
const logisticsList = ref([])
const readyToShip = ref([])

const shipVisible = ref(false)
const shipForm = reactive({
  toothId: null, type: 'ship', trackingNo: '', carrier: '顺丰速运',
  address: '', receiver: '', receiverPhone: '', remark: '',
})

function formatDate(d) { return d ? new Date(d).toLocaleString('zh-CN') : '' }

async function loadData() {
  loading.value = true
  try {
    logisticsList.value = await getLogistics(undefined, typeFilter.value || undefined)
    const teeth = await getTeeth()
    readyToShip.value = teeth.filter(t => t.status === 'inspection' || t.status === 'completed')
  } finally {
    loading.value = false
  }
}

function openShipDialog() {
  Object.assign(shipForm, {
    toothId: null, type: 'ship', trackingNo: '', carrier: '顺丰速运',
    address: '', receiver: '', receiverPhone: '', remark: '',
  })
  shipVisible.value = true
}

async function submitShip() {
  if (!shipForm.toothId) {
    ElMessage.warning('请选择要发货的义齿')
    return
  }
  await createLogistics({
    toothId: shipForm.toothId,
    operatorId: userStore.user.id,
    ...shipForm,
  })
  ElMessage.success('物流记录已提交')
  shipVisible.value = false
  loadData()
}

async function quickShip(row) {
  await createLogistics({
    toothId: row.id,
    operatorId: userStore.user.id,
    type: 'ship',
    carrier: '顺丰速运',
  })
  ElMessage.success('已记录发货')
  loadData()
}

onMounted(loadData)
</script>

<style scoped>
.card-header {
  font-weight: 600;
}
</style>
