// ── Automation Composable ── manages workflows, reminders, and system jobs
import { ref, computed } from 'vue'
import { api } from '~/utils/api'

// ── Types ──
export interface WorkflowNode {
  id: string
  type: 'trigger' | 'action' | 'condition'
  subtype: string
  config: Record<string, any>
  position: { x: number; y: number }
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
}

export interface Workflow {
  id: string
  name: string
  description: string
  status: 'draft' | 'active' | 'inactive'
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  created_at?: string
  updated_at?: string
}

export interface WorkflowSummary {
  id: string
  name: string
  description: string
  status: string
  node_count: number
  created_at?: string
  updated_at?: string
}

export interface Reminder {
  chat_id?: number
  cron: string
  cron_description?: string
  message: string
  once?: boolean
  reminder_id?: string
  key?: string
  source?: string
  workflow_id?: string
}

export interface SystemJob {
  task: string
  schedule_seconds: number
  schedule_human: string
  description: string
}

export interface RunResult {
  node: string
  subtype: string
  result: string
}

// ── Singleton state ──
const workflows = ref<WorkflowSummary[]>([])
const activeWorkflow = ref<Workflow | null>(null)
const reminders = ref<Reminder[]>([])
const systemJobs = ref<SystemJob[]>([])
const loading = ref(false)
const runningWorkflows = ref<Set<string>>(new Set())
const triggeringReminders = ref<Set<string>>(new Set())

export const useAutomation = () => {
  // ── Workflows ──
  const fetchWorkflows = async () => {
    loading.value = true
    try {
      const result = await api.get('/automation/workflows')
      workflows.value = result as WorkflowSummary[]
    } catch (err: any) {
      console.error('Failed to fetch workflows:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchWorkflowDetail = async (wfId: string) => {
    const result = await api.get(`/automation/workflows/${wfId}`)
    activeWorkflow.value = result as Workflow
    return activeWorkflow.value
  }

  const createWorkflow = async (wf: Partial<Workflow>) => {
    const result = await api.post('/automation/workflows', wf)
    await fetchWorkflows()
    return result
  }

  const updateWorkflow = async (wfId: string, wf: Partial<Workflow>) => {
    const result = await api.put(`/automation/workflows/${wfId}`, wf)
    await fetchWorkflows()
    // Refresh active if it's the one being edited
    if (activeWorkflow.value?.id === wfId) {
      activeWorkflow.value = result.workflow
    }
    return result
  }

  const deleteWorkflow = async (wfId: string) => {
    await api.delete(`/automation/workflows/${wfId}`)
    await fetchWorkflows()
    if (activeWorkflow.value?.id === wfId) {
      activeWorkflow.value = null
    }
  }

  const runWorkflow = async (wfId: string): Promise<{ results: RunResult[]; message: string }> => {
    runningWorkflows.value.add(wfId)
    try {
      const result = await api.post(`/automation/workflows/${wfId}/run`)
      return { results: result.results || [], message: result.message }
    } catch (err: any) {
      console.error('Failed to run workflow:', err)
      throw err
    } finally {
      runningWorkflows.value.delete(wfId)
    }
  }

  const isWorkflowRunning = (wfId: string) => runningWorkflows.value.has(wfId)

  // ── Reminders ──
  const fetchReminders = async () => {
    try {
      const result = await api.get('/automation/reminders')
      reminders.value = result as Reminder[]
    } catch (err: any) {
      console.error('Failed to fetch reminders:', err)
      throw err
    }
  }

  const createReminder = async (data: { message: string; cron: string; once?: boolean }) => {
    const result = await api.post('/automation/reminders', data)
    await fetchReminders()
    return result
  }

  const deleteReminder = async (reminderId: string) => {
    await api.delete(`/automation/reminders/${reminderId}`)
    await fetchReminders()
  }

  const triggerReminder = async (reminderId: string): Promise<string> => {
    triggeringReminders.value.add(reminderId)
    try {
      const result = await api.post(`/automation/reminders/${reminderId}/trigger`)
      return result.result || 'Pengingat dipanggil'
    } catch (err: any) {
      console.error('Failed to trigger reminder:', err)
      throw err
    } finally {
      triggeringReminders.value.delete(reminderId)
    }
  }

  const isReminderTriggering = (reminderId: string) => triggeringReminders.value.has(reminderId)

  const parseNaturalLanguage = async (message: string): Promise<{ cron: string; message: string; once: boolean; cron_description: string } | null> => {
    const result = await api.post('/automation/reminders/parse', { message })
    if (result.is_reminder) {
      return {
        cron: result.cron,
        message: result.message,
        once: result.once,
        cron_description: result.cron_description,
      }
    }
    return null
  }

  // ── System Jobs ──
  const fetchSystemJobs = async () => {
    try {
      const result = await api.get('/automation/system-jobs')
      systemJobs.value = result as SystemJob[]
    } catch (err: any) {
      console.error('Failed to fetch system jobs:', err)
      throw err
    }
  }

  // ── Computed ──
  const activeWorkflows = computed(() => workflows.value.filter(w => w.status === 'active'))
  const draftWorkflows = computed(() => workflows.value.filter(w => w.status === 'draft'))

  return {
    // State
    workflows,
    activeWorkflow,
    reminders,
    systemJobs,
    loading,
    // Computed
    activeWorkflows,
    draftWorkflows,
    // Workflows
    fetchWorkflows,
    fetchWorkflowDetail,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    runWorkflow,
    isWorkflowRunning,
    // Reminders
    fetchReminders,
    createReminder,
    deleteReminder,
    triggerReminder,
    isReminderTriggering,
    parseNaturalLanguage,
    // System
    fetchSystemJobs,
  }
}
