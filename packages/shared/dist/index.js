"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ErrorCode: () => ErrorCode,
  errorMessage: () => errorMessage,
  loginformSchema: () => loginformSchema,
  projectMinedSchema: () => projectMinedSchema,
  projectPolishedSchema: () => projectPolishedSchema,
  projectSchema: () => projectSchema,
  registformSchema: () => registformSchema
});
module.exports = __toCommonJS(index_exports);

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
  ["3004" /* TOOL_CALL_ERROR */]: "\u8C03\u7528mcp\u5DE5\u5177\u5931\u8D25"
};

// src/types/login_regist.schema.ts
var import_zod = require("zod");
var loginformSchema = import_zod.z.object({
  username: import_zod.z.string().min(2, {
    message: "\u7528\u6237\u540D\u81F3\u5C11\u9700\u89812\u4E2A\u5B57\u7B26"
  }),
  password: import_zod.z.string().min(6, {
    message: "\u5BC6\u7801\u81F3\u5C11\u9700\u89816\u4E2A\u5B57\u7B26"
  })
});
var registformSchema = import_zod.z.object({
  username: import_zod.z.string().min(2, {
    message: "\u7528\u6237\u540D\u81F3\u5C11\u9700\u89812\u4E2A\u5B57\u7B26"
  }),
  password: import_zod.z.string().min(6, {
    message: "\u5BC6\u7801\u81F3\u5C11\u9700\u89816\u4E2A\u5B57\u7B26"
  }),
  confirmPassword: import_zod.z.string().min(6, {
    message: "\u8BF7\u518D\u6B21\u8F93\u5165\u5BC6\u7801"
  }),
  email: import_zod.z.string().email({
    message: "\u8BF7\u8F93\u5165\u6B63\u786E\u7684\u90AE\u7BB1\u5730\u5740"
  }),
  captcha: import_zod.z.string().min(6, {
    message: "\u8BF7\u8F93\u5165\u6B63\u786E\u7684\u9A8C\u8BC1\u7801"
  })
});

// src/types/project.schema.ts
var import_zod2 = require("zod");
var infoSchema = import_zod2.z.object({
  name: import_zod2.z.string().min(2).max(100).describe("\u9879\u76EE\u540D\u79F0"),
  desc: import_zod2.z.object({
    role: import_zod2.z.string().optional().describe("\u7528\u6237\u5728\u9879\u76EE\u4E2D\u7684\u89D2\u8272\u548C\u804C\u8D23"),
    contribute: import_zod2.z.string().optional().describe("\u7528\u6237\u7684\u6838\u5FC3\u8D21\u732E\u548C\u53C2\u4E0E\u7A0B\u5EA6"),
    bgAndTarget: import_zod2.z.string().optional().describe("\u9879\u76EE\u7684\u80CC\u666F\u548C\u76EE\u7684")
  }),
  techStack: import_zod2.z.array(import_zod2.z.string()).optional().default([]).describe("\u9879\u76EE\u7684\u6280\u672F\u6808")
}).describe("\u9879\u76EE\u4FE1\u606F\u7684\u7ED3\u6784\u5316\u63CF\u8FF0");
function getLightspotSchema(item = import_zod2.z.string()) {
  return import_zod2.z.object({
    team: import_zod2.z.array(item).default([]).describe("\u56E2\u961F\u8D21\u732E\u65B9\u9762\u7684\u4EAE\u70B9"),
    skill: import_zod2.z.array(item).default([]).describe("\u6280\u672F\u4EAE\u70B9/\u96BE\u70B9\u65B9\u9762\u7684\u4EAE\u70B9"),
    user: import_zod2.z.array(item).default([]).describe("\u7528\u6237\u4F53\u9A8C/\u4E1A\u52A1\u4EF7\u503C\u65B9\u9762\u7684\u4EAE\u70B9")
  }).describe("\u9879\u76EE\u4EAE\u70B9\u7684\u7ED3\u6784\u5316\u63CF\u8FF0");
}
var projectSchema = import_zod2.z.object({
  info: infoSchema,
  lightspot: getLightspotSchema()
});
var projectPolishedSchema = import_zod2.z.object({
  info: infoSchema,
  lightspot: getLightspotSchema(
    import_zod2.z.object({
      content: import_zod2.z.string().describe("\u4EAE\u70B9\u5185\u5BB9"),
      advice: import_zod2.z.string().default("NONE").describe("\u4EAE\u70B9\u6539\u8FDB\u5EFA\u8BAE")
    })
  )
});
var projectMinedSchema = import_zod2.z.object({
  info: infoSchema,
  lightspot: getLightspotSchema(),
  lightspotAdded: getLightspotSchema(
    import_zod2.z.object({
      content: import_zod2.z.string().describe("\u4EAE\u70B9\u5185\u5BB9"),
      reason: import_zod2.z.string().default("NONE").describe("\u4EAE\u70B9\u6DFB\u52A0\u539F\u56E0"),
      tech: import_zod2.z.array(import_zod2.z.string()).default([]).describe("\u6D89\u53CA\u6280\u672F")
    })
  )
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ErrorCode,
  errorMessage,
  loginformSchema,
  projectMinedSchema,
  projectPolishedSchema,
  projectSchema,
  registformSchema
});
//# sourceMappingURL=index.js.map