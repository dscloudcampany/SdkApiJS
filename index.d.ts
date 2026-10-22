export interface UserPlan {
  name: string;
  memory: {
    limit: number;
    available: number;
    used: number;
  };
  duration: number;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  plan: UserPlan;
}

export interface ApplicationInfo {
  id: string;
  name: string;
  desc?: string | null;
  ram: number;
  lang?: string | null;
  domain?: string | null;
  custom?: string | null;
  cluster?: string | null;
}

export interface UserMeResponse {
  user: UserAccount;
  applications: ApplicationInfo[];
}

export interface ApplicationStatus {
  cpu: string;
  ram: string;
  status: "running" | "stopping" | "offline";
  running: boolean;
  storage: string;
  uptime: number;
  network: string;
}

export interface FileItem {
  type: "file" | "directory";
  name: string;
  size?: number;
  lastModified?: number | null;
}

export interface BackupItem {
  name: string;
  size: number;
  modified?: string | null;
  key?: string | null;
  created_at?: string | null;
  is_successful: boolean;
}

export interface DatabaseInfo {
  id: string;
  name: string;
  type: "mysql";
  ip: string;
  user: string;
  password?: string;
  created_at?: string | null;
}

export class DsCloudAPIError extends Error {
  code: string;
  status: number;
  response: any;
  constructor(message: string, code?: string, status?: number, response?: any);
  toJSON(): object;
}

export class Application {
  id: string;
  name: string | null;
  desc: string | null;
  ram: number;
  lang: string | null;
  domain: string | null;
  custom: string | null;
  cluster: string | null;
  raw: any;

  files: {
    list(dir?: string): Promise<FileItem[]>;
    read(filePath: string): Promise<Buffer>;
    write(filePath: string, content: string | Buffer): Promise<any>;
    rename(from: string, to: string): Promise<any>;
    delete(filePath: string): Promise<any>;
  };

  backups: {
    list(): Promise<BackupItem[]>;
    create(): Promise<{ url: string; key: string }>;
  };

  status(): Promise<ApplicationStatus>;
  logs(): Promise<string>;
  start(): Promise<any>;
  restart(): Promise<any>;
  stop(): Promise<any>;
  commit(filePathOrBuffer: string | Buffer, fileName?: string): Promise<any>;
  listBackups(): Promise<BackupItem[]>;
  createBackup(): Promise<{ url: string; key: string }>;
  listFiles(dir?: string): Promise<FileItem[]>;
  readFile(filePath: string): Promise<Buffer>;
  writeFile(filePath: string, content: string | Buffer): Promise<any>;
  renameFile(sourcePath: string, destPath: string): Promise<any>;
  deleteFile(filePath: string): Promise<any>;
  delete(): Promise<any>;

  getStatus(): Promise<ApplicationStatus>;
  getLogs(): Promise<string>;
  createFile(content: string | Buffer, path: string): Promise<any>;
}

export class AppsManager {
  list(): Promise<Application[]>;
  get(appId: string): Promise<Application>;
  status(appId?: string): Promise<ApplicationStatus | ApplicationStatus[]>;
  upload(filePathOrBuffer: string | Buffer, fileName?: string): Promise<Application>;
}

export class UsersManager {
  me(): Promise<UserMeResponse>;
}

export class DatabasesManager {
  list(): Promise<DatabaseInfo[]>;
  create(): Promise<DatabaseInfo>;
  rotatePassword(dbId: string): Promise<{ id: string; new_password: string }>;
  delete(dbId: string): Promise<{ id: string; deleted_at: string }>;
}

export interface ClientOptions {
  baseURL?: string;
  timeout?: number;
}

export class DsCloudAPI {
  users: UsersManager;
  apps: AppsManager;
  databases: DatabasesManager;

  constructor(apiKey: string, options?: ClientOptions);

  request(method: string, path: string, data?: any, extraConfig?: any): Promise<any>;

  getUser(): Promise<UserMeResponse>;
  getApplications(): Promise<Application[]>;
  getApplication(appId: string): Promise<Application>;
  uploadApplication(filePath: string): Promise<Application>;
}

export const DsCloudAPIKEY: typeof DsCloudAPI;

export default DsCloudAPI;
