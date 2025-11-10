import { jobSeekDestinationT, UserMemoryT } from '../types/user_memory';
import { profileJsonToText, stringArrayToline } from './profile_json_to_text';

/**
 * 将求职偏好json转为md文本
 */
function jobPreferenceJsonToText(jobPreference: jobSeekDestinationT): string {
	const { jobType, jobName, industry, company, city } = jobPreference;
	return `
### 求职意向
#### 岗位
- 求职方向：${stringArrayToline(jobType)}
- 具体岗位：${stringArrayToline(jobName)}
#### 行业和公司
- 感兴趣的行业：${stringArrayToline(industry)}
- 感兴趣的公司：${stringArrayToline(company)}
#### 地域偏好
- 感兴趣的城市:${stringArrayToline(city)}
  `;
}
/**
 * 将用户记忆json转为md文本
 */
export function userMemoryJsonToText(userMemory: UserMemoryT) {
	const text = `
	## 用户信息
	${profileJsonToText(userMemory.userProfile, true)}
	${jobPreferenceJsonToText(userMemory.jobSeekDestination)}`;
	return text;
}
