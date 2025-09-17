import { useTheme } from '../../utils/theme';
import { CallToAction } from './components/CallToAction';
import { Faqs } from './components/Faqs';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PrimaryFeatures } from './components/PrimaryFeatures';
import { SecondaryFeatures } from './components/SecondaryFeatures';

export default function LandingPage() {
	const { setTheme } = useTheme();
	setTheme('light');
	return (
		<>
			<Header />
			{/* 避免浏览器暗色模式下，页面背景色为黑色导致文字模糊不清 */}
			<main className="bg-white">
				<Hero />
				<PrimaryFeatures />
				<SecondaryFeatures />
				<CallToAction />
				{/* <Testimonials /> */}
				{/* <Pricing /> */}
				<Faqs />
			</main>
			<Footer />
		</>
	);
}
