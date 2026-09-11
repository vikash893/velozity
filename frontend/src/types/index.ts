export type Role = 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';

export type TaskStatus = 'TO_DO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  createdAt?: string;
}

export interface ProjectStats {
  total: number;
  toDo: number;
  inProgress: number;
  inReview: number;
  done: number;
  overdue: number;
}

export interface Project {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  clientId: string;
  client?: Client;
  pmId: string;
  pm?: User;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
  stats?: ProjectStats;
  _count?: {
    tasks: number;
  };
}

export interface TaskStatusHistory {
  id: string;
  taskId: string;
  changedById: string;
  oldStatus: TaskStatus;
  newStatus: TaskStatus;
  createdAt: string;
}

export interface Task {
  id: string;
  taskNumber: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  isOverdue: boolean;
  projectId: string;
  project?: {
    id: string;
    title: string;
    pmId?: string;
    pm?: { id: string; name: string };
    client?: { name: string; company: string };
  };
  assignedToId?: string | null;
  assignedTo?: User | null;
  createdAt: string;
  updatedAt: string;
  statusLogs?: TaskStatusHistory[];
  activities?: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  taskId?: string | null;
  task?: {
    id: string;
    taskNumber: number;
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
  } | null;
  projectId?: string | null;
  project?: {
    id: string;
    title: string;
  } | null;
  userId: string;
  user?: User;
  action: string;
  message: string;
  details?: any;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  taskId?: string | null;
  task?: {
    id: string;
    taskNumber: number;
    title: string;
    status: TaskStatus;
  } | null;
  projectId?: string | null;
  project?: {
    id: string;
    title: string;
  } | null;
  createdAt: string;
}

export interface TaskFilterParams {
  projectId?: string;
  status?: string;
  priority?: string;
  assignedToId?: string;
  isOverdue?: boolean | string;
  search?: string;
  dueDateStart?: string;
  dueDateEnd?: string;
  sortBy?: 'priority' | 'dueDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface AdminDashboardStats {
  totalProjects: number;
  totalUsers: number;
  totalClients: number;
  totalTasks: number;
  overdueTasksCount: number;
  activeUsersOnline: number;
  tasksByStatus: Record<TaskStatus, number>;
  tasksByPriority: Record<TaskPriority, number>;
}

export interface PMDashboardStats {
  totalProjects: number;
  totalTasks: number;
  overdueCount: number;
  tasksByPriority: Record<TaskPriority, number>;
  tasksByStatus: Record<TaskStatus, number>;
  projectsSummary: Project[];
  upcomingTasksDueThisWeek: Task[];
}

export interface DeveloperDashboardData {
  tasks: Task[];
  stats: {
    totalAssigned: number;
    TO_DO: number;
    IN_PROGRESS: number;
    IN_REVIEW: number;
    DONE: number;
    OVERDUE: number;
  };
}
