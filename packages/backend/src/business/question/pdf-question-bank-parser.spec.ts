import { isPdfInterviewQuestionTitle, normalizePdfQuestionTitle, splitPdfQuestions } from './pdf-question-bank-parser';

describe('PDF question bank parser', () => {
	it('keeps interview questions and rejects answer prose', () => {
		expect(isPdfInterviewQuestionTitle('MySQL 索引为什么需要回表？')).toBe(true);
		expect(isPdfInterviewQuestionTitle('RocketMQ 延时消息的底层原理')).toBe(true);
		expect(isPdfInterviewQuestionTitle('然后，我们进入 /var/lib/mysql/my_test 目录。')).toBe(false);
		expect(isPdfInterviewQuestionTitle('在 MySQL 的数据目录下，可以看到对应文件。')).toBe(false);
	});

	it('does not use numbered answer lines as titles', () => {
		const result = splitPdfQuestions('1. MySQL 的事务隔离级别有哪些？\n事务隔离用于处理并发访问。\n\n2. 然后进入 /var/lib/mysql 目录。\n这里保存数据文件。', 'mysql.pdf');
		expect(result.questions).toHaveLength(1);
		expect(result.questions[0].title).toContain('事务隔离级别');
	});

	it('uses one stable key for punctuation variants', () => {
		expect(normalizePdfQuestionTitle('MySQL 索引是什么？')).toBe(normalizePdfQuestionTitle('MySQL 索引是什么'));
	});
});
