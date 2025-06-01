import { z } from 'zod';

declare enum ErrorCode {
    SUCCESS = "0",
    UNNAMED = "9999",
    VALIDATION_ERROR = "1001",
    AUTH_ERROR = "1002",
    FORBIDDEN = "1003",
    NOT_FOUND = "1004",
    SERVER_ERROR = "1005",
    USER_NOT_FOUND = "2001",
    USER_ALREADY_EXISTS = "2002",
    USER_PASSWORD_WRONG = "2003",
    CAPTCHAEXPIRED = "2004",
    CAPTCHAWRONG = "2005",
    USER_TOKEN_INVALID = "2006",
    USER_TOKEN_NOT_CARRY = "2007",
    SERVER_NOT_FOUND = "3001",
    SERVER_CONNECTION_ERROR = "3002",
    TOOL_GET_ERROR = "3003",
    TOOL_CALL_ERROR = "3004",
    FORMAT_ERROR = "4001"
}
declare const errorMessage: {
    "0": string;
    "1001": string;
    "1002": string;
    "1003": string;
    "1004": string;
    "1005": string;
    "2001": string;
    "2002": string;
    "2003": string;
    "2004": string;
    "2005": string;
    "2006": string;
    "2007": string;
    "3001": string;
    "3002": string;
    "3003": string;
    "3004": string;
    "4001": string;
};

/**
 * 创建招聘信息的 DTO
 */
interface CreateJobDto {
    readonly jobName: string;
    readonly companyName: string;
    readonly description: string;
    readonly location?: string;
    readonly salary?: string;
    readonly link?: string;
}
/**
 * 更新招聘信息的 DTO (CreateJobDto 的部分属性)
 */
type UpdateJobDto = Partial<CreateJobDto>;
/**
 * 招聘信息的 VO (View Object)
 * 用于API响应和前端展示
 */
interface JobVo {
    id?: string;
    jobName: string;
    companyName: string;
    description: string;
    location?: string;
    salary?: string;
    link?: string;
    createdAt: string;
    updatedAt: string;
}
/**
 * 分页后的招聘信息列表结果
 */
interface PaginatedJobsResult {
    data: JobVo[];
    total: number;
    page: number;
    limit: number;
}

interface RegistResponse {
    id: number;
    username: string;
    email: string;
    create_at: Date | null;
}
interface LoginResponse {
    id: number;
    username: string;
    create_at: Date | null;
    update_at: Date | null;
    email: string;
    token: string;
    userId?: number;
}

declare const loginformSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
}, {
    username: string;
    password: string;
}>;
declare const registformSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
    email: z.ZodString;
    captcha: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
    confirmPassword: string;
    email: string;
    captcha: string;
}, {
    username: string;
    password: string;
    confirmPassword: string;
    email: string;
    captcha: string;
}>;
type LoginFormType = z.infer<typeof loginformSchema>;
type RegistFormType = z.infer<typeof registformSchema>;

interface UserInfoFromToken {
    userId: string;
    username: string;
}
type VerifyMetaData = {
    requireLogin?: boolean;
    requireOwn?: boolean;
    tableName?: string;
    resourceId?: string;
};

/**
 * @param item 每个亮点的类型
 * @returns
 */
declare function getLightspotSchema(item?: any): z.ZodObject<{
    team: z.ZodDefault<z.ZodArray<any, "many">>;
    skill: z.ZodDefault<z.ZodArray<any, "many">>;
    user: z.ZodDefault<z.ZodArray<any, "many">>;
}, "strip", z.ZodTypeAny, {
    team: any[];
    skill: any[];
    user: any[];
}, {
    team?: any[] | undefined;
    skill?: any[] | undefined;
    user?: any[] | undefined;
}>;
declare const projectSchema: z.ZodObject<{
    info: z.ZodObject<{
        name: z.ZodString;
        desc: z.ZodObject<{
            role: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            contribute: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            bgAndTarget: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            role: string;
            contribute: string;
            bgAndTarget: string;
        }, {
            role?: string | undefined;
            contribute?: string | undefined;
            bgAndTarget?: string | undefined;
        }>;
        techStack: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        desc: {
            role: string;
            contribute: string;
            bgAndTarget: string;
        };
        techStack: string[];
    }, {
        name: string;
        desc: {
            role?: string | undefined;
            contribute?: string | undefined;
            bgAndTarget?: string | undefined;
        };
        techStack?: string[] | undefined;
    }>;
    lightspot: z.ZodObject<{
        team: z.ZodDefault<z.ZodArray<any, "many">>;
        skill: z.ZodDefault<z.ZodArray<any, "many">>;
        user: z.ZodDefault<z.ZodArray<any, "many">>;
    }, "strip", z.ZodTypeAny, {
        team: any[];
        skill: any[];
        user: any[];
    }, {
        team?: any[] | undefined;
        skill?: any[] | undefined;
        user?: any[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    info: {
        name: string;
        desc: {
            role: string;
            contribute: string;
            bgAndTarget: string;
        };
        techStack: string[];
    };
    lightspot: {
        team: any[];
        skill: any[];
        user: any[];
    };
}, {
    info: {
        name: string;
        desc: {
            role?: string | undefined;
            contribute?: string | undefined;
            bgAndTarget?: string | undefined;
        };
        techStack?: string[] | undefined;
    };
    lightspot: {
        team?: any[] | undefined;
        skill?: any[] | undefined;
        user?: any[] | undefined;
    };
}>;
declare const projectPolishedSchema: z.ZodObject<{
    info: z.ZodObject<{
        name: z.ZodString;
        desc: z.ZodObject<{
            role: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            contribute: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            bgAndTarget: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            role: string;
            contribute: string;
            bgAndTarget: string;
        }, {
            role?: string | undefined;
            contribute?: string | undefined;
            bgAndTarget?: string | undefined;
        }>;
        techStack: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        desc: {
            role: string;
            contribute: string;
            bgAndTarget: string;
        };
        techStack: string[];
    }, {
        name: string;
        desc: {
            role?: string | undefined;
            contribute?: string | undefined;
            bgAndTarget?: string | undefined;
        };
        techStack?: string[] | undefined;
    }>;
    lightspot: z.ZodObject<{
        team: z.ZodDefault<z.ZodArray<any, "many">>;
        skill: z.ZodDefault<z.ZodArray<any, "many">>;
        user: z.ZodDefault<z.ZodArray<any, "many">>;
    }, "strip", z.ZodTypeAny, {
        team: any[];
        skill: any[];
        user: any[];
    }, {
        team?: any[] | undefined;
        skill?: any[] | undefined;
        user?: any[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    info: {
        name: string;
        desc: {
            role: string;
            contribute: string;
            bgAndTarget: string;
        };
        techStack: string[];
    };
    lightspot: {
        team: any[];
        skill: any[];
        user: any[];
    };
}, {
    info: {
        name: string;
        desc: {
            role?: string | undefined;
            contribute?: string | undefined;
            bgAndTarget?: string | undefined;
        };
        techStack?: string[] | undefined;
    };
    lightspot: {
        team?: any[] | undefined;
        skill?: any[] | undefined;
        user?: any[] | undefined;
    };
}>;
declare const projectMinedSchema: z.ZodObject<{
    info: z.ZodObject<{
        name: z.ZodString;
        desc: z.ZodObject<{
            role: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            contribute: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            bgAndTarget: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            role: string;
            contribute: string;
            bgAndTarget: string;
        }, {
            role?: string | undefined;
            contribute?: string | undefined;
            bgAndTarget?: string | undefined;
        }>;
        techStack: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        desc: {
            role: string;
            contribute: string;
            bgAndTarget: string;
        };
        techStack: string[];
    }, {
        name: string;
        desc: {
            role?: string | undefined;
            contribute?: string | undefined;
            bgAndTarget?: string | undefined;
        };
        techStack?: string[] | undefined;
    }>;
    lightspot: z.ZodObject<{
        team: z.ZodDefault<z.ZodArray<any, "many">>;
        skill: z.ZodDefault<z.ZodArray<any, "many">>;
        user: z.ZodDefault<z.ZodArray<any, "many">>;
    }, "strip", z.ZodTypeAny, {
        team: any[];
        skill: any[];
        user: any[];
    }, {
        team?: any[] | undefined;
        skill?: any[] | undefined;
        user?: any[] | undefined;
    }>;
    lightspotAdded: z.ZodObject<{
        team: z.ZodDefault<z.ZodArray<any, "many">>;
        skill: z.ZodDefault<z.ZodArray<any, "many">>;
        user: z.ZodDefault<z.ZodArray<any, "many">>;
    }, "strip", z.ZodTypeAny, {
        team: any[];
        skill: any[];
        user: any[];
    }, {
        team?: any[] | undefined;
        skill?: any[] | undefined;
        user?: any[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    info: {
        name: string;
        desc: {
            role: string;
            contribute: string;
            bgAndTarget: string;
        };
        techStack: string[];
    };
    lightspot: {
        team: any[];
        skill: any[];
        user: any[];
    };
    lightspotAdded: {
        team: any[];
        skill: any[];
        user: any[];
    };
}, {
    info: {
        name: string;
        desc: {
            role?: string | undefined;
            contribute?: string | undefined;
            bgAndTarget?: string | undefined;
        };
        techStack?: string[] | undefined;
    };
    lightspot: {
        team?: any[] | undefined;
        skill?: any[] | undefined;
        user?: any[] | undefined;
    };
    lightspotAdded: {
        team?: any[] | undefined;
        skill?: any[] | undefined;
        user?: any[] | undefined;
    };
}>;
declare const lookupResultSchema: z.ZodObject<{
    problem: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        desc: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        desc: string;
    }, {
        name: string;
        desc: string;
    }>, "many">>;
    solution: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        desc: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        desc: string;
    }, {
        name: string;
        desc: string;
    }>, "many">>;
    score: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    problem: {
        name: string;
        desc: string;
    }[];
    solution: {
        name: string;
        desc: string;
    }[];
    score: number;
}, {
    problem?: {
        name: string;
        desc: string;
    }[] | undefined;
    solution?: {
        name: string;
        desc: string;
    }[] | undefined;
    score?: number | undefined;
}>;

declare enum ProjectStatus {
    refuse = "refuse",//信息未完整
    committed = "committed",//信息完整
    polishing = "polishing",//llm已打磨
    polished = "polished",//用户已合并打磨
    mining = "mining",//llm已挖掘
    mined = "mined",//用户已合并挖掘
    accepted = "accepted"
}
type ProjectDto = z.infer<typeof projectSchema>;
type ProjectPolishedDto = z.infer<typeof projectPolishedSchema>;
type ProjectMinedDto = z.infer<typeof projectMinedSchema>;
interface ProjectVo extends z.infer<typeof projectSchema> {
    id?: string;
    name?: string;
    status: ProjectStatus;
    createdAt?: string;
    updatedAt?: string;
    lookupResult: z.infer<typeof lookupResultSchema>;
}
interface ProjectPolishedVo extends z.infer<typeof projectPolishedSchema> {
}
interface ProjectMineddVo extends z.infer<typeof projectMinedSchema> {
}

declare const projectSchemaForm: z.ZodObject<{
    info: z.ZodObject<{
        name: z.ZodString;
        desc: z.ZodObject<{
            role: z.ZodString;
            contribute: z.ZodString;
            bgAndTarget: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            role: string;
            contribute: string;
            bgAndTarget: string;
        }, {
            role: string;
            contribute: string;
            bgAndTarget: string;
        }>;
        techStack: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        name: string;
        desc: {
            role: string;
            contribute: string;
            bgAndTarget: string;
        };
        techStack: string[];
    }, {
        name: string;
        desc: {
            role: string;
            contribute: string;
            bgAndTarget: string;
        };
        techStack: string[];
    }>;
    lightspot: z.ZodObject<{
        team: z.ZodArray<any, "many">;
        skill: z.ZodArray<any, "many">;
        user: z.ZodArray<any, "many">;
    }, "strip", z.ZodTypeAny, {
        team: any[];
        skill: any[];
        user: any[];
    }, {
        team: any[];
        skill: any[];
        user: any[];
    }>;
}, "strip", z.ZodTypeAny, {
    info: {
        name: string;
        desc: {
            role: string;
            contribute: string;
            bgAndTarget: string;
        };
        techStack: string[];
    };
    lightspot: {
        team: any[];
        skill: any[];
        user: any[];
    };
}, {
    info: {
        name: string;
        desc: {
            role: string;
            contribute: string;
            bgAndTarget: string;
        };
        techStack: string[];
    };
    lightspot: {
        team: any[];
        skill: any[];
        user: any[];
    };
}>;

interface SkillItem {
    type?: string;
    content?: string[];
}
interface CreateSkillDto {
    readonly content: SkillItem[];
}
type UpdateSkillDto = Partial<CreateSkillDto>;
interface SkillVo {
    id?: string;
    content: SkillItem[];
    createdAt?: string;
    updatedAt?: string;
}

/**
 * 创建简历的 DTO
 */
interface CreateResumeDto {
    readonly name: string;
    readonly skills?: string[];
    readonly projects?: string[];
}
/**
 * 更新简历的 DTO
 */
type UpdateResumeDto = Partial<CreateResumeDto>;
/**
 * 简历的 VO (View Object)
 * 用于API响应和前端展示
 */
interface ResumeVo {
    id?: string;
    name: string;
    skill: SkillVo;
    projects: ProjectVo[];
    createdAt?: string;
    updatedAt?: string;
}
/**
 * 分页后的简历列表结果
 */
interface PaginatedResumesResult {
    data: ResumeVo[];
    total: number;
    page: number;
    limit: number;
}

interface ServerDataFormat<TData = unknown> {
    code: string;
    message: string;
    data: TData;
}

interface DataChunk {
    data: {
        content?: string;
        error?: string;
        done: boolean;
        cached?: boolean;
        exact?: boolean;
    };
}
interface LLMSessionRequest {
    prompt: string;
}
interface LLMSessionResponse {
    sessionId: string;
}
interface LLMSessionStatusResponse {
    status: 'notfound' | 'bothdone' | 'backdone' | 'running' | 'tasknotfound';
}

/**
 * 将项目的Markdown格式文本转换为符合projectSchemaForm的结构化数据
 * @param markdown 项目的Markdown格式文本
 * @returns 符合projectSchemaForm的结构化数据
 */
declare function markdownToProjectSchema(markdown: string): z.infer<typeof projectSchemaForm>;
/**
 * 将项目schema对象转换回Markdown格式
 * @param project 项目结构化数据
 * @returns Markdown格式文本
 */
declare function projectSchemaToMarkdown(project: z.infer<typeof projectSchemaForm>): string;

export { type CreateJobDto, type CreateResumeDto, type CreateSkillDto, type DataChunk, ErrorCode, type JobVo, type LLMSessionRequest, type LLMSessionResponse, type LLMSessionStatusResponse, type LoginFormType, type LoginResponse, type PaginatedJobsResult, type PaginatedResumesResult, type ProjectDto, type ProjectMinedDto, type ProjectMineddVo, type ProjectPolishedDto, type ProjectPolishedVo, ProjectStatus, type ProjectVo, type RegistFormType, type RegistResponse, type ResumeVo, type ServerDataFormat, type SkillItem, type SkillVo, type UpdateJobDto, type UpdateResumeDto, type UpdateSkillDto, type UserInfoFromToken, type VerifyMetaData, errorMessage, getLightspotSchema, loginformSchema, lookupResultSchema, markdownToProjectSchema, projectMinedSchema, projectPolishedSchema, projectSchema, projectSchemaForm, projectSchemaToMarkdown, registformSchema };
