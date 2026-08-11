export const PDF_TECHNOLOGY_STACKS = [
	'Java', 'JVM', '并发编程', 'Spring', 'Spring Boot', 'Spring Cloud', 'MyBatis', 'MySQL', 'Redis',
	'MongoDB', 'Elasticsearch', 'Kafka', 'RabbitMQ', 'RocketMQ', '消息队列', '分布式', '计算机网络',
	'操作系统', '数据结构与算法', '设计模式', 'Docker', 'Kubernetes', 'Linux', 'Nginx', 'Maven',
	'Tomcat', 'Netty', 'Dubbo', 'Zookeeper', '其他'
] as const;

export type PdfTechnologyStack = (typeof PDF_TECHNOLOGY_STACKS)[number];

const STACK_ALIASES: Array<[PdfTechnologyStack, RegExp]> = [
	['MySQL', /mysql|innodb|索引|事务|binlog/i], ['Redis', /redis|缓存/i], ['Java', /java\b/i],
	['JVM', /jvm|虚拟机|gc|垃圾回收/i], ['并发编程', /并发|线程|锁|juc|cas/i],
	['Spring Boot', /spring\s*boot/i], ['Spring Cloud', /spring\s*cloud/i], ['Spring', /spring/i],
	['消息队列', /消息队列|mq/i], ['Kafka', /kafka/i], ['RabbitMQ', /rabbitmq/i], ['RocketMQ', /rocketmq/i],
	['计算机网络', /tcp|udp|http|https|dns|网络/i], ['操作系统', /操作系统|进程|内存|文件系统/i],
	['数据结构与算法', /算法|数据结构|排序|链表|树|图/i], ['Linux', /linux|shell/i], ['Docker', /docker/i]
];

export function normalizePdfTechnologyStack(value: string, question = ''): PdfTechnologyStack {
	const input = `${value}\n${question}`;
	return STACK_ALIASES.find(([, pattern]) => pattern.test(input))?.[0] ?? '其他';
}

export function normalizePdfTechnologyPoint(value: string, stack: PdfTechnologyStack) {
	const point = value.replace(new RegExp(stack, 'ig'), '').replace(/[：:，,。？?]/g, '').trim();
	if (!point || point.length > 24 || /什么|为什么|如何|怎么/.test(point)) return '综合';
	return point;
}
