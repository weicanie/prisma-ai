import { ObjectId } from 'mongoose';

/* 一对多
一个用户可以有多个聊天会话
*/
interface DialogueLLM {
  userId: string;
  key: string; //每个聊天会话的唯一标识（uuid）用于数组中固定位置,因为labelname可能会重复
  labelname: string;

  createTime: Date;
  updateTime: Date;
}
/* 一对一、一对多
一个会话对应一个聊天历史
一个聊天历史对应多个消息
*/
interface ChatHistoryLLM {
  dialogueId: ObjectId; // 引用DialogueLLM的_id

  createTime: Date;
  updateTime: Date;
}

interface MessageLLM {
  chatHistoryId: ObjectId; // 引用ChatHistoryLLM的_id
}
