import { PrismaClient, Role, TaskPriority, TaskStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for Velozity Global Solutions...');

  // Clean existing records safely
  await prisma.notification.deleteMany({});
  await prisma.activityLog.deleteMany({});
  await prisma.taskStatusHistory.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('Password@123', 10);
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);

  // 1. Create Users
  // 1 Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@velozity.com',
      password: adminPasswordHash,
      name: 'Victoria Vance (Admin)',
      role: Role.ADMIN,
    },
  });

  // 2 Project Managers
  const pm1 = await prisma.user.create({
    data: {
      email: 'pm1@velozity.com',
      password: passwordHash,
      name: 'Sarah Connor (PM)',
      role: Role.PROJECT_MANAGER,
    },
  });

  const pm2 = await prisma.user.create({
    data: {
      email: 'pm2@velozity.com',
      password: passwordHash,
      name: 'Alex Murphy (PM)',
      role: Role.PROJECT_MANAGER,
    },
  });

  // 4 Developers
  const dev1 = await prisma.user.create({
    data: {
      email: 'dev1@velozity.com',
      password: passwordHash,
      name: 'Ravi Kumar',
      role: Role.DEVELOPER,
    },
  });

  const dev2 = await prisma.user.create({
    data: {
      email: 'dev2@velozity.com',
      password: passwordHash,
      name: 'Priya Sharma',
      role: Role.DEVELOPER,
    },
  });

  const dev3 = await prisma.user.create({
    data: {
      email: 'dev3@velozity.com',
      password: passwordHash,
      name: 'John Doe',
      role: Role.DEVELOPER,
    },
  });

  const dev4 = await prisma.user.create({
    data: {
      email: 'dev4@velozity.com',
      password: passwordHash,
      name: 'Elena Rostova',
      role: Role.DEVELOPER,
    },
  });

  console.log('✅ Users created: 1 Admin, 2 PMs, 4 Developers');

  // 2. Create Clients
  const client1 = await prisma.client.create({
    data: {
      name: 'Marcus Brody',
      email: 'marcus@acmecorp.com',
      company: 'Acme Corporation',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Claire Redfield',
      email: 'claire@nexusdyn.io',
      company: 'Nexus Dynamics',
    },
  });

  const client3 = await prisma.client.create({
    data: {
      name: 'Gordon Freeman',
      email: 'gordon@blackmesa.org',
      company: 'Black Mesa Research',
    },
  });

  console.log('✅ Clients created: 3 Clients');

  // 3. Create Projects
  const now = new Date();
  const pastDate1 = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
  const pastDate2 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
  const futureDate1 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // in 3 days
  const futureDate2 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // in 7 days
  const futureDate3 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // in 14 days

  // Project 1 managed by PM1
  const project1 = await prisma.project.create({
    data: {
      title: 'Fintech Mobile Banking App',
      description: 'Next-generation biometric authentication & real-time transaction tracking dashboard.',
      status: 'ACTIVE',
      clientId: client1.id,
      pmId: pm1.id,
    },
  });

  // Project 2 managed by PM1
  const project2 = await prisma.project.create({
    data: {
      title: 'AI Customer Intelligence Hub',
      description: 'Conversational agent integration, NLP analytics pipeline, and customer sentiment heatmaps.',
      status: 'ACTIVE',
      clientId: client2.id,
      pmId: pm1.id,
    },
  });

  // Project 3 managed by PM2
  const project3 = await prisma.project.create({
    data: {
      title: 'Healthcare EHR Telemedicine Portal',
      description: 'HIPAA-compliant video consultations, automated prescription dispatch, and lab report portal.',
      status: 'ACTIVE',
      clientId: client3.id,
      pmId: pm2.id,
    },
  });

  console.log('✅ Projects created: 3 Projects managed across PM1 and PM2');

  // 4. Create Tasks (5+ per project, including >= 2 overdue tasks)
  // Tasks for Project 1 (PM1)
  const task1_1 = await prisma.task.create({
    data: {
      title: 'Implement FaceID & Biometric Auth Gateway',
      description: 'Integrate WebAuthn and native biometric credentials with fallback PIN.',
      status: TaskStatus.DONE,
      priority: TaskPriority.CRITICAL,
      dueDate: pastDate1,
      isOverdue: false,
      projectId: project1.id,
      assignedToId: dev1.id,
    },
  });

  const task1_2 = await prisma.task.create({
    data: {
      title: 'Real-time WebSocket Ledger Sync',
      description: 'Broadcast instant balance updates and ledger diffs using Socket.io cluster.',
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.HIGH,
      dueDate: futureDate1,
      isOverdue: false,
      projectId: project1.id,
      assignedToId: dev1.id,
    },
  });

  const task1_3 = await prisma.task.create({
    data: {
      title: 'PCI-DSS Compliance Audit Patch',
      description: 'Encrypt credit card pan and audit token storage mechanisms.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.CRITICAL,
      dueDate: pastDate2, // Overdue!
      isOverdue: true,
      projectId: project1.id,
      assignedToId: dev2.id,
    },
  });

  const task1_4 = await prisma.task.create({
    data: {
      title: 'Export Monthly Statement to Signed PDF',
      description: 'Generate high-res cryptographic statements via Puppeteer workers.',
      status: TaskStatus.TO_DO,
      priority: TaskPriority.MEDIUM,
      dueDate: futureDate2,
      isOverdue: false,
      projectId: project1.id,
      assignedToId: dev2.id,
    },
  });

  const task1_5 = await prisma.task.create({
    data: {
      title: 'Push Notification Dispatcher via Firebase',
      description: 'Deliver rich multi-channel transaction push notifications.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.LOW,
      dueDate: futureDate3,
      isOverdue: false,
      projectId: project1.id,
      assignedToId: dev1.id,
    },
  });

  const task1_6 = await prisma.task.create({
    data: {
      title: 'Automated Fraud Detection Heuristics',
      description: 'Flag anomalous withdrawal velocity and foreign geolocations.',
      status: TaskStatus.TO_DO,
      priority: TaskPriority.HIGH,
      dueDate: futureDate2,
      isOverdue: false,
      projectId: project1.id,
      assignedToId: dev3.id,
    },
  });

  // Tasks for Project 2 (PM1)
  const task2_1 = await prisma.task.create({
    data: {
      title: 'Fine-tune Llama 3 on Domain Support Transcripts',
      description: 'Run LoRA quantization on historical customer chat datasets.',
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      dueDate: pastDate1,
      isOverdue: false,
      projectId: project2.id,
      assignedToId: dev3.id,
    },
  });

  const task2_2 = await prisma.task.create({
    data: {
      title: 'Build Streaming Vector Search RAG Pipeline',
      description: 'Index company documentation in pgvector and stream answers via SSE/Socket.',
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.CRITICAL,
      dueDate: futureDate1,
      isOverdue: false,
      projectId: project2.id,
      assignedToId: dev4.id,
    },
  });

  const task2_3 = await prisma.task.create({
    data: {
      title: 'Sentiment Analysis Dashboard Widgets',
      description: 'Interactive Chart.js visualizations for NPS and CSAT trends over time.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      dueDate: pastDate1, // Overdue!
      isOverdue: true,
      projectId: project2.id,
      assignedToId: dev3.id,
    },
  });

  const task2_4 = await prisma.task.create({
    data: {
      title: 'Integrate Zendesk & Freshdesk Webhooks',
      description: 'Ingest raw tickets in real-time to trigger instant automated responses.',
      status: TaskStatus.TO_DO,
      priority: TaskPriority.LOW,
      dueDate: futureDate2,
      isOverdue: false,
      projectId: project2.id,
      assignedToId: dev4.id,
    },
  });

  const task2_5 = await prisma.task.create({
    data: {
      title: 'Multi-lingual Translation Fallback Layer',
      description: 'Support seamless fallback translation for 14 enterprise languages.',
      status: TaskStatus.TO_DO,
      priority: TaskPriority.MEDIUM,
      dueDate: futureDate3,
      isOverdue: false,
      projectId: project2.id,
      assignedToId: dev4.id,
    },
  });

  // Tasks for Project 3 (PM2)
  const task3_1 = await prisma.task.create({
    data: {
      title: 'WebRTC Peer Connection for Doctor Consultation',
      description: 'Establish secure encrypted media streams with bandwidth negotiation.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.CRITICAL,
      dueDate: futureDate1,
      isOverdue: false,
      projectId: project3.id,
      assignedToId: dev1.id,
    },
  });

  const task3_2 = await prisma.task.create({
    data: {
      title: 'FHIR Medical Record Synchronization',
      description: 'Map patient data structures to HL7 FHIR v4 specification.',
      status: TaskStatus.TO_DO,
      priority: TaskPriority.HIGH,
      dueDate: futureDate2,
      isOverdue: false,
      projectId: project3.id,
      assignedToId: dev2.id,
    },
  });

  const task3_3 = await prisma.task.create({
    data: {
      title: 'Digital Prescription Signing & Verification',
      description: 'Allow doctors to cryptographically sign digital e-prescriptions with RSA keys.',
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.HIGH,
      dueDate: futureDate1,
      isOverdue: false,
      projectId: project3.id,
      assignedToId: dev3.id,
    },
  });

  const task3_4 = await prisma.task.create({
    data: {
      title: 'Automated Lab Test Results Ingestion',
      description: 'Parse incoming HL7 ORU_R01 messages and populate patient health charts.',
      status: TaskStatus.DONE,
      priority: TaskPriority.MEDIUM,
      dueDate: pastDate2,
      isOverdue: false,
      projectId: project3.id,
      assignedToId: dev2.id,
    },
  });

  const task3_5 = await prisma.task.create({
    data: {
      title: 'Two-Factor SMS Verification for Patient Login',
      description: 'Implement Twilio verify API with rate limiting and brute force protection.',
      status: TaskStatus.TO_DO,
      priority: TaskPriority.LOW,
      dueDate: pastDate1, // Overdue!
      isOverdue: true,
      projectId: project3.id,
      assignedToId: dev4.id,
    },
  });

  console.log('✅ Tasks created: 16 total tasks with 3 overdue tasks');

  // 5. Create Status History & Pre-existing Activity Logs
  const activityLogs = [
    {
      taskId: task1_2.id,
      projectId: project1.id,
      userId: dev1.id,
      action: 'STATUS_CHANGE',
      details: { oldStatus: 'IN_PROGRESS', newStatus: 'IN_REVIEW', taskNumber: task1_2.taskNumber, taskTitle: task1_2.title },
      message: `${dev1.name} moved Task #${task1_2.taskNumber} from In Progress → In Review`,
      createdAt: new Date(now.getTime() - 2 * 60 * 1000), // 2 mins ago
    },
    {
      taskId: task1_3.id,
      projectId: project1.id,
      userId: dev2.id,
      action: 'STATUS_CHANGE',
      details: { oldStatus: 'TO_DO', newStatus: 'IN_PROGRESS', taskNumber: task1_3.taskNumber, taskTitle: task1_3.title },
      message: `${dev2.name} moved Task #${task1_3.taskNumber} from To Do → In Progress`,
      createdAt: new Date(now.getTime() - 15 * 60 * 1000), // 15 mins ago
    },
    {
      taskId: task2_2.id,
      projectId: project2.id,
      userId: dev4.id,
      action: 'STATUS_CHANGE',
      details: { oldStatus: 'IN_PROGRESS', newStatus: 'IN_REVIEW', taskNumber: task2_2.taskNumber, taskTitle: task2_2.title },
      message: `${dev4.name} moved Task #${task2_2.taskNumber} from In Progress → In Review`,
      createdAt: new Date(now.getTime() - 45 * 60 * 1000), // 45 mins ago
    },
    {
      taskId: task1_1.id,
      projectId: project1.id,
      userId: dev1.id,
      action: 'STATUS_CHANGE',
      details: { oldStatus: 'IN_REVIEW', newStatus: 'DONE', taskNumber: task1_1.taskNumber, taskTitle: task1_1.title },
      message: `${dev1.name} moved Task #${task1_1.taskNumber} from In Review → Done`,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      taskId: task3_3.id,
      projectId: project3.id,
      userId: dev3.id,
      action: 'STATUS_CHANGE',
      details: { oldStatus: 'IN_PROGRESS', newStatus: 'IN_REVIEW', taskNumber: task3_3.taskNumber, taskTitle: task3_3.title },
      message: `${dev3.name} moved Task #${task3_3.taskNumber} from In Progress → In Review`,
      createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
    },
    {
      taskId: task1_3.id,
      projectId: project1.id,
      userId: admin.id,
      action: 'TASK_OVERDUE',
      details: { taskNumber: task1_3.taskNumber, taskTitle: task1_3.title },
      message: `System flagged Task #${task1_3.taskNumber} as Overdue`,
      createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
    },
    {
      taskId: task2_1.id,
      projectId: project2.id,
      userId: dev3.id,
      action: 'STATUS_CHANGE',
      details: { oldStatus: 'IN_REVIEW', newStatus: 'DONE', taskNumber: task2_1.taskNumber, taskTitle: task2_1.title },
      message: `${dev3.name} moved Task #${task2_1.taskNumber} from In Review → Done`,
      createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
    },
    {
      taskId: task3_4.id,
      projectId: project3.id,
      userId: dev2.id,
      action: 'STATUS_CHANGE',
      details: { oldStatus: 'IN_REVIEW', newStatus: 'DONE', taskNumber: task3_4.taskNumber, taskTitle: task3_4.title },
      message: `${dev2.name} moved Task #${task3_4.taskNumber} from In Review → Done`,
      createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000),
    },
    {
      taskId: task1_4.id,
      projectId: project1.id,
      userId: pm1.id,
      action: 'TASK_CREATED',
      details: { taskNumber: task1_4.taskNumber, taskTitle: task1_4.title, assignedTo: dev2.name },
      message: `${pm1.name} created Task #${task1_4.taskNumber} and assigned to ${dev2.name}`,
      createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
    },
    {
      taskId: task3_1.id,
      projectId: project3.id,
      userId: pm2.id,
      action: 'TASK_ASSIGNED',
      details: { taskNumber: task3_1.taskNumber, taskTitle: task3_1.title, assignedTo: dev1.name },
      message: `${pm2.name} assigned Task #${task3_1.taskNumber} to ${dev1.name}`,
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    },
  ];

  for (const log of activityLogs) {
    await prisma.activityLog.create({ data: log });
  }

  // Create some initial status history records
  await prisma.taskStatusHistory.create({
    data: {
      taskId: task1_2.id,
      changedById: dev1.id,
      oldStatus: TaskStatus.IN_PROGRESS,
      newStatus: TaskStatus.IN_REVIEW,
    },
  });

  await prisma.taskStatusHistory.create({
    data: {
      taskId: task2_2.id,
      changedById: dev4.id,
      oldStatus: TaskStatus.IN_PROGRESS,
      newStatus: TaskStatus.IN_REVIEW,
    },
  });

  // 6. Create Initial In-app Notifications
  await prisma.notification.create({
    data: {
      userId: dev1.id,
      title: 'New Task Assignment',
      message: `You have been assigned to Task #${task1_2.taskNumber}: "${task1_2.title}"`,
      type: 'TASK_ASSIGNED',
      read: false,
      taskId: task1_2.id,
      projectId: project1.id,
      createdAt: new Date(now.getTime() - 10 * 60 * 1000),
    },
  });

  await prisma.notification.create({
    data: {
      userId: pm1.id,
      title: 'Task Ready for Review',
      message: `${dev1.name} submitted Task #${task1_2.taskNumber} for review in "${project1.title}"`,
      type: 'TASK_IN_REVIEW',
      read: false,
      taskId: task1_2.id,
      projectId: project1.id,
      createdAt: new Date(now.getTime() - 2 * 60 * 1000),
    },
  });

  await prisma.notification.create({
    data: {
      userId: pm1.id,
      title: 'Task Ready for Review',
      message: `${dev4.name} submitted Task #${task2_2.taskNumber} for review in "${project2.title}"`,
      type: 'TASK_IN_REVIEW',
      read: false,
      taskId: task2_2.id,
      projectId: project2.id,
      createdAt: new Date(now.getTime() - 45 * 60 * 1000),
    },
  });

  await prisma.notification.create({
    data: {
      userId: dev2.id,
      title: 'Task Overdue Alert',
      message: `Task #${task1_3.taskNumber} "${task1_3.title}" is now past due date!`,
      type: 'TASK_OVERDUE',
      read: true,
      taskId: task1_3.id,
      projectId: project1.id,
      createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Activity logs & notifications seeded successfully');
  console.log('🚀 Seed data complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
