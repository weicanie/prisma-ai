// src/constant/error.ts
var ErrorCode = /* @__PURE__ */ ((ErrorCode2) => {
  ErrorCode2["SUCCESS"] = "0";
  ErrorCode2["UNNAMED"] = "9999";
  ErrorCode2["VALIDATION_ERROR"] = "1001";
  ErrorCode2["AUTH_ERROR"] = "1002";
  ErrorCode2["FORBIDDEN"] = "1003";
  ErrorCode2["NOT_FOUND"] = "1004";
  ErrorCode2["SERVER_ERROR"] = "1005";
  ErrorCode2["USER_NOT_FOUND"] = "2001";
  ErrorCode2["USER_ALREADY_EXISTS"] = "2002";
  ErrorCode2["USER_PASSWORD_WRONG"] = "2003";
  ErrorCode2["CAPTCHAEXPIRED"] = "2004";
  ErrorCode2["CAPTCHAWRONG"] = "2005";
  ErrorCode2["USER_TOKEN_INVALID"] = "2006";
  ErrorCode2["USER_TOKEN_NOT_CARRY"] = "2007";
  ErrorCode2["SERVER_NOT_FOUND"] = "3001";
  ErrorCode2["SERVER_CONNECTION_ERROR"] = "3002";
  ErrorCode2["TOOL_GET_ERROR"] = "3003";
  ErrorCode2["TOOL_CALL_ERROR"] = "3004";
  ErrorCode2["FORMAT_ERROR"] = "4005";
  return ErrorCode2;
})(ErrorCode || {});
var errorMessage = {
  //通用错误
  ["0" /* SUCCESS */]: "\u6210\u529F",
  ["1001" /* VALIDATION_ERROR */]: "\u53C2\u6570\u9A8C\u8BC1\u5931\u8D25",
  ["1002" /* AUTH_ERROR */]: "\u672A\u6388\u6743",
  ["1003" /* FORBIDDEN */]: "\u7981\u6B62\u8BBF\u95EE",
  ["1004" /* NOT_FOUND */]: "\u8D44\u6E90\u672A\u627E\u5230",
  ["1005" /* SERVER_ERROR */]: "\u670D\u52A1\u5668\u9519\u8BEF",
  //业务错误
  //1、注册、登录
  ["2001" /* USER_NOT_FOUND */]: "\u7528\u6237\u4E0D\u5B58\u5728",
  ["2002" /* USER_ALREADY_EXISTS */]: "\u7528\u6237\u5DF2\u5B58\u5728",
  ["2003" /* USER_PASSWORD_WRONG */]: "\u5BC6\u7801\u9519\u8BEF",
  ["2004" /* CAPTCHAEXPIRED */]: "\u9A8C\u8BC1\u7801\u5DF2\u8FC7\u671F",
  ["2005" /* CAPTCHAWRONG */]: "\u9A8C\u8BC1\u7801\u9519\u8BEF",
  ["2006" /* USER_TOKEN_INVALID */]: "\u7528\u6237token\u65E0\u6548",
  ["2007" /* USER_TOKEN_NOT_CARRY */]: "\u7528\u6237token\u672A\u643A\u5E26",
  //2、mcp client
  ["3001" /* SERVER_NOT_FOUND */]: "MCP server\u672A\u627E\u5230",
  ["3002" /* SERVER_CONNECTION_ERROR */]: "MCP server\u8FDE\u63A5\u5931\u8D25",
  ["3003" /* TOOL_GET_ERROR */]: "\u83B7\u53D6mcp\u5DE5\u5177\u5931\u8D25",
  ["3004" /* TOOL_CALL_ERROR */]: "\u8C03\u7528mcp\u5DE5\u5177\u5931\u8D25",
  //3、项目经验
  ["4005" /* FORMAT_ERROR */]: "\u9519\u8BEF\u7684\u6570\u636E\u683C\u5F0F"
};

// src/types/hjm.schema.ts
import { z } from "zod";
var hjmRerankSchema = z.object({
  ranked_jobs: z.array(
    z.object({
      job_id: z.string().describe("\u5C97\u4F4D\u7684\u552F\u4E00\u6807\u8BC6\u7B26"),
      reason: z.string().describe("\u8BE5\u5C97\u4F4D\u4E0E\u7B80\u5386\u5339\u914D\u7684\u5177\u4F53\u539F\u56E0")
    })
  ).describe("\u6309\u5339\u914D\u5EA6\u4ECE\u9AD8\u5230\u4F4E\u6392\u5E8F\u7684\u5C97\u4F4D\u5217\u8868")
});

// src/types/job.ts
var JobOpenStatus = /* @__PURE__ */ ((JobOpenStatus2) => {
  JobOpenStatus2["OPEN"] = "open";
  JobOpenStatus2["CLOSED"] = "closed";
  return JobOpenStatus2;
})(JobOpenStatus || {});
var JobStatus = /* @__PURE__ */ ((JobStatus2) => {
  JobStatus2["COMMITTED"] = "committed";
  JobStatus2["EMBEDDED"] = "embedded";
  JobStatus2["MATCHED"] = "matched";
  return JobStatus2;
})(JobStatus || {});

// src/types/knowBase.ts
var type_content_Map = {
  userProjectDoc: "\u6211\u7684\u9879\u76EE\u6587\u6863",
  userProjectRepo: "\u6211\u7684\u9879\u76EEgithub\u4ED3\u5E93\u5730\u5740",
  openSourceProjectDoc: "\u5F00\u6E90\u9879\u76EE\u6587\u6863",
  openSourceProjectRepo: "\u5F00\u6E90\u9879\u76EEgithub\u4ED3\u5E93\u5730\u5740",
  techDoc: "\u6280\u672F\u6587\u6863",
  interviewQuestion: "\u9762\u8BD5\u9898",
  other: "\u5176\u4ED6"
};
var KnowledgeTypeEnum = /* @__PURE__ */ ((KnowledgeTypeEnum2) => {
  KnowledgeTypeEnum2["userProjectDoc"] = "userProjectDoc";
  KnowledgeTypeEnum2["userProjectRepo"] = "userProjectRepo";
  KnowledgeTypeEnum2["openSourceProjectDoc"] = "openSourceProjectDoc";
  KnowledgeTypeEnum2["openSourceProjectRepo"] = "openSourceProjectRepo";
  KnowledgeTypeEnum2["techDoc"] = "techDoc";
  KnowledgeTypeEnum2["interviewQuestion"] = "interviewQuestion";
  KnowledgeTypeEnum2["other"] = "other";
  return KnowledgeTypeEnum2;
})(KnowledgeTypeEnum || {});
var FileTypeEnum = /* @__PURE__ */ ((FileTypeEnum2) => {
  FileTypeEnum2["txt"] = "txt";
  FileTypeEnum2["url"] = "url";
  FileTypeEnum2["doc"] = "doc";
  return FileTypeEnum2;
})(FileTypeEnum || {});

// src/types/learn.schema.ts
import { z as z2 } from "zod";
var techItemSchema = z2.object({
  name: z2.string().describe("\u6280\u672F\u540D\u79F0"),
  desc: z2.string().describe("\u5B66\u4E60\u6216\u5B9E\u73B0\u8BE5\u6280\u672F\u7684\u7B80\u8981\u8BF4\u660E")
});
var lightspotItemSchema = z2.object({
  name: z2.string().describe("\u4EAE\u70B9\u540D\u79F0"),
  desc: z2.string().describe("\u5B9E\u73B0\u8BE5\u4EAE\u70B9\u7684\u7B80\u8981\u8BF4\u660E")
});
var skillRoadItemSchema = z2.object({
  tech: z2.array(techItemSchema).describe("\u9700\u8981\u5B66\u4E60\u7684\u65B0\u6280\u672F\u5217\u8868")
});
var projectRoadItemSchema = z2.object({
  name: z2.string().describe("\u9879\u76EE\u540D\u79F0"),
  tech: z2.array(techItemSchema).describe("\u9879\u76EE\u4E2D\u9700\u8981\u5B66\u4E60\u7684\u65B0\u6280\u672F\u5217\u8868"),
  lightspot: z2.array(lightspotItemSchema).describe("\u9879\u76EE\u4E2D\u9700\u8981\u5B9E\u73B0\u7684\u65B0\u4EAE\u70B9\u5217\u8868")
});
var roadFromDiffSchema = z2.object({
  skill: skillRoadItemSchema.describe("\u4ECE\u804C\u4E1A\u6280\u80FD\u5BF9\u6BD4\u4E2D\u5F97\u51FA\u7684\u5B66\u4E60\u8DEF\u7EBF"),
  project: z2.array(projectRoadItemSchema).describe("\u4ECE\u9879\u76EE\u7ECF\u9A8C\u5BF9\u6BD4\u4E2D\u5F97\u51FA\u7684\u5B66\u4E60\u8DEF\u7EBF")
});

// src/types/login_regist.schema.ts
import { z as z3 } from "zod";
var loginformSchema = z3.object({
  username: z3.string().min(2, {
    message: "\u7528\u6237\u540D\u81F3\u5C11\u9700\u89812\u4E2A\u5B57\u7B26"
  }),
  password: z3.string().min(6, {
    message: "\u5BC6\u7801\u81F3\u5C11\u9700\u89816\u4E2A\u5B57\u7B26"
  })
});
var registformSchema = z3.object({
  username: z3.string().min(2, {
    message: "\u7528\u6237\u540D\u81F3\u5C11\u9700\u89812\u4E2A\u5B57\u7B26"
  }),
  password: z3.string().min(6, {
    message: "\u5BC6\u7801\u81F3\u5C11\u9700\u89816\u4E2A\u5B57\u7B26"
  }),
  confirmPassword: z3.string().min(6, {
    message: "\u8BF7\u518D\u6B21\u8F93\u5165\u5BC6\u7801"
  }),
  email: z3.string().email({
    message: "\u8BF7\u8F93\u5165\u6B63\u786E\u7684\u90AE\u7BB1\u5730\u5740"
  }),
  captcha: z3.string().min(6, {
    message: "\u8BF7\u8F93\u5165\u6B63\u786E\u7684\u9A8C\u8BC1\u7801"
  })
});

// src/types/project.ts
var ProjectStatus = /* @__PURE__ */ ((ProjectStatus2) => {
  ProjectStatus2["committed"] = "committed";
  ProjectStatus2["lookuped"] = "lookuped";
  ProjectStatus2["polishing"] = "polishing";
  ProjectStatus2["polished"] = "polished";
  ProjectStatus2["mining"] = "mining";
  ProjectStatus2["mined"] = "mined";
  ProjectStatus2["accepted"] = "accepted";
  ProjectStatus2["matched"] = "matched";
  return ProjectStatus2;
})(ProjectStatus || {});

// src/types/project.schema.ts
import { z as z4 } from "zod";
var infoSchema = z4.object({
  name: z4.string().min(2).max(100).describe("\u9879\u76EE\u540D\u79F0"),
  desc: z4.object({
    role: z4.string().describe("\u7528\u6237\u5728\u9879\u76EE\u4E2D\u7684\u89D2\u8272\u548C\u804C\u8D23").optional().default(""),
    contribute: z4.string().describe("\u7528\u6237\u7684\u6838\u5FC3\u8D21\u732E\u548C\u53C2\u4E0E\u7A0B\u5EA6").optional().default(""),
    bgAndTarget: z4.string().describe("\u9879\u76EE\u7684\u80CC\u666F\u548C\u76EE\u7684").optional().default("")
  }),
  techStack: z4.array(z4.string()).describe("\u9879\u76EE\u7684\u6280\u672F\u6808").default([])
}).describe("\u9879\u76EE\u4FE1\u606F\u7684\u7ED3\u6784\u5316\u63CF\u8FF0");
function getLightspotSchema(item) {
  return z4.object({
    team: z4.array(item).describe("\u56E2\u961F\u8D21\u732E\u65B9\u9762\u7684\u4EAE\u70B9").default([]),
    skill: z4.array(item).describe("\u6280\u672F\u4EAE\u70B9/\u96BE\u70B9\u65B9\u9762\u7684\u4EAE\u70B9").default([]),
    user: z4.array(item).describe("\u7528\u6237\u4F53\u9A8C/\u4E1A\u52A1\u4EF7\u503C\u65B9\u9762\u7684\u4EAE\u70B9").default([])
  }).describe("\u9879\u76EE\u4EAE\u70B9\u7684\u7ED3\u6784\u5316\u63CF\u8FF0");
}
var projectSchema = z4.object({
  info: infoSchema,
  lightspot: getLightspotSchema(z4.string())
});
var projectPolishedSchema = z4.object({
  info: infoSchema,
  // polishedInfo: infoSchema.optional(),
  lightspot: z4.object({
    team: z4.array(
      z4.object({
        content: z4.string().describe("\u4EAE\u70B9\u5185\u5BB9"),
        advice: z4.string().describe("\u4EAE\u70B9\u6539\u8FDB\u5EFA\u8BAE").default("NONE")
      })
    ).describe("\u56E2\u961F\u8D21\u732E\u65B9\u9762\u7684\u4EAE\u70B9").default([]),
    skill: z4.array(
      z4.object({
        content: z4.string().describe("\u4EAE\u70B9\u5185\u5BB9"),
        advice: z4.string().describe("\u4EAE\u70B9\u6539\u8FDB\u5EFA\u8BAE").default("NONE")
      })
    ).describe("\u6280\u672F\u4EAE\u70B9/\u96BE\u70B9\u65B9\u9762\u7684\u4EAE\u70B9").default([]),
    user: z4.array(
      z4.object({
        content: z4.string().describe("\u4EAE\u70B9\u5185\u5BB9"),
        advice: z4.string().describe("\u4EAE\u70B9\u6539\u8FDB\u5EFA\u8BAE").default("NONE")
      })
    ).describe("\u7528\u6237\u4F53\u9A8C/\u4E1A\u52A1\u4EF7\u503C\u65B9\u9762\u7684\u4EAE\u70B9").default([]),
    delete: z4.array(
      z4.object({
        content: z4.string().describe("\u4EAE\u70B9\u5185\u5BB9"),
        reason: z4.string().describe("\u4EAE\u70B9\u5220\u9664\u539F\u56E0").default("NONE")
      })
    ).describe("\u5220\u9664\u7684\u4EAE\u70B9").default([])
  }).describe("\u9879\u76EE\u4EAE\u70B9\u7684\u7ED3\u6784\u5316\u63CF\u8FF0")
});
var lightspotAddedSchema = z4.object({
  content: z4.string().describe("\u4EAE\u70B9\u5185\u5BB9"),
  reason: z4.string().describe("\u4EAE\u70B9\u6DFB\u52A0\u539F\u56E0").default("NONE"),
  tech: z4.array(z4.string()).describe("\u6D89\u53CA\u6280\u672F").default([])
});
var projectMinedSchema = z4.object({
  info: infoSchema,
  lightspot: getLightspotSchema(z4.string()),
  lightspotAdded: getLightspotSchema(lightspotAddedSchema)
});
var lookupResultSchema = z4.object({
  problem: z4.array(
    z4.object({
      name: z4.string().describe("\u95EE\u9898\u540D\u79F0"),
      desc: z4.string().describe("\u95EE\u9898\u63CF\u8FF0")
    })
  ).describe("\u5B58\u5728\u7684\u95EE\u9898").default([]),
  solution: z4.array(
    z4.object({
      name: z4.string().describe("\u89E3\u51B3\u65B9\u6848\u540D\u79F0"),
      desc: z4.string().describe("\u89E3\u51B3\u65B9\u6848\u63CF\u8FF0")
    })
  ).describe("\u89E3\u51B3\u65B9\u6848").default([]),
  score: z4.number().describe("\u9879\u76EE\u63CF\u8FF0\u8BC4\u5206, 0-100\u5206").default(0)
});
var projectLookupedSchema = z4.object({
  info: infoSchema,
  lightspot: getLightspotSchema(z4.string()),
  lookupResult: lookupResultSchema
});

// src/types/project.schema-form.ts
import { z as z5 } from "zod";
var infoSchemaForm = z5.object({
  name: z5.string().min(2).max(100).describe("\u9879\u76EE\u540D\u79F0"),
  desc: z5.object({
    role: z5.string().describe("\u7528\u6237\u5728\u9879\u76EE\u4E2D\u7684\u89D2\u8272\u548C\u804C\u8D23"),
    contribute: z5.string().describe("\u7528\u6237\u7684\u6838\u5FC3\u8D21\u732E\u548C\u53C2\u4E0E\u7A0B\u5EA6"),
    bgAndTarget: z5.string().describe("\u9879\u76EE\u7684\u80CC\u666F\u548C\u76EE\u7684")
  }),
  techStack: z5.array(z5.string()).describe("\u9879\u76EE\u7684\u6280\u672F\u6808")
}).describe("\u9879\u76EE\u4FE1\u606F\u7684\u7ED3\u6784\u5316\u63CF\u8FF0");
function getLightspotSchemaForm(item = z5.string()) {
  return z5.object({
    team: z5.array(item).describe("\u56E2\u961F\u8D21\u732E\u65B9\u9762\u7684\u4EAE\u70B9"),
    skill: z5.array(item).describe("\u6280\u672F\u4EAE\u70B9/\u96BE\u70B9\u65B9\u9762\u7684\u4EAE\u70B9"),
    user: z5.array(item).describe("\u7528\u6237\u4F53\u9A8C/\u4E1A\u52A1\u4EF7\u503C\u65B9\u9762\u7684\u4EAE\u70B9")
  }).describe("\u9879\u76EE\u4EAE\u70B9\u7684\u7ED3\u6784\u5316\u63CF\u8FF0");
}
var projectSchemaForm = z5.object({
  info: infoSchemaForm,
  lightspot: getLightspotSchemaForm()
});

// src/types/resume.ts
var ResumeStatus = /* @__PURE__ */ ((ResumeStatus2) => {
  ResumeStatus2["committed"] = "committed";
  ResumeStatus2["matched"] = "matched";
  return ResumeStatus2;
})(ResumeStatus || {});

// src/types/resume.schema.ts
import { z as z7 } from "zod";

// src/types/skill.schema.ts
import { z as z6 } from "zod";
var skillItemSchema = z6.object({
  type: z6.string().default(""),
  content: z6.array(z6.string()).default([])
});
var skillSchema = z6.object({
  content: z6.array(skillItemSchema)
});

// src/types/resume.schema.ts
var resumeMatchedSchema = z7.object({
  name: z7.string().describe("\u7B80\u5386\u540D\u79F0"),
  skill: skillSchema.describe("\u4E13\u4E1A\u6280\u80FD\u6E05\u5355"),
  projects: z7.array(projectSchema).describe("\u9879\u76EE\u7ECF\u9A8C\u5217\u8868")
});

// src/types/sse.ts
var RequestTargetMap = {
  polish: "/sse/project-generate",
  //类型占位符
  mine: "/sse/project-generate",
  lookup: "/sse/project-generate"
};

// src/utils/jsonMd_obj.ts
function jsonMd_obj(content) {
  let jsonMd = content.match(/(?<=```json)(.*)(?=```)/gs)?.[0];
  if (!jsonMd) {
    console.error(`jsonMd_obj\u6CA1\u627E\u5230json\u5185\u5BB9\u5757,\u8F93\u5165: ${content}`);
    return;
  }
  let obj;
  try {
    obj = JSON.parse(jsonMd);
  } catch (error) {
    console.error("jsonMd_obj JSON parsing error:", error);
    console.error("jsonMd_obj when parsing:", jsonMd);
  }
  return obj;
}

// src/utils/md_json.ts
function markdownToProjectSchema(markdown) {
  const result = {
    info: {
      name: "",
      desc: {
        role: "",
        contribute: "",
        bgAndTarget: ""
      },
      techStack: []
    },
    lightspot: {
      team: [],
      skill: [],
      user: []
    }
  };
  markdown = markdown.replace("<br />", "").replace(/^\s*>\s*(.+?)$/gm, "");
  const nameMatch = markdown.match(/名称：(.+?)(?:\n|$)/);
  if (nameMatch && nameMatch[1]) {
    result.info.name = nameMatch[1].trim();
  }
  const roleMatch = markdown.match(/角色和职责：(.+?)(?:\n|$)/);
  if (roleMatch && roleMatch[1]) {
    result.info.desc.role = roleMatch[1].trim();
  }
  const contributeMatch = markdown.match(/核心贡献和参与程度：(.+?)(?:\n|$)/);
  if (contributeMatch && contributeMatch[1]) {
    result.info.desc.contribute = contributeMatch[1].trim();
  }
  const bgMatch = markdown.match(/背景和目的：(.+?)(?:\n|$)/);
  if (bgMatch && bgMatch[1]) {
    result.info.desc.bgAndTarget = bgMatch[1].trim();
  }
  const techStackSection = markdown.match(/#### 1\.3 项目技术栈\s*?\n([\s\S]*?)(?=\n###|$)/);
  console.log("markdownToProjectSchema ~ techStackSection:", techStackSection);
  if (techStackSection && techStackSection[1]) {
    const techStackText = techStackSection[1].trim();
    result.info.techStack = techStackText.split(/[、,，\s]+/).filter(Boolean);
  }
  const teamSection = markdown.match(/#### 2\.1 团队贡献\s*([\s\S]*?)(?=\n####|$)/);
  if (teamSection && teamSection[1]) {
    const teamPoints = teamSection[1].match(/^\s*\*\s*(.+?)$/gm);
    if (teamPoints) {
      result.lightspot.team = teamPoints.map(
        (point) => point.replace("<br />", "").replace(/^\s*\*\s*/, "").trim()
      );
    }
  }
  const skillSection = markdown.match(/#### 2\.2 技术亮点\/难点\s*([\s\S]*?)(?=\n####|$)/);
  if (skillSection && skillSection[1]) {
    const skillPoints = skillSection[1].match(/^\s*\*\s*(.+?)$/gm);
    if (skillPoints) {
      result.lightspot.skill = skillPoints.map(
        (point) => point.replace("<br />", "").replace(/^\s*\*\s*/, "").trim()
      );
    }
  }
  const userSection = markdown.match(/#### 2\.3 用户体验\/业务价值\s*([\s\S]*?)(?=\n####|$)/);
  if (userSection && userSection[1]) {
    const userPoints = userSection[1].match(/^\s*\*\s*(.+?)$/gm);
    if (userPoints) {
      result.lightspot.user = userPoints.map(
        (point) => point.replace("<br />", "").replace(/^\s*\*\s*/, "").trim()
      );
    }
  }
  return result;
}
function projectSchemaToMarkdown(project) {
  let markdown = `### 1\u3001\u9879\u76EE\u4FE1\u606F

`;
  markdown += `#### 1.1 \u57FA\u672C\u4FE1\u606F

`;
  markdown += `* \u540D\u79F0\uFF1A${project.info.name}

`;
  markdown += `#### 1.2 \u9879\u76EE\u4ECB\u7ECD

`;
  markdown += `* \u89D2\u8272\u548C\u804C\u8D23\uFF1A${project.info.desc.role}
`;
  markdown += `* \u6838\u5FC3\u8D21\u732E\u548C\u53C2\u4E0E\u7A0B\u5EA6\uFF1A${project.info.desc.contribute}
`;
  markdown += `* \u80CC\u666F\u548C\u76EE\u7684\uFF1A${project.info.desc.bgAndTarget}

`;
  markdown += `#### 1.3 \u9879\u76EE\u6280\u672F\u6808

`;
  markdown += `${project.info.techStack.join("\u3001")}

`;
  markdown += `### 2\u3001\u4EAE\u70B9

`;
  markdown += `#### 2.1 \u56E2\u961F\u8D21\u732E
`;
  project.lightspot.team.forEach((item) => {
    markdown += `  * ${item}
`;
  });
  markdown += `#### 2.2 \u6280\u672F\u4EAE\u70B9/\u96BE\u70B9
`;
  project.lightspot.skill.forEach((item) => {
    markdown += `  * ${item}
`;
  });
  markdown += `#### 2.3 \u7528\u6237\u4F53\u9A8C/\u4E1A\u52A1\u4EF7\u503C
`;
  project.lightspot.user.forEach((item) => {
    markdown += `  * ${item}
`;
  });
  return markdown;
}
var skillsToMarkdown = (data) => {
  let markdown = "## \u804C\u4E1A\u6280\u80FD\n\n";
  data.content.forEach((skillGroup) => {
    if (skillGroup.type) {
      markdown += `* ${skillGroup.type}:`;
      if (skillGroup.content && skillGroup.content.length > 0) {
        markdown += ` ${skillGroup.content.join("\u3001")}
`;
      } else {
        markdown += "\n";
      }
    }
  });
  return markdown;
};
var markdownToSkills = (markdown) => {
  const content = [];
  const skillBlockRegex = /\*\s*([^*]+?)(?=\*|$)/gs;
  const matches = markdown.matchAll(skillBlockRegex);
  for (const match of matches) {
    const blockContent = match[1];
    if (!blockContent) continue;
    const cleanedContent = blockContent.replace(/\n+/g, "").trim();
    const colonMatch = cleanedContent.match(/^([^:：]+)[：:](.*)$/);
    if (colonMatch) {
      const type = colonMatch[1].trim();
      const skillsString = colonMatch[2].trim();
      if (type) {
        const skills = skillsString ? skillsString.split(/[、，,]/).map((skill) => skill.trim()).filter((skill) => skill.length > 0) : [];
        content.push({
          type,
          content: skills
        });
      }
    }
  }
  if (content.length === 0) {
    return {
      name: "",
      content: [
        { type: "\u524D\u7AEF", content: [] },
        { type: "\u540E\u7AEF", content: [] },
        { type: "\u6570\u636E\u5E93", content: [] }
      ]
    };
  }
  return { name: "", content };
};
export {
  ErrorCode,
  FileTypeEnum,
  JobOpenStatus,
  JobStatus,
  KnowledgeTypeEnum,
  ProjectStatus,
  RequestTargetMap,
  ResumeStatus,
  errorMessage,
  getLightspotSchema,
  hjmRerankSchema,
  jsonMd_obj,
  loginformSchema,
  lookupResultSchema,
  markdownToProjectSchema,
  markdownToSkills,
  projectLookupedSchema,
  projectMinedSchema,
  projectPolishedSchema,
  projectSchema,
  projectSchemaForm,
  projectSchemaToMarkdown,
  registformSchema,
  resumeMatchedSchema,
  roadFromDiffSchema,
  skillItemSchema,
  skillSchema,
  skillsToMarkdown,
  type_content_Map
};
//! crepe编辑器中无序列表项 - 会转为 *: 统一用*,且会跟<br />
//# sourceMappingURL=index.mjs.map