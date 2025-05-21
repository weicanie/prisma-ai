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
    TOOL_CALL_ERROR = "3004"
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
};

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

declare const projectSchema: z.ZodObject<{
    info: z.ZodObject<{
        name: z.ZodString;
        desc: z.ZodObject<{
            role: z.ZodOptional<z.ZodString>;
            contribute: z.ZodOptional<z.ZodString>;
            bgAndTarget: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            role?: string | undefined;
            contribute?: string | undefined;
            bgAndTarget?: string | undefined;
        }, {
            role?: string | undefined;
            contribute?: string | undefined;
            bgAndTarget?: string | undefined;
        }>;
        techStack: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        desc: {
            role?: string | undefined;
            contribute?: string | undefined;
            bgAndTarget?: string | undefined;
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
            role?: string | undefined;
            contribute?: string | undefined;
            bgAndTarget?: string | undefined;
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
            role: z.ZodOptional<z.ZodString>;
            contribute: z.ZodOptional<z.ZodString>;
            bgAndTarget: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            role?: string | undefined;
            contribute?: string | undefined;
            bgAndTarget?: string | undefined;
        }, {
            role?: string | undefined;
            contribute?: string | undefined;
            bgAndTarget?: string | undefined;
        }>;
        techStack: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        desc: {
            role?: string | undefined;
            contribute?: string | undefined;
            bgAndTarget?: string | undefined;
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
            role?: string | undefined;
            contribute?: string | undefined;
            bgAndTarget?: string | undefined;
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
            role: z.ZodOptional<z.ZodString>;
            contribute: z.ZodOptional<z.ZodString>;
            bgAndTarget: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            role?: string | undefined;
            contribute?: string | undefined;
            bgAndTarget?: string | undefined;
        }, {
            role?: string | undefined;
            contribute?: string | undefined;
            bgAndTarget?: string | undefined;
        }>;
        techStack: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        desc: {
            role?: string | undefined;
            contribute?: string | undefined;
            bgAndTarget?: string | undefined;
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
            role?: string | undefined;
            contribute?: string | undefined;
            bgAndTarget?: string | undefined;
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
type ProjectExperience = z.infer<typeof projectSchema>;
type ProjectExperiencePolished = z.infer<typeof projectPolishedSchema>;
type ProjectExperienceMined = z.infer<typeof projectMinedSchema>;

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
    status: 'notfound' | 'bothdone' | 'backdone' | 'running';
}

export { type DataChunk, ErrorCode, type LLMSessionRequest, type LLMSessionResponse, type LLMSessionStatusResponse, type LoginFormType, type LoginResponse, type ProjectExperience, type ProjectExperienceMined, type ProjectExperiencePolished, type RegistFormType, type RegistResponse, type ServerDataFormat, type UserInfoFromToken, type VerifyMetaData, errorMessage, loginformSchema, projectMinedSchema, projectPolishedSchema, projectSchema, registformSchema };
