import { ProjectCategory, ProjectStatus, ProjectMemberRole } from '@/constants/projects';
import { User } from './user';

export interface Project {
  _id: string;
  id: string;
  name: string;
  code: string;
  description?: string;
  category: ProjectCategory;
  status: ProjectStatus;
  manager?: Partial<User> | null;
  managerId?: string | User | null;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  _id: string;
  id: string;
  project: string;
  user: User;
  projectRole: ProjectMemberRole;
  assignedBy?: Partial<User>;
  assignedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectListResponseData {
  projects: Project[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProjectMembersResponseData {
  members: ProjectMember[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateProjectPayload {
  name: string;
  code: string;
  description?: string;
  category?: ProjectCategory;
  managerId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface AddProjectMemberPayload {
  userId: string;
  projectRole?: ProjectMemberRole;
}
