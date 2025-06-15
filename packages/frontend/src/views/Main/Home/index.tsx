import Prism from '@/components/Prism';
import React, { useState } from 'react';

const Home: React.FC = () => {
    const [isPrismLit, setIsPrismLit] = useState(true);

    const features = [
        {
            emoji: '🚀',
            title: '项目经验优化',
            description: '只会罗列技术和业务？利用 AI 深度分析，挖掘您项目经验中的独特亮点，让您的履历脱颖而出！'
        },
        {
            emoji: '🎯',
            title: '定制简历与岗位匹配',
            description: '告别海投无门！AI 会根据具体岗位要求，为您量身定制简历。我们还内置招聘数据爬取功能，并通过智能模型为您精准匹配最合适的岗位。'
        },
        {
            emoji: '🧠',
            title: '智能八股刷题',
            description: '还在死记硬背面试题？我们能根据您的简历内容，智能推荐相关的"八股文"，并用科学记忆法帮您高效掌握，从容应对面试。(coming soon)'
        },
        {
            emoji: '🗺️',
            title: '面向Offer学习',
            description: '为您规划清晰的求职学习路线，并帮助您将项目中的想法和方案转化为代码，让您的能力真正落地。(coming soon)'
        }
    ];

    return (
        <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-200">
            <header className="text-center">
                <Prism light={isPrismLit} onClick={() => setIsPrismLit(!isPrismLit)} className="max-w-xl mx-auto" />
                <h1 className="text-4xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">欢迎来到 Prisma-AI! 👋</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    一站式解决您在求职路上的各种痛点，让您的才华不再被埋没。
                </p>
            </header>

            <main className="mt-16">
                <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">核心功能一览</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <h3 className="text-2xl font-semibold mb-3">
                                <span className="mr-3">{feature.emoji}</span>
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </main>

            <footer className="text-center mt-16">
                <p className="text-xl text-gray-700 dark:text-gray-300">
                    愿 Prisma-AI 成为您求职路上的神兵利器，助您斩获心仪的 Offer！🎉
                </p>
            </footer>
        </div>
    );
};

export default Home;
