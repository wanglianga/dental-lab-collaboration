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
        <el-button type="danger" plain size="small" @click="openTryRepairDialog" v-if="canCreateTryRepair">试戴返修</el-button>
        <el-button type="warning" plain size="small" @click="openModelExceptionDialog" v-if="canReportModelException">上报模型异常</el-button>
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

        <el-card style="margin-bottom: 20px;">
          <template #header><span class="card-header">快捷文件链接</span></template>
          <el-descriptions column="1" border size="small">
            <el-descriptions-item label="比色照片">
              <a v-if="tooth.colorPhotoUrl" :href="tooth.colorPhotoUrl" target="_blank">
                <el-tag type="warning" size="small" style="cursor:pointer;">查看比色照片</el-tag>
              </a>
              <span v-else style="color: #c0c4cc;">未上传</span>
            </el-descriptions-item>
            <el-descriptions-item label="口扫文件">
              <a v-if="tooth.scanFileUrl" :href="tooth.scanFileUrl" target="_blank">
                <el-tag type="primary" size="small" style="cursor:pointer;">查看口扫文件</el-tag>
              </a>
              <span v-else style="color: #c0c4cc;">未上传</span>
            </el-descriptions-item>
            <el-descriptions-item label="设计文件">
              <a v-if="tooth.designFileUrl" :href="tooth.designFileUrl" target="_blank">
                <el-tag type="success" size="small" style="cursor:pointer;">查看设计文件</el-tag>
              </a>
              <span v-else style="color: #c0c4cc;">未上传</span>
            </el-descriptions-item>
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
          <el-tab-pane label="附件管理" name="files">
            <div class="file-upload-bar">
              <el-upload
                :show-file-list="false"
                :before-upload="(f) => handleToothUpload(f)"
                accept="image/*,.stl,.obj,.ply,.zip"
              >
                <el-button type="primary" size="small">上传文件</el-button>
              </el-upload>
            </div>
            <el-table :data="toothFiles" size="small" border v-if="toothFiles.length">
              <el-table-column label="文件名" prop="originalName" show-overflow-tooltip />
              <el-table-column label="类型" width="110">
                <template #default="{ row }">
                  <el-tag size="small" :type="categoryTagType(row.category)">{{ categoryText(row.category) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="大小" width="90">
                <template #default="{ row }">{{ formatSize(row.size) }}</template>
              </el-table-column>
              <el-table-column label="上传时间" width="160">
                <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="{ row }">
                  <el-button type="primary" link size="small" @click="previewFile(row)">查看</el-button>
                  <el-button type="danger" link size="small" @click="removeFile(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-else description="暂无附件，可上传比色照片、口扫文件、设计文件" :image-size="60" />
          </el-tab-pane>

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
              <el-table-column label="类型" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.repairType === 'try_in' ? 'warning' : 'info'" size="small">
                    {{ row.repairType === 'try_in' ? '试戴返修' : '普通返修' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="问题" width="110">
                <template #default="{ row }">{{ issueText(row.issue) }}</template>
              </el-table-column>
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
              <el-table-column label="技师处理" width="90">
                <template #default="{ row }">{{ technicianActionText(row.technicianAction) }}</template>
              </el-table-column>
              <el-table-column prop="repairAction" label="处理措施" show-overflow-tooltip />
              <el-table-column label="影响收费" width="80">
                <template #default="{ row }">{{ row.affectsCharging ? '是' : '否' }}</template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <span class="status-tag" :class="'status-' + row.status">{{ repairStatusText(row.status) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="remark" label="备注" show-overflow-tooltip />
            </el-table>
            <el-empty v-if="!tooth.repairs?.length" description="暂无返修记录" />
          </el-tab-pane>

          <el-tab-pane label="模型异常" name="modelException">
            <el-table :data="tooth.modelExceptions || []" size="small" border>
              <el-table-column label="异常类型" width="130">
                <template #default="{ row }">
                  <el-tag :type="exceptionTypeTag(row.exceptionType)" size="small">{{ exceptionTypeText(row.exceptionType) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="上报时间" width="170">
                <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
              </el-table-column>
              <el-table-column label="上报人" width="100">
                <template #default="{ row }">{{ row.reporter?.name }}</template>
              </el-table-column>
              <el-table-column prop="description" label="问题描述" show-overflow-tooltip />
              <el-table-column label="状态" width="110">
                <template #default="{ row }">
                  <span class="status-tag" :class="'status-' + row.status">{{ exceptionStatusText(row.status) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="医生决定" width="110">
                <template #default="{ row }">{{ doctorDecisionText(row.doctorDecision) }}</template>
              </el-table-column>
              <el-table-column label="新交付日期" width="130">
                <template #default="{ row }">{{ formatDate(row.newDeliveryDate) }}</template>
              </el-table-column>
            </el-table>
            <el-empty v-if="!tooth.modelExceptions?.length" description="暂无模型异常记录" />
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

    <el-dialog v-model="tryRepairVisible" title="试戴返修申请" width="600px">
      <el-form :model="tryRepairForm" label-width="110px">
        <el-form-item label="问题类型" required>
          <el-checkbox-group v-model="tryRepairForm.issues">
            <el-checkbox label="margin_gap">边缘不密合</el-checkbox>
            <el-checkbox label="color_gray">颜色偏灰</el-checkbox>
            <el-checkbox label="occlusion_high">咬合过高</el-checkbox>
            <el-checkbox label="contact_tight">邻接过紧</el-checkbox>
            <el-checkbox label="other">其他</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="详细原因" required>
          <el-input v-model="tryRepairForm.reason" type="textarea" :rows="3" placeholder="请详细描述试戴发现的问题..." />
        </el-form-item>
        <el-form-item label="影响收费">
          <el-switch v-model="tryRepairForm.affectsCharging" />
        </el-form-item>
        <el-form-item label="患者复诊时间">
          <el-date-picker v-model="tryRepairForm.revisitDate" type="date" style="width: 100%;" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="tryRepairForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="tryRepairVisible = false">取消</el-button>
        <el-button type="primary" @click="submitTryRepair">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="modelExceptionVisible" title="上报模型异常" width="550px">
      <el-form :model="modelExceptionForm" label-width="110px">
        <el-form-item label="异常类型" required>
          <el-select v-model="modelExceptionForm.exceptionType" style="width: 100%;">
            <el-option label="口扫文件损坏" value="scan_file_corrupted" />
            <el-option label="石膏模型破损" value="plaster_model_damaged" />
            <el-option label="比色照片缺失" value="shade_photo_missing" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="问题描述" required>
          <el-input v-model="modelExceptionForm.description" type="textarea" :rows="3" placeholder="请详细描述异常情况..." />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="modelExceptionForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modelExceptionVisible = false">取消</el-button>
        <el-button type="primary" @click="submitModelException">提交</el-button>
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

    <el-dialog v-model="toothUploadVisible" title="上传牙齿附件" width="450px">
      <el-form label-width="80px">
        <el-form-item label="文件分类">
          <el-select v-model="toothUploadCategory" style="width: 100%;">
            <el-option label="比色照片" value="color_photo" />
            <el-option label="口扫文件" value="scan_file" />
            <el-option label="设计文件" value="design_file" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="toothUploadVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmToothUpload">确认上传</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="filePreviewVisible" title="文件预览" width="700px">
      <img v-if="filePreviewData?.isImage" :src="filePreviewData?.url" style="max-width: 100%; max-height: 500px;" />
      <div v-else style="text-align: center; padding: 40px;">
        <el-icon :size="64" color="#909399"><Document /></el-icon>
        <p style="margin-top: 12px; color: #606266;">{{ filePreviewData?.name }}</p>
        <el-button type="primary" style="margin-top: 12px;" @click="downloadFile">下载文件</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { getTooth, updateToothStatus, submitToothTryFeedback, uploadToothFile, getToothFiles } from '@/api/tooth'
import { createRepair } from '@/api/repair'
import { createInspection } from '@/api/inspection'
import { createLogistics } from '@/api/logistics'
import { deleteFile } from '@/api/file'
import { createModelException } from '@/api/model-exception'

const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)
const tooth = ref(null)
const activeTab = ref('files')
const toothFiles = ref([])

const canUpdateStatus = computed(() => ['technician', 'inspector', 'doctor', 'receptionist', 'logistics'].includes(userStore.user?.role))
const canCreateRepair = computed(() => ['doctor', 'inspector', 'technician', 'receptionist'].includes(userStore.user?.role))
const canCreateTryRepair = computed(() => ['doctor'].includes(userStore.user?.role))
const canReportModelException = computed(() => ['technician', 'inspector', 'doctor', 'receptionist'].includes(userStore.user?.role))
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
  pending: '待处理', processing: '处理中', technician_completed: '技师完成',
  inspecting: '质检中', completed: '已完成', returned: '已退回',
}
const exceptionStatusMap = {
  reported: '已上报', notifying_patient: '通知患者中', doctor_confirming: '医生确认中',
  recording_loss: '记录损耗中', rescheduling: '重新排期中', resolved: '已解决', closed: '已关闭',
}
const issueMap = {
  margin_gap: '边缘不密合', color_gray: '颜色偏灰',
  occlusion_high: '咬合过高', contact_tight: '邻接过紧', other: '其他',
}
const technicianActionMap = {
  recolor: '改色', remake: '重做', fine_tune: '微调', reimpression: '重新取模',
}
const exceptionTypeMap = {
  scan_file_corrupted: '口扫文件损坏', plaster_model_damaged: '石膏模型破损',
  shade_photo_missing: '比色照片缺失', other: '其他',
}
const doctorDecisionMap = {
  no_change: '维持原方案', adjust_plan: '调整方案', cancel_tooth: '取消该牙位',
}
const categoryMap = {
  color_photo: '比色照片', scan_file: '口扫文件', design_file: '设计文件', other: '其他',
}
function statusText(s) { return statusMap[s] || s }
function repairStatusText(s) { return repairStatusMap[s] || s }
function exceptionStatusText(s) { return exceptionStatusMap[s] || s }
function issueText(i) { return issueMap[i] || '-' }
function technicianActionText(a) { return technicianActionMap[a] || '-' }
function exceptionTypeText(t) { return exceptionTypeMap[t] || t }
function exceptionTypeTag(t) {
  const m = { scan_file_corrupted: 'danger', plaster_model_damaged: 'warning', shade_photo_missing: 'info', other: '' }
  return m[t] || ''
}
function doctorDecisionText(d) { return doctorDecisionMap[d] || '-' }
function stageText(s) { return stages.find(t => t.key === s)?.label || s }
function categoryText(c) { return categoryMap[c] || c || '其他' }
function categoryTagType(c) {
  const m = { color_photo: 'warning', scan_file: 'primary', design_file: 'success', other: 'info' }
  return m[c] || 'info'
}
function stageIndex(key) {
  const i = stages.findIndex(s => s.key === key)
  return i >= 0 ? i + 1 : 0
}
function timelineType(status) {
  const map = { completed: 'success', processing: 'primary', inspection: 'warning', rework: 'danger', pending: 'info' }
  return map[status] || 'primary'
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
    tooth.value = await getTooth(route.params.id)
    toothFiles.value = await getToothFiles(tooth.value.id)
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
    repairType: 'general',
    reason: repairForm.reason,
    remark: repairForm.remark,
  })
  ElMessage.success('返修申请已提交')
  repairVisible.value = false
  loadData()
}

const tryRepairVisible = ref(false)
const tryRepairForm = reactive({
  issues: [], reason: '', affectsCharging: false, revisitDate: '', remark: '',
})
function openTryRepairDialog() {
  tryRepairForm.issues = []
  tryRepairForm.reason = ''
  tryRepairForm.affectsCharging = false
  tryRepairForm.revisitDate = ''
  tryRepairForm.remark = ''
  tryRepairVisible.value = true
}
async function submitTryRepair() {
  if (!tryRepairForm.issues.length || !tryRepairForm.reason.trim()) {
    ElMessage.warning('请选择问题类型并填写详细原因')
    return
  }
  await createRepair({
    toothId: tooth.value.id,
    reporterId: userStore.user.id,
    repairType: 'try_in',
    issue: tryRepairForm.issues[0],
    reason: tryRepairForm.reason,
    affectsCharging: tryRepairForm.affectsCharging,
    revisitDate: tryRepairForm.revisitDate || undefined,
    remark: tryRepairForm.remark,
  })
  ElMessage.success('试戴返修申请已提交')
  tryRepairVisible.value = false
  loadData()
}

const modelExceptionVisible = ref(false)
const modelExceptionForm = reactive({ exceptionType: '', description: '', remark: '' })
function openModelExceptionDialog() {
  modelExceptionForm.exceptionType = ''
  modelExceptionForm.description = ''
  modelExceptionForm.remark = ''
  modelExceptionVisible.value = true
}
async function submitModelException() {
  if (!modelExceptionForm.exceptionType || !modelExceptionForm.description.trim()) {
    ElMessage.warning('请选择异常类型并填写问题描述')
    return
  }
  await createModelException({
    toothId: tooth.value.id,
    orderId: tooth.value.orderId,
    reporterId: userStore.user.id,
    exceptionType: modelExceptionForm.exceptionType,
    description: modelExceptionForm.description,
    remark: modelExceptionForm.remark || undefined,
  })
  ElMessage.success('模型异常已上报')
  modelExceptionVisible.value = false
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

const toothUploadVisible = ref(false)
const toothUploadCategory = ref('other')
const toothPendingFile = ref(null)

function handleToothUpload(file) {
  toothPendingFile.value = file
  toothUploadCategory.value = 'other'
  toothUploadVisible.value = true
  return false
}

async function confirmToothUpload() {
  if (!toothPendingFile.value) return
  try {
    await uploadToothFile(tooth.value.id, toothPendingFile.value, toothUploadCategory.value)
    ElMessage.success('文件上传成功')
    toothUploadVisible.value = false
    toothPendingFile.value = null
    loadData()
  } catch (e) {
    ElMessage.error('上传失败')
  }
}

const filePreviewVisible = ref(false)
const filePreviewData = ref(null)

function previewFile(row) {
  const isImage = row.mimeType?.startsWith('image/')
  filePreviewData.value = {
    url: row.filePath,
    name: row.originalName,
    isImage,
  }
  filePreviewVisible.value = true
}

function downloadFile() {
  if (filePreviewData.value?.url) {
    window.open(filePreviewData.value.url, '_blank')
  }
}

async function removeFile(row) {
  try {
    await ElMessageBox.confirm('确定要删除此文件吗？', '提示', { type: 'warning' })
    await deleteFile(row.id)
    ElMessage.success('已删除')
    loadData()
  } catch {}
}

onMounted(loadData)
</script>

<style scoped>
.card-header {
  font-weight: 600;
}
.file-upload-bar {
  margin-bottom: 12px;
  display: flex;
  justify-content: flex-end;
}
</style>
