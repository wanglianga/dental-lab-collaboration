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
          <span>订单附件</span>
          <el-upload
            :show-file-list="false"
            :before-upload="(f) => handleOrderUpload(f)"
            accept="image/*,.stl,.obj,.ply,.zip"
          >
            <el-button type="primary" size="small">上传附件</el-button>
          </el-upload>
        </div>
      </template>
      <el-table :data="orderFiles" size="small" border v-if="orderFiles.length">
        <el-table-column label="文件名" prop="originalName" show-overflow-tooltip />
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            <el-tag size="small" :type="categoryTagType(row.category)">{{ categoryText(row.category) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="大小" width="100">
          <template #default="{ row }">{{ formatSize(row.size) }}</template>
        </el-table-column>
        <el-table-column label="上传时间" width="170">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="previewFile(row)">查看</el-button>
            <el-button type="danger" link size="small" @click="removeFile(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else description="暂无订单附件" :image-size="60" />
    </el-card>

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
        <el-table-column label="附件" width="80">
          <template #default="{ row }">
            <el-tag size="small" v-if="row.files?.length">{{ row.files.length }}</el-tag>
            <span v-else style="color:#c0c4cc;">0</span>
          </template>
        </el-table-column>
        <el-table-column label="返修次数" width="80">
          <template #default="{ row }">
            <el-tag type="danger" size="small" v-if="row.repairs?.length">{{ row.repairs.length }}</el-tag>
            <span v-else style="color: #909399;">0</span>
          </template>
        </el-table-column>
        <el-table-column prop="requirement" label="要求" show-overflow-tooltip />
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

    <el-dialog v-model="uploadDialogVisible" title="上传订单附件" width="450px">
      <el-form label-width="80px">
        <el-form-item label="文件分类">
          <el-select v-model="uploadCategory" style="width: 100%;">
            <el-option label="比色照片" value="color_photo" />
            <el-option label="口扫文件" value="scan_file" />
            <el-option label="设计文件" value="design_file" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmUpload">确认上传</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="previewVisible" title="文件预览" width="700px">
      <img v-if="previewData?.isImage" :src="previewData?.url" style="max-width: 100%; max-height: 500px;" />
      <div v-else style="text-align: center; padding: 40px;">
        <el-icon :size="64" color="#909399"><Document /></el-icon>
        <p style="margin-top: 12px; color: #606266;">{{ previewData?.name }}</p>
        <el-button type="primary" style="margin-top: 12px;" @click="downloadFile">下载文件</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { getOrder, submitTryFeedback } from '@/api/order'
import { uploadFile, getFiles, deleteFile } from '@/api/file'

const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)
const order = ref(null)
const feedback = ref('')
const orderFiles = ref([])

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
const categoryMap = {
  color_photo: '比色照片', scan_file: '口扫文件', design_file: '设计文件', other: '其他',
}
function statusText(s) { return statusMap[s] || s }
function toothStatusText(s) { return toothStatusMap[s] || s }
function stageText(s) { return stageMap[s] || s }
function categoryText(c) { return categoryMap[c] || c || '其他' }
function categoryTagType(c) {
  const m = { color_photo: 'warning', scan_file: 'primary', design_file: 'success', other: 'info' }
  return m[c] || 'info'
}
function formatDate(d) { return d ? new Date(d).toLocaleString('zh-CN') : '' }
function formatSize(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i]
}

async function loadData() {
  loading.value = true
  try {
    order.value = await getOrder(route.params.id)
    orderFiles.value = await getFiles(undefined, order.value.id)
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

const uploadDialogVisible = ref(false)
const uploadCategory = ref('other')
const pendingFile = ref(null)

function handleOrderUpload(file) {
  pendingFile.value = file
  uploadCategory.value = 'other'
  uploadDialogVisible.value = true
  return false
}

async function confirmUpload() {
  if (!pendingFile.value) return
  try {
    await uploadFile(pendingFile.value, uploadCategory.value, undefined, order.value.id)
    ElMessage.success('文件上传成功')
    uploadDialogVisible.value = false
    pendingFile.value = null
    orderFiles.value = await getFiles(undefined, order.value.id)
  } catch (e) {
    ElMessage.error('上传失败')
  }
}

const previewVisible = ref(false)
const previewData = ref(null)

function previewFile(row) {
  const isImage = row.mimeType?.startsWith('image/')
  previewData.value = {
    url: row.filePath,
    name: row.originalName,
    isImage,
  }
  previewVisible.value = true
}

function downloadFile() {
  if (previewData.value?.url) {
    window.open(previewData.value.url, '_blank')
  }
}

async function removeFile(row) {
  try {
    await ElMessageBox.confirm('确定要删除此文件吗？', '提示', { type: 'warning' })
    await deleteFile(row.id)
    ElMessage.success('已删除')
    orderFiles.value = await getFiles(undefined, order.value.id)
  } catch {}
}

onMounted(loadData)
</script>

<style scoped>
.card-header {
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
