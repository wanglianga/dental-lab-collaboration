import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    meta: { requiresAuth: true },
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '工作台' },
      },
      {
        path: 'patients',
        name: 'Patients',
        component: () => import('@/views/Patients.vue'),
        meta: { title: '患者管理' },
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/Orders.vue'),
        meta: { title: '订单管理' },
      },
      {
        path: 'orders/:id',
        name: 'OrderDetail',
        component: () => import('@/views/OrderDetail.vue'),
        meta: { title: '订单详情' },
      },
      {
        path: 'teeth',
        name: 'Teeth',
        component: () => import('@/views/Teeth.vue'),
        meta: { title: '牙齿工序追踪' },
      },
      {
        path: 'teeth/:id',
        name: 'ToothDetail',
        component: () => import('@/views/ToothDetail.vue'),
        meta: { title: '牙齿详情' },
      },
      {
        path: 'technician',
        name: 'Technician',
        component: () => import('@/views/Technician.vue'),
        meta: { title: '技师工作台', roles: ['technician', 'inspector'] },
      },
      {
        path: 'inspection',
        name: 'Inspection',
        component: () => import('@/views/Inspection.vue'),
        meta: { title: '质检工作台', roles: ['inspector'] },
      },
      {
        path: 'logistics',
        name: 'Logistics',
        component: () => import('@/views/Logistics.vue'),
        meta: { title: '物流管理', roles: ['logistics', 'receptionist'] },
      },
      {
        path: 'repairs',
        name: 'Repairs',
        component: () => import('@/views/Repairs.vue'),
        meta: { title: '返修管理' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (to.meta.requiresAuth && !userStore.token) {
    next('/login')
  } else if (to.meta.roles && to.meta.roles.length > 0) {
    if (!to.meta.roles.includes(userStore.user?.role)) {
      next('/dashboard')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
