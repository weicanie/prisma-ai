import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  jsonMd_obj,
  lookupResultSchema,
  projectLookupedDto,
  projectMinedSchema,
  projectPolishedSchema,
  projectSchema,
  ProjectStatus,
  ProjectVo,
  StreamingChunk,
  UserInfoFromToken,
} from '@prism-ai/shared';
import { Model } from 'mongoose';
import { from, mergeMap, Observable } from 'rxjs';
import { ZodSchema } from 'zod';
import { ChainService } from '../../chain/chain.service';
import { EventBusService, EventList } from '../../EventBus/event-bus.service';
import { LLMSseService, redisStoreResult } from '../sse/llm-sse.service';
import { RedisService } from './../../redis/redis.service';
import { ProjectDto } from './dto/project.dto';
import { Project, ProjectDocument } from './entities/project.entity';
import {
  ProjectMined,
  ProjectMinedDocument,
} from './entities/projectMined.entity';
import {
  ProjectPolished,
  ProjectPolishedDocument,
} from './entities/projectPolished.entity';

//FIXME 用validation pipe 结合 zodSchema生成的 dto验证用户上传的数据格式
// 其它用于验证llm生成的数据格式和指定数据格式

export interface DeepSeekStreamChunk {
  id: string;
  content: string | ''; //生成内容
  additional_kwargs: {
    reasoning_content: string | null; //推理内容
  };
  tool_calls: [];
  tool_call_chunks: [];
  invalid_tool_calls: [];
}

interface DeepSeekStreamChunkEnd {
  id: string;
  content: '';
  additional_kwargs: {
    reasoning_content: null;
  };
  response_metadata: {
    /* token消耗详情 */
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
      prompt_tokens_details: {
        cached_tokens: number;
      };
      completion_tokens_details: {
        reasoning_tokens: number;
      };
    };
  };
  tool_calls: [];
  tool_call_chunks: [];
  invalid_tool_calls: [];
}
@Injectable()
export class ProjectService {
  @InjectModel(Project.name)
  private projectModel: Model<ProjectDocument>;

  @InjectModel(ProjectPolished.name)
  private projectPolishedModel: Model<ProjectPolishedDocument>;

  @InjectModel(ProjectMined.name)
  private projectMinedModel: Model<ProjectMinedDocument>;

  logger = new Logger(ProjectService.name);

  public methodKeys = {
    polishProject: 'polishProject',
    mineProject: 'mineProject',
    lookupProject: 'lookupProject',
    matchProject: 'matchProject',
  };

  constructor(
    public chainService: ChainService,
    public eventBusService: EventBusService,
    public redisService: RedisService,
    /* CARP原则：通过聚合增加响应流式数据功能*/
    @Inject(forwardRef(() => LLMSseService))
    public LLMSseService: LLMSseService,
  ) {}

  /**
   * @param sessionId 会话id,用于找到任务
   */
  async SseLookupResult(
    sessionId: string,
    userInfo: UserInfoFromToken,
    recover: boolean,
  ) {
    if (recover) {
      return this.LLMSseService.handleSseRequestAndResponseRecover(
        sessionId,
        userInfo,
      );
    }
    return this.LLMSseService.handleSseRequestAndResponse(
      sessionId,
      userInfo,
      this.methodKeys.lookupProject,
    );
  }

  /**
   * @param sessionId 会话id,用于找到任务
   */
  async SsePolishResult(
    sessionId: string,
    userInfo: UserInfoFromToken,
    recover: boolean,
  ) {
    if (recover) {
      return this.LLMSseService.handleSseRequestAndResponseRecover(
        sessionId,
        userInfo,
      );
    }
    return this.LLMSseService.handleSseRequestAndResponse(
      sessionId,
      userInfo,
      this.methodKeys.polishProject,
    );
  }

  /**
   * @param sessionId 会话id,用于找到任务
   */
  async SseMineResult(
    sessionId: string,
    userInfo: UserInfoFromToken,
    recover: boolean,
  ) {
    if (recover) {
      return this.LLMSseService.handleSseRequestAndResponseRecover(
        sessionId,
        userInfo,
      );
    }
    return this.LLMSseService.handleSseRequestAndResponse(
      sessionId,
      userInfo,
      this.methodKeys.mineProject,
    );
  }

  /**
   * 在生成任务结束时检查、储存结果到数据库
   * @param schema 验证用的 zod schema
   * @param model 存储用的 mongoose 模型
   * @param userInfo 用户信息
   * @param status 结果应处于的状态
   * @param statusMerged 合并后的结果应处于的状态
   * @param inputSchema 输入数据的 zod schema
   * @param existingProjectId 已存在的项目ID
   * @returns 返回一个处理函数，接收redis存储的结果将其存储到数据库
   */
  private async resultHandlerCreater(
    schema: ZodSchema,
    model: typeof Model,
    userInfo: UserInfoFromToken,
    status: `${ProjectStatus}`,
    statusMerged: `${ProjectStatus}`,
    inputSchema = projectSchema,
    existingProjectId: ProjectDocument,
  ) {
    //格式验证及修复、数据库存储
    return async (resultRedis: redisStoreResult) => {
      let results = jsonMd_obj(resultRedis.content); //[合并前,合并后]

      let result = results[0];
      const validationResult = schema.safeParse(result);
      if (!validationResult.success) {
        const errorMessage = JSON.stringify(validationResult.error.format());
        const fomartFixChain = await this.chainService.fomartFixChain(
          schema,
          errorMessage,
        );
        const projectPolishedStr = JSON.stringify(result);
        result = await fomartFixChain.invoke({ input: projectPolishedStr });
      }

      const resultSave = { ...result, status, userInfo };
      const resultSave_model = new model(resultSave);

      let resultAfterMerge: ProjectDto = results[1];
      const inputValidationResult = inputSchema.safeParse(resultAfterMerge);
      if (!inputValidationResult.success) {
        const errorMessage = JSON.stringify(
          inputValidationResult.error.format(),
        );
        const fomartFixChain = await this.chainService.fomartFixChain(
          inputSchema,
          errorMessage,
        );
        const projectPolishedStr = JSON.stringify(resultAfterMerge);
        resultAfterMerge = await fomartFixChain.invoke({
          input: projectPolishedStr,
        });
      }
      /* 更新项目,包括评分 */
      //先删除原评分然后保存、返回, 异步更新评分-这样可以大大减少用户等待时间-但分析结果无法保证能用于下一次优化,比如mine
      const resultSaveAfterMerge = {
        ...resultAfterMerge,
        status: statusMerged,
      };
      await this.projectModel.updateOne(
        { _id: existingProjectId.id },
        {
          $set: {
            status: statusMerged,
            info: resultAfterMerge.info,
            lightspot: resultAfterMerge.lightspot,
            lookupResult: null,
          },
        },
      );

      this.updateProject(existingProjectId.id, resultSaveAfterMerge, userInfo);
      await resultSave_model.save();
    };
  }

  /**
   * 项目经验文本转换为json格式对象并提交
   * @param projectText 项目经验文本
   * @returns
   */
  async transformAndCheckProject(
    projectText: string,
    userInfo: UserInfoFromToken,
  ): Promise<Omit<ProjectVo, 'lookupResult'>> {
    const chain = await this.chainService.tansformChain();
    const project = await chain.invoke({ input: projectText });

    return await this.checkoutProject(project, userInfo);
  }

  /**
   * 验证项目数据格式
   * 	若通过验证则将数据储存到数据库
   * 	否则抛出错误
   */
  async checkoutProject(
    project: ProjectDto,
    userInfo: UserInfoFromToken,
  ): Promise<Omit<ProjectVo, 'lookupResult'>> {
    //保证用户的项目名称唯一
    const query = {
      'info.name': project.info.name,
    };
    const existingProject = await this.projectModel.findOne(query).exec();
    if (existingProject) {
      throw new Error(
        `项目名称为 ${project.info.name} 的项目经验已存在，请修改项目名称后重新提交。`,
      );
    }

    const zodSchema = projectSchema;
    const model = this.projectModel;
    const data = project;

    try {
      zodSchema.parse(project);
    } catch (error) {
      // const dataToSave = { ...data, status: ProjectStatus.refuse, userInfo };
      // await new model(dataToSave).save();

      // if (error instanceof ZodError) {
      // 	const errorMessage = JSON.stringify(error.format());
      // 	throw new Error(ErrorCode.FORMAT_ERROR + `${errorMessage}`);
      // }
      console.error('zod schema验证失败:', error);
      throw error;
    }

    const dataToSave = {
      ...project,
      status: ProjectStatus.committed,
      userInfo,
    };
    const newModel = new model(dataToSave);
    await newModel.save();
    return { ...newModel.toObject() } as Omit<ProjectVo, 'lookupResult'>;
  }

  /**
   * 分析项目经验存在的问题和解决方案
   */
  async lookupProject(
    project: ProjectDto,
    userInfo: UserInfoFromToken,
    taskId: string,
  ): Promise<Observable<StreamingChunk>> {
    this.eventBusService.once(EventList.taskCompleted, ({ task }) => {
      if (task.id !== taskId) {
        return; // 确保只接收当前任务的结果
      }
      //取出redis中的结果进行处理

      if (!task.resultKey) {
        this.logger.error(`${task.id}任务结果键不存在,数据库储存失败`);
      }

      this.redisService
        .get(task.resultKey!)
        .then((redisStoreResult) => {
          if (!redisStoreResult) {
            throw '任务结果不存在或已过期被清除';
          }
          return JSON.parse(redisStoreResult);
        })
        .then((result) => this._handleLookupResult(result, userInfo, project))
        .catch((error) => {
          this.logger.error(`任务${task.resultKey}处理结果失败: ${error}`);
        });
    });

    const chain = await this.chainService.lookupChain(true);
    const projectStr = JSON.stringify(project);
    const lookupStream = await chain.stream(projectStr);

    return from(lookupStream).pipe(
      mergeMap(async (chunk: DeepSeekStreamChunk) => {
        const done =
          !chunk.content && chunk.additional_kwargs.reasoning_content === null;
        const isReasoning = chunk.additional_kwargs.reasoning_content !== null;
        return {
          content: !isReasoning ? chunk.content : '',
          reasonContent: isReasoning
            ? chunk.additional_kwargs?.reasoning_content!
            : '',
          done,
          isReasoning,
        };
      }),
    );
  }

  /**
   *
   * @param resultRedis SSE任务完成后从redis中取出的结果
   * @param userInfo 用户信息
   * @param project 用户输入项目信息
   */
  private async _handleLookupResult(
    resultRedis: redisStoreResult,
    userInfo: UserInfoFromToken,
    project: ProjectDto,
  ) {
    // 1. 从Redis结果中解析出LLM的输出内容
    let lookupResult = jsonMd_obj(resultRedis.content); // 从markdown代码块中提取json

    // 2. 使用Zod Schema验证解析出的JSON对象格式
    const validationResult = lookupResultSchema.safeParse(lookupResult);

    // 3. 如果验证失败,尝试使用LLM进行格式修复
    if (!validationResult.success) {
      const errorMessage = JSON.stringify(validationResult.error.format()); // 获取详细的Zod验证错误信息
      // 创建一个格式修复链
      const fomartFixChain = await this.chainService.fomartFixChain(
        lookupResultSchema,
        errorMessage,
      );
      const projectPolishedStr = JSON.stringify(lookupResult);
      // 调用链来修复格式
      lookupResult = await fomartFixChain.invoke({ input: projectPolishedStr });
    }

    // 4. 准备要存入数据库的数据
    const lookupResultSave = {
      ...lookupResult,
      userInfo,
      projectName: project.info.name,
    };

    // 5. 根据是否存在旧记录，执行更新或新建操作
    const updateOperation = {
      $set: { status: ProjectStatus.lookuped, lookupResult: lookupResultSave },
    };
    const query = {
      'info.name': project.info.name,
      'userInfo.userId': userInfo.userId,
    };

    await this.projectModel.updateOne(query, updateOperation);
  }

  /**
   * 项目经验 -> 打磨后的项目经验
   * @param project 项目经验
   * @param userInfo 用户信息
   * @param taskId 任务ID
   */
  async polishProject(
    project: projectLookupedDto,
    userInfo: UserInfoFromToken,
    taskId: string,
  ): Promise<Observable<StreamingChunk>> {
    const existingPolishingProject = await this.projectPolishedModel
      .findOne({
        'info.name': project.info.name,
        'userInfo.userId': userInfo.userId,
      })
      .exec();

    const existingProject: ProjectDocument | null = await this.projectModel
      .findOne({
        'info.name': project.info.name,
        'userInfo.userId': userInfo.userId,
      })
      .exec();

    if (existingPolishingProject) {
      return from(
        Promise.resolve({
          content: `\`\`\`json\n[${JSON.stringify(existingPolishingProject)},${JSON.stringify(existingProject)}]\n\`\`\``, //与llm返回格式保持一致,前端统一解析
          done: true,
          isReasoning: false,
        }),
      );
    }

    const resultHandler = await this.resultHandlerCreater(
      projectPolishedSchema,
      this.projectPolishedModel,
      userInfo,
      ProjectStatus.polishing,
      ProjectStatus.polished,
      projectSchema,
      existingProject!,
    );

    this.eventBusService.once(EventList.taskCompleted, ({ task }) => {
      if (task.id !== taskId) {
        return; // 确保只接收当前任务的结果
      }
      //取出redis中的结果进行处理

      if (!task.resultKey) {
        this.logger.error(`${task.id}任务结果键不存在,数据库储存失败`);
      }

      this.redisService
        .get(task.resultKey!)
        .then((redisStoreResult) => {
          if (!redisStoreResult) {
            throw '任务结果不存在或已过期被清除';
          }
          return JSON.parse(redisStoreResult);
        })
        .then((result) => resultHandler(result))
        .catch((error) => {
          this.logger.error(`任务${task.resultKey}处理结果失败: ${error}`);
        });
    });

    const chain = await this.chainService.polishChain(true);
    const projectStr = JSON.stringify(project);
    let projectPolished = await chain.stream(projectStr);
    return from(projectPolished).pipe(
      mergeMap(async (chunk: DeepSeekStreamChunk) => {
        const done =
          !chunk.content && chunk.additional_kwargs.reasoning_content === null;
        const isReasoning = chunk.additional_kwargs.reasoning_content !== null;
        return {
          content: !isReasoning ? chunk.content : '',
          reasonContent: isReasoning
            ? chunk.additional_kwargs?.reasoning_content!
            : '',
          done,
          isReasoning,
        };
      }),
    );
  }

  /**
   * 项目经验 -> 挖掘后的项目经验
   * @param project 项目经验
   * @param userInfo 用户信息
   * @param taskId 任务ID
   */
  async mineProject(
    project: ProjectDto,
    userInfo: UserInfoFromToken,
    taskId: string,
  ): Promise<Observable<StreamingChunk>> {
    const existingMiningProject = await this.projectMinedModel
      .findOne({
        'info.name': project.info.name,
        'userInfo.userId': userInfo.userId,
      })
      .exec();

    const existingProject = await this.projectModel
      .findOne({
        'info.name': project.info.name,
        'userInfo.userId': userInfo.userId,
      })
      .exec();

    if (existingMiningProject) {
      return from(
        Promise.resolve({
          content: `\`\`\`json\n[${JSON.stringify(existingProject)},${JSON.stringify(existingMiningProject)}]\n\`\`\``, //与llm返回格式保持一致,前端统一解析
          done: true,
          isReasoning: false,
        }),
      );
    }

    const resultHandler = await this.resultHandlerCreater(
      projectMinedSchema,
      this.projectMinedModel,
      userInfo,
      ProjectStatus.mining,
      ProjectStatus.mined,
      projectSchema,
      existingProject!,
    );

    this.eventBusService.once(EventList.taskCompleted, ({ task }) => {
      if (task.id !== taskId) {
        return; // 确保只接收当前任务的结果
      }
      //取出redis中的结果进行处理

      if (!task.resultKey) {
        this.logger.error(`${task.id}任务结果键不存在,数据库储存失败`);
      }

      this.redisService
        .get(task.resultKey!)
        .then((redisStoreResult) => {
          if (!redisStoreResult) {
            throw '任务结果不存在或已过期被清除';
          }
          return JSON.parse(redisStoreResult);
        })
        .then((result) => resultHandler(result))
        .catch((error) => {
          this.logger.error(`任务${task.resultKey}处理结果失败: ${error}`);
        });
    });

    const chain = await this.chainService.mineChain(true);
    const projectStr = JSON.stringify(project);
    let projectMined = await chain.stream(projectStr);
    return from(projectMined).pipe(
      mergeMap(async (chunk: DeepSeekStreamChunk) => {
        const done =
          !chunk.content && chunk.additional_kwargs.reasoning_content === null;
        const isReasoning = chunk.additional_kwargs.reasoning_content !== null;
        return {
          content: !isReasoning ? chunk.content : '',
          reasonContent: isReasoning
            ? chunk.additional_kwargs?.reasoning_content!
            : '',
          done,
          isReasoning,
        };
      }),
    );
  }

  async findAllProjects(userInfo: UserInfoFromToken): Promise<ProjectVo[]> {
    //并行查询
    const projects = await this.projectModel
      .find({ 'userInfo.userId': userInfo.userId })
      .exec();
    if (!projects || projects.length === 0) {
      return [];
    }
    return projects as ProjectVo[];
  }

  /**
   * 根据ID获取项目经验, 只查询 projectModel
   * @param id 项目ID
   * @returns 查询结果
   */
  async findProjectById(
    id: string,
    userInfo: UserInfoFromToken,
  ): Promise<ProjectVo> {
    const query = { _id: id, 'userInfo.userId': userInfo.userId };
    const project = await this.projectModel.findOne(query).exec();

    if (!project) {
      throw new Error(`ID为${id}的项目经验不存在`);
    } else {
      return {
        ...project.toObject(),
      } as ProjectVo;
    }
  }

  /**
   * 获取指定状态的项目经验
   * @param status 项目状态
   * @param name 项目名称
   * @returns 查询结果
   */
  async findByNameAndStatus(
    name: string | undefined,
    status: `${ProjectStatus}`,
    userInfo: UserInfoFromToken,
  ): Promise<ProjectVo | undefined> {
    const query: any = { 'userInfo.userId': userInfo.userId, status };
    if (name) {
      query['info.name'] = { $regex: name, $options: 'i' }; // 不区分大小写
    }
    //projectPolishedModel里只有状态为polishing的项目
    //projectMinedModel里只有状态为mining的项目
    const promises = [
      this.projectMinedModel.findOne(query).exec(),
      this.projectPolishedModel.findOne(query).exec(),
      this.projectModel.findOne(query).exec(),
    ];

    const results = await Promise.allSettled(promises);
    const project = results.find(
      (result) => result.status === 'fulfilled' && result.value !== null,
    );
    if (!project) {
      throw new Error(`名为${name}状态为${status}的项目经验不存在`);
    } else if (project.status === 'fulfilled') {
      return {
        ...project.value?.toObject(),
      } as ProjectVo;
    }
  }

  /**
   * 非流式分析项目
   */
  private async lookupProjectUnStream(
    project: ProjectDocument,
    userInfo: UserInfoFromToken,
  ) {
    const chain = await this.chainService.lookupChain();
    const projectStr = JSON.stringify(project);
    //TODO 这里只消费lookupResult,但使用了更多的prompt
    let [result] = await chain.invoke(projectStr);
    let lookupResult = { ...result, userInfo, projectName: project.info.name };
    // 格式验证
    const validationResult = lookupResultSchema.safeParse(lookupResult);
    if (!validationResult.success) {
      const errorMessage = JSON.stringify(validationResult.error.format());
      const fomartFixChain = await this.chainService.fomartFixChain(
        lookupResultSchema,
        errorMessage,
      );
      const lookupResultStr = JSON.stringify(lookupResult);
      lookupResult = await fomartFixChain.invoke({ input: lookupResultStr });
    }
    const existingProject = await this.projectModel
      .findOne({
        'userInfo.userId': userInfo.userId,
        'info.name': project.info.name,
      })
      .exec();
    const existingLookupResult = existingProject?.lookupResult;

    const lookupResultSave = {
      ...lookupResult,
      userInfo,
      projectName: project.info.name,
    };
    if (existingLookupResult) {
      // 更新
      await this.projectModel.updateOne(
        { 'info.name': project.info.name, 'userInfo.userId': userInfo.userId },
        {
          $set: {
            lookupResult: lookupResultSave,
            status:
              existingProject.status === ProjectStatus.committed
                ? ProjectStatus.lookuped
                : existingProject.status,
          },
        },
      );
    } else {
      await this.projectModel.updateOne(
        { 'info.name': project.info.name, 'userInfo.userId': userInfo.userId },
        {
          $set: {
            lookupResult: lookupResultSave,
            status: existingProject
              ? existingProject.status === ProjectStatus.committed
                ? ProjectStatus.lookuped
                : existingProject.status
              : ProjectStatus.lookuped,
          },
        },
      );
    }
  }

  /**
   * 更新项目经验
   */
  async updateProject(
    id: string,
    updateProjectDto: Partial<ProjectDto>,
    userInfo: UserInfoFromToken,
  ): Promise<ProjectVo> {
    const existingProject = await this.projectModel
      .findOneAndUpdate(
        { _id: id, 'userInfo.userId': userInfo.userId },
        { $set: updateProjectDto },
        { new: true },
      )
      .exec();
    if (!existingProject) {
      throw new Error(
        `Project with ID "${id}" not found or user unauthorized.`,
      );
    }

    const lookupResult = await this.lookupProjectUnStream(
      existingProject,
      userInfo,
    );

    return { ...existingProject, lookupResult } as ProjectVo;
  }

  /**
   * 删除项目经验
   */
  async deleteProject(
    id: string,
    userInfo: UserInfoFromToken,
  ): Promise<{ deleted: boolean; id?: string }> {
    const result = await this.projectModel
      .deleteOne({ _id: id, 'userInfo.userId': userInfo.userId })
      .exec();
    if (result.deletedCount === 0) {
      throw new Error(
        `Project with ID "${id}" not found or user unauthorized.`,
      );
    }
    //TODO 删除相关的拷打、挖掘和打磨数据
    return { deleted: true, id };
  }

  /**
   * mcp tool 查询数据库
   * @param query 查询语句
   * @returns 查询结果
   */
  async toolQuery(query: string) {
    try {
      if (!query || typeof query !== 'string') {
        return {
          code: '查询语句不能为空',
          message: '查询语句不能为空',
          data: null,
        };
      }

      const chain = await this.chainService.queryChain();
      const result = await chain.invoke(query);
      return {
        code: 0,
        message: '查询成功',
        data: result,
      };
    } catch (error) {
      console.error('查询数据库失败:', error);
      return {
        code: '查询数据库失败',
        message: `查询数据库失败: ${error instanceof Error ? error.message : String(error)}`,
        data: null,
      };
    }
  }

  /**
   * 更新项目的分析结果
   * @param id 项目ID
   * @param lookupResult 分析结果
   * @param userInfo 用户信息
   */
  async updateLookupResult(
    id: string,
    lookupResult: any,
    userInfo: UserInfoFromToken,
  ) {
    const updatedProject = await this.projectModel
      .findOneAndUpdate(
        { _id: id, 'userInfo.userId': userInfo.userId },
        { $set: { lookupResult, status: ProjectStatus.lookuped } },
        { new: true },
      )
      .exec();

    if (!updatedProject) {
      throw new Error(
        `Project with ID "${id}" not found or user unauthorized.`,
      );
    }
    return updatedProject;
  }
}
