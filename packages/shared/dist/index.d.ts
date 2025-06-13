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
    FORMAT_ERROR = "4005"
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
    "4005": string;
};

declare const hjmRerankSchema: z.ZodObject<{
    ranked_jobs: z.ZodArray<z.ZodObject<{
        job_id: z.ZodString;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        job_id: string;
        reason: string;
    }, {
        job_id: string;
        reason: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    ranked_jobs: {
        job_id: string;
        reason: string;
    }[];
}, {
    ranked_jobs: {
        job_id: string;
        reason: string;
    }[];
}>;

declare enum JobOpenStatus {
    OPEN = "open",//招聘中
    CLOSED = "closed"
}
declare enum JobStatus {
    COMMITTED = "committed",//存储了但未处理
    EMBEDDED = "embedded",//已embedding
    MATCHED = "matched"
}
/**
 * 创建招聘信息的 DTO
 */
interface CreateJobDto {
    jobName: string;
    companyName: string;
    description: string;
    location?: string;
    salary?: string;
    link?: string;
    job_status?: JobOpenStatus;
}
type LLMJobDto = Pick<CreateJobDto, 'jobName' | 'companyName' | 'description'>;
/**
 * 更新招聘信息的 DTO (CreateJobDto 的部分属性)
 */
type UpdateJobDto = Partial<CreateJobDto>;
/**
 * 招聘信息的 VO (View Object)
 * 用于API响应和前端展示
 */
interface JobVo {
    id: string;
    jobName: string;
    companyName: string;
    description: string;
    location?: string;
    salary?: string;
    link?: string;
    job_status?: JobOpenStatus;
    status?: JobStatus;
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

declare const llmJobSchema: z.ZodObject<{
    jobName: z.ZodString;
    companyName: z.ZodString;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    jobName: string;
    companyName: string;
    description: string;
}, {
    jobName: string;
    companyName: string;
    description: string;
}>;

declare const type_content_Map: Record<string, string>;
declare enum KnowledgeTypeEnum {
    userProjectDoc = "userProjectDoc",//我的项目文档
    userProjectRepo = "userProjectRepo",//我的项目github仓库地址
    openSourceProjectDoc = "openSourceProjectDoc",//开源项目文档
    openSourceProjectRepo = "openSourceProjectRepo",//开源项目github仓库地址
    techDoc = "techDoc",//技术文档
    interviewQuestion = "interviewQuestion",//面试题
    other = "other"
}
declare enum FileTypeEnum {
    txt = "txt",//txt
    url = "url",//url
    doc = "doc"
}
interface CreateKnowledgeDto {
    name: string;
    fileType: `${FileTypeEnum}`;
    tag: string[];
    type: `${KnowledgeTypeEnum}`;
    content: string;
}
type UpdateKnowledgeDto = Partial<CreateKnowledgeDto>;
interface KnowledgeVo {
    id: string;
    name: string;
    type: `${KnowledgeTypeEnum}`;
    createdAt: Date;
    updatedAt: Date;
    fileType: string;
    tag: string[];
    content: string;
}
/**
 * 分页后的知识库列表结果
 */
interface PaginatedKnsResult {
    data: KnowledgeVo[];
    total: number;
    page: number;
    limit: number;
}

declare const roadFromDiffSchema: z.ZodObject<{
    skill: z.ZodObject<{
        tech: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            desc: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            desc: string;
        }, {
            name: string;
            desc: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        tech: {
            name: string;
            desc: string;
        }[];
    }, {
        tech: {
            name: string;
            desc: string;
        }[];
    }>;
    project: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        tech: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            desc: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            desc: string;
        }, {
            name: string;
            desc: string;
        }>, "many">;
        lightspot: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            desc: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            desc: string;
        }, {
            name: string;
            desc: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        name: string;
        tech: {
            name: string;
            desc: string;
        }[];
        lightspot: {
            name: string;
            desc: string;
        }[];
    }, {
        name: string;
        tech: {
            name: string;
            desc: string;
        }[];
        lightspot: {
            name: string;
            desc: string;
        }[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    skill: {
        tech: {
            name: string;
            desc: string;
        }[];
    };
    project: {
        name: string;
        tech: {
            name: string;
            desc: string;
        }[];
        lightspot: {
            name: string;
            desc: string;
        }[];
    }[];
}, {
    skill: {
        tech: {
            name: string;
            desc: string;
        }[];
    };
    project: {
        name: string;
        tech: {
            name: string;
            desc: string;
        }[];
        lightspot: {
            name: string;
            desc: string;
        }[];
    }[];
}>;
type RoadFromDiff = z.infer<typeof roadFromDiffSchema>;

type RoadFromDiffDto = z.infer<typeof roadFromDiffSchema>;

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
declare function getLightspotSchema<T extends z.ZodTypeAny = z.ZodType<string>>(item: T): z.ZodObject<{
    team: z.ZodDefault<z.ZodArray<T, "many">>;
    skill: z.ZodDefault<z.ZodArray<T, "many">>;
    user: z.ZodDefault<z.ZodArray<T, "many">>;
}, "strip", z.ZodTypeAny, {
    skill: T["_output"][];
    team: T["_output"][];
    user: T["_output"][];
}, {
    skill?: T["_input"][] | undefined;
    team?: T["_input"][] | undefined;
    user?: T["_input"][] | undefined;
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
        team: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        skill: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        user: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        skill: string[];
        team: string[];
        user: string[];
    }, {
        skill?: string[] | undefined;
        team?: string[] | undefined;
        user?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    lightspot: {
        skill: string[];
        team: string[];
        user: string[];
    };
    info: {
        name: string;
        desc: {
            role: string;
            contribute: string;
            bgAndTarget: string;
        };
        techStack: string[];
    };
}, {
    lightspot: {
        skill?: string[] | undefined;
        team?: string[] | undefined;
        user?: string[] | undefined;
    };
    info: {
        name: string;
        desc: {
            role?: string | undefined;
            contribute?: string | undefined;
            bgAndTarget?: string | undefined;
        };
        techStack?: string[] | undefined;
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
        team: z.ZodDefault<z.ZodArray<z.ZodObject<{
            content: z.ZodString;
            advice: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            content: string;
            advice: string;
        }, {
            content: string;
            advice?: string | undefined;
        }>, "many">>;
        skill: z.ZodDefault<z.ZodArray<z.ZodObject<{
            content: z.ZodString;
            advice: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            content: string;
            advice: string;
        }, {
            content: string;
            advice?: string | undefined;
        }>, "many">>;
        user: z.ZodDefault<z.ZodArray<z.ZodObject<{
            content: z.ZodString;
            advice: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            content: string;
            advice: string;
        }, {
            content: string;
            advice?: string | undefined;
        }>, "many">>;
        delete: z.ZodDefault<z.ZodArray<z.ZodObject<{
            content: z.ZodString;
            reason: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            reason: string;
            content: string;
        }, {
            content: string;
            reason?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        skill: {
            content: string;
            advice: string;
        }[];
        team: {
            content: string;
            advice: string;
        }[];
        user: {
            content: string;
            advice: string;
        }[];
        delete: {
            reason: string;
            content: string;
        }[];
    }, {
        skill?: {
            content: string;
            advice?: string | undefined;
        }[] | undefined;
        team?: {
            content: string;
            advice?: string | undefined;
        }[] | undefined;
        user?: {
            content: string;
            advice?: string | undefined;
        }[] | undefined;
        delete?: {
            content: string;
            reason?: string | undefined;
        }[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    lightspot: {
        skill: {
            content: string;
            advice: string;
        }[];
        team: {
            content: string;
            advice: string;
        }[];
        user: {
            content: string;
            advice: string;
        }[];
        delete: {
            reason: string;
            content: string;
        }[];
    };
    info: {
        name: string;
        desc: {
            role: string;
            contribute: string;
            bgAndTarget: string;
        };
        techStack: string[];
    };
}, {
    lightspot: {
        skill?: {
            content: string;
            advice?: string | undefined;
        }[] | undefined;
        team?: {
            content: string;
            advice?: string | undefined;
        }[] | undefined;
        user?: {
            content: string;
            advice?: string | undefined;
        }[] | undefined;
        delete?: {
            content: string;
            reason?: string | undefined;
        }[] | undefined;
    };
    info: {
        name: string;
        desc: {
            role?: string | undefined;
            contribute?: string | undefined;
            bgAndTarget?: string | undefined;
        };
        techStack?: string[] | undefined;
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
        team: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        skill: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        user: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        skill: string[];
        team: string[];
        user: string[];
    }, {
        skill?: string[] | undefined;
        team?: string[] | undefined;
        user?: string[] | undefined;
    }>;
    lightspotAdded: z.ZodObject<{
        team: z.ZodDefault<z.ZodArray<z.ZodObject<{
            content: z.ZodString;
            reason: z.ZodDefault<z.ZodString>;
            tech: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            reason: string;
            tech: string[];
            content: string;
        }, {
            content: string;
            reason?: string | undefined;
            tech?: string[] | undefined;
        }>, "many">>;
        skill: z.ZodDefault<z.ZodArray<z.ZodObject<{
            content: z.ZodString;
            reason: z.ZodDefault<z.ZodString>;
            tech: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            reason: string;
            tech: string[];
            content: string;
        }, {
            content: string;
            reason?: string | undefined;
            tech?: string[] | undefined;
        }>, "many">>;
        user: z.ZodDefault<z.ZodArray<z.ZodObject<{
            content: z.ZodString;
            reason: z.ZodDefault<z.ZodString>;
            tech: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            reason: string;
            tech: string[];
            content: string;
        }, {
            content: string;
            reason?: string | undefined;
            tech?: string[] | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        skill: {
            reason: string;
            tech: string[];
            content: string;
        }[];
        team: {
            reason: string;
            tech: string[];
            content: string;
        }[];
        user: {
            reason: string;
            tech: string[];
            content: string;
        }[];
    }, {
        skill?: {
            content: string;
            reason?: string | undefined;
            tech?: string[] | undefined;
        }[] | undefined;
        team?: {
            content: string;
            reason?: string | undefined;
            tech?: string[] | undefined;
        }[] | undefined;
        user?: {
            content: string;
            reason?: string | undefined;
            tech?: string[] | undefined;
        }[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    lightspot: {
        skill: string[];
        team: string[];
        user: string[];
    };
    info: {
        name: string;
        desc: {
            role: string;
            contribute: string;
            bgAndTarget: string;
        };
        techStack: string[];
    };
    lightspotAdded: {
        skill: {
            reason: string;
            tech: string[];
            content: string;
        }[];
        team: {
            reason: string;
            tech: string[];
            content: string;
        }[];
        user: {
            reason: string;
            tech: string[];
            content: string;
        }[];
    };
}, {
    lightspot: {
        skill?: string[] | undefined;
        team?: string[] | undefined;
        user?: string[] | undefined;
    };
    info: {
        name: string;
        desc: {
            role?: string | undefined;
            contribute?: string | undefined;
            bgAndTarget?: string | undefined;
        };
        techStack?: string[] | undefined;
    };
    lightspotAdded: {
        skill?: {
            content: string;
            reason?: string | undefined;
            tech?: string[] | undefined;
        }[] | undefined;
        team?: {
            content: string;
            reason?: string | undefined;
            tech?: string[] | undefined;
        }[] | undefined;
        user?: {
            content: string;
            reason?: string | undefined;
            tech?: string[] | undefined;
        }[] | undefined;
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
declare const projectLookupedSchema: z.ZodObject<{
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
        team: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        skill: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        user: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        skill: string[];
        team: string[];
        user: string[];
    }, {
        skill?: string[] | undefined;
        team?: string[] | undefined;
        user?: string[] | undefined;
    }>;
    lookupResult: z.ZodObject<{
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
}, "strip", z.ZodTypeAny, {
    lightspot: {
        skill: string[];
        team: string[];
        user: string[];
    };
    info: {
        name: string;
        desc: {
            role: string;
            contribute: string;
            bgAndTarget: string;
        };
        techStack: string[];
    };
    lookupResult: {
        problem: {
            name: string;
            desc: string;
        }[];
        solution: {
            name: string;
            desc: string;
        }[];
        score: number;
    };
}, {
    lightspot: {
        skill?: string[] | undefined;
        team?: string[] | undefined;
        user?: string[] | undefined;
    };
    info: {
        name: string;
        desc: {
            role?: string | undefined;
            contribute?: string | undefined;
            bgAndTarget?: string | undefined;
        };
        techStack?: string[] | undefined;
    };
    lookupResult: {
        problem?: {
            name: string;
            desc: string;
        }[] | undefined;
        solution?: {
            name: string;
            desc: string;
        }[] | undefined;
        score?: number | undefined;
    };
}>;

declare enum ProjectStatus {
    committed = "committed",//初提交
    lookuped = "lookuped",//llm分析完毕
    polishing = "polishing",//llm已打磨
    polished = "polished",//用户已合并打磨
    mining = "mining",//llm已挖掘
    mined = "mined",//用户已合并挖掘
    accepted = "accepted",//完成
    matched = "matched"
}
type lookupResultDto = z.infer<typeof lookupResultSchema>;
type projectLookupedDto = z.infer<typeof projectLookupedSchema>;
type ProjectDto = z.infer<typeof projectSchema>;
type ProjectPolishedDto = z.infer<typeof projectPolishedSchema>;
type ProjectMinedDto = z.infer<typeof projectMinedSchema>;
interface ProjectVo extends z.infer<typeof projectSchema> {
    id: string;
    name?: string;
    status: ProjectStatus;
    createdAt: string;
    updatedAt: string;
    lookupResult?: z.infer<typeof lookupResultSchema>;
}
interface ProjectPolishedVo extends z.infer<typeof projectPolishedSchema> {
    reasonContent?: string;
}
interface ProjectMineddVo extends z.infer<typeof projectMinedSchema> {
    reasonContent?: string;
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
        skill: any[];
        team: any[];
        user: any[];
    }, {
        skill: any[];
        team: any[];
        user: any[];
    }>;
}, "strip", z.ZodTypeAny, {
    lightspot: {
        skill: any[];
        team: any[];
        user: any[];
    };
    info: {
        name: string;
        desc: {
            role: string;
            contribute: string;
            bgAndTarget: string;
        };
        techStack: string[];
    };
}, {
    lightspot: {
        skill: any[];
        team: any[];
        user: any[];
    };
    info: {
        name: string;
        desc: {
            role: string;
            contribute: string;
            bgAndTarget: string;
        };
        techStack: string[];
    };
}>;

/**
 * match chain 传入的简历
 */
declare const resumeMatchedSchema: z.ZodObject<{
    name: z.ZodString;
    skill: z.ZodObject<{
        content: z.ZodArray<z.ZodObject<{
            type: z.ZodDefault<z.ZodString>;
            content: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            type: string;
            content: string[];
        }, {
            type?: string | undefined;
            content?: string[] | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        content: {
            type: string;
            content: string[];
        }[];
    }, {
        content: {
            type?: string | undefined;
            content?: string[] | undefined;
        }[];
    }>;
    projects: z.ZodArray<z.ZodObject<{
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
            team: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            skill: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            user: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            skill: string[];
            team: string[];
            user: string[];
        }, {
            skill?: string[] | undefined;
            team?: string[] | undefined;
            user?: string[] | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        lightspot: {
            skill: string[];
            team: string[];
            user: string[];
        };
        info: {
            name: string;
            desc: {
                role: string;
                contribute: string;
                bgAndTarget: string;
            };
            techStack: string[];
        };
    }, {
        lightspot: {
            skill?: string[] | undefined;
            team?: string[] | undefined;
            user?: string[] | undefined;
        };
        info: {
            name: string;
            desc: {
                role?: string | undefined;
                contribute?: string | undefined;
                bgAndTarget?: string | undefined;
            };
            techStack?: string[] | undefined;
        };
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    name: string;
    skill: {
        content: {
            type: string;
            content: string[];
        }[];
    };
    projects: {
        lightspot: {
            skill: string[];
            team: string[];
            user: string[];
        };
        info: {
            name: string;
            desc: {
                role: string;
                contribute: string;
                bgAndTarget: string;
            };
            techStack: string[];
        };
    }[];
}, {
    name: string;
    skill: {
        content: {
            type?: string | undefined;
            content?: string[] | undefined;
        }[];
    };
    projects: {
        lightspot: {
            skill?: string[] | undefined;
            team?: string[] | undefined;
            user?: string[] | undefined;
        };
        info: {
            name: string;
            desc: {
                role?: string | undefined;
                contribute?: string | undefined;
                bgAndTarget?: string | undefined;
            };
            techStack?: string[] | undefined;
        };
    }[];
}>;

interface SkillItem {
    type?: string;
    content?: string[];
}
interface CreateSkillDto {
    name: string;
    content: SkillItem[];
}
type UpdateSkillDto = Partial<CreateSkillDto>;
interface SkillVo {
    id: string;
    name: string;
    content: SkillItem[];
    createdAt: string;
    updatedAt: string;
}

declare enum ResumeStatus {
    committed = "committed",//初提交
    matched = "matched"
}
/**
 * 创建简历的 DTO
 */
interface CreateResumeDto {
    name: string;
    skill?: string;
    projects?: string[];
}
/**
 * 更新简历的 DTO
 */
type UpdateResumeDto = Partial<CreateResumeDto>;
/**
 * 简历匹配岗位前端上传的 DTO
 */
interface MatchJobDto {
    resume: string;
    job: string;
}
/**
 * 简历匹配岗位传入chain的 DTO
 */
type ResumeMatchedDto = z.infer<typeof resumeMatchedSchema>;
/**
 * 简历的 VO (View Object)
 * 用于API响应和前端展示
 */
interface ResumeVo {
    id: string;
    name: string;
    status: ResumeStatus;
    skill: SkillVo;
    projects: ProjectVo[];
    resumeMatcheds?: string[];
    createdAt: string;
    updatedAt: string;
}
type ResumeMatchedVo = Omit<ResumeVo, 'resumeMatcheds'> & {
    jobId: string;
};
/**
 * 分页后的简历列表结果
 */
interface PaginatedResumesResult {
    data: ResumeVo[];
    total: number;
    page: number;
    limit: number;
}
/**
 * 分页后的简历列表结果
 */
interface PaginatedResumeMatchedResult {
    data: ResumeMatchedVo[];
    total: number;
    page: number;
    limit: number;
}

interface ServerDataFormat<TData = unknown> {
    code: string;
    message: string;
    data: TData;
}

declare const skillItemSchema: z.ZodObject<{
    type: z.ZodDefault<z.ZodString>;
    content: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    type: string;
    content: string[];
}, {
    type?: string | undefined;
    content?: string[] | undefined;
}>;
declare const skillSchema: z.ZodObject<{
    content: z.ZodArray<z.ZodObject<{
        type: z.ZodDefault<z.ZodString>;
        content: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        content: string[];
    }, {
        type?: string | undefined;
        content?: string[] | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    content: {
        type: string;
        content: string[];
    }[];
}, {
    content: {
        type?: string | undefined;
        content?: string[] | undefined;
    }[];
}>;

interface StreamingChunk {
    content: string;
    reasonContent?: string;
    done: boolean;
    isReasoning?: boolean;
}
interface DataChunkVO {
    data: StreamingChunk & {
        cached?: boolean;
        exact?: boolean;
    };
}
interface DataChunkErrVO {
    data: {
        error: string;
        done: true;
    };
}
interface TRequestParams {
    polish: {
        input: ProjectDto;
        target: 'polish';
    };
    mine: {
        input: ProjectDto;
        target: 'mine';
    };
    lookup: {
        input: ProjectDto;
        target: 'lookup';
    };
}
declare const RequestTargetMap: {
    polish: string;
    mine: string;
    lookup: string;
};
interface LLMSessionRequest {
    input: any;
    userInfo?: UserInfoFromToken;
}
interface LLMSessionResponse {
    sessionId: string;
}
interface LLMSessionStatusResponse {
    status: 'notfound' | 'bothdone' | 'backdone' | 'running' | 'tasknotfound';
}

/**
 * 将llm返回的内容解析为JSON格式的对象
 */
declare function jsonMd_obj(content: string): any;

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
declare const skillsToMarkdown: (data: CreateSkillDto) => string;
declare const markdownToSkills: (markdown: string) => CreateSkillDto;

export { type CreateJobDto, type CreateKnowledgeDto, type CreateResumeDto, type CreateSkillDto, type DataChunkErrVO, type DataChunkVO, ErrorCode, FileTypeEnum, JobOpenStatus, JobStatus, type JobVo, KnowledgeTypeEnum, type KnowledgeVo, type LLMJobDto, type LLMSessionRequest, type LLMSessionResponse, type LLMSessionStatusResponse, type LoginFormType, type LoginResponse, type MatchJobDto, type PaginatedJobsResult, type PaginatedKnsResult, type PaginatedResumeMatchedResult, type PaginatedResumesResult, type ProjectDto, type ProjectMinedDto, type ProjectMineddVo, type ProjectPolishedDto, type ProjectPolishedVo, ProjectStatus, type ProjectVo, type RegistFormType, type RegistResponse, RequestTargetMap, type ResumeMatchedDto, type ResumeMatchedVo, ResumeStatus, type ResumeVo, type RoadFromDiff, type RoadFromDiffDto, type ServerDataFormat, type SkillItem, type SkillVo, type StreamingChunk, type TRequestParams, type UpdateJobDto, type UpdateKnowledgeDto, type UpdateResumeDto, type UpdateSkillDto, type UserInfoFromToken, type VerifyMetaData, errorMessage, getLightspotSchema, hjmRerankSchema, jsonMd_obj, llmJobSchema, loginformSchema, type lookupResultDto, lookupResultSchema, markdownToProjectSchema, markdownToSkills, type projectLookupedDto, projectLookupedSchema, projectMinedSchema, projectPolishedSchema, projectSchema, projectSchemaForm, projectSchemaToMarkdown, registformSchema, resumeMatchedSchema, roadFromDiffSchema, skillItemSchema, skillSchema, skillsToMarkdown, type_content_Map };
