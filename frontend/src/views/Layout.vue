<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="aside">
      <div class="logo">
        <h3>义齿协同平台</h3>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#1f2d3d"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>工作台</span>
        </el-menu-item>
        <el-menu-item v-if="showMenu(['doctor', 'receptionist', 'technician'])" index="/patients">
          <el-icon><User /></el-icon>
          <span>患者管理</span>
        </el-menu-item>
        <el-menu-item index="/orders">
          <el-icon><Document /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/teeth">
          <el-icon><Grid /></el-icon>
          <span>牙齿工序追踪</span>
        </el-menu-item>
        <el-menu-item v-if="showMenu(['technician', 'inspector'])" index="/technician">
          <el-icon><Tools /></el-icon>
          <span>技师工作台</span>
        </el-menu-item>
        <el-menu-item v-if="showMenu(['inspector'])" index="/inspection">
          <el-icon><CircleCheck /></el-icon>
          <span>质检工作台</span>
        </el-menu-item>
        <el-menu-item v-if="showMenu(['logistics', 'receptionist'])" index="/logistics">
          <el-icon><Van /></el-icon>
          <span>物流管理</span>
        </el-menu-item>
        <el-menu-item index="/repairs">
          <el-icon><Refresh /></el-icon>
          <span>返修管理</span>
        </el-menu-item>
        <el-menu-item index="/model-exceptions">
          <el-icon><Warning /></el-icon>
          <span>模型异常管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="breadcrumb">
          <el-icon><Location /></el-icon>
          <span>{{ currentTitle }}</span>
        </div>
        <div class="user-info">
          <span class="username">{{ userStore.user?.name }}</span>
          <el-tag :type="roleTagType" size="small" class="role-tag">{{ roleText }}</el-tag>
          <el-button type="danger" size="small" link @click="handleLogout">退出</el-button>
        </div>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Odometer, User, Document, Grid, Tools, CircleCheck, Van, Refresh, Location, Warning
} from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)
const currentTitle = computed(() => route.meta.title || '')

const roleTextMap = {
  doctor: '医生',
  receptionist: '前台',
  technician: '技师',
  inspector: '质检员',
  logistics: '物流',
}
const roleTagTypeMap = {
  doctor: 'primary',
  receptionist: 'success',
  technician: 'warning',
  inspector: 'danger',
  logistics: 'info',
}
const roleText = computed(() => roleTextMap[userStore.user?.role] || userStore.user?.role)
const roleTagType = computed(() => roleTagTypeMap[userStore.user?.role] || '')

function showMenu(roles) {
  return roles.includes(userStore.user?.role)
}

function handleLogout() {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  }).catch(() => {})
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}
.aside {
  background: #1f2d3d;
  overflow: hidden;
}
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border-bottom: 1px solid #2c3e50;
}
.logo h3 {
  font-size: 16px;
  margin: 0;
}
.aside :deep(.el-menu) {
  border-right: none;
}
.header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}
.breadcrumb {
  display: flex;
  align-items: center;
  color: #606266;
  font-size: 14px;
  gap: 6px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.username {
  color: #303133;
  font-size: 14px;
}
.role-tag {
  margin-left: 0;
}
.main {
  background: #f0f2f5;
  padding: 0;
  overflow: auto;
}
</style>
