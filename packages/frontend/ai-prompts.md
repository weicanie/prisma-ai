# Prism

组件：实现一个动画组件，初始时展示一个三角形状的棱镜，点击或者传入的参数light==true时棱镜左方出现一条光线，穿过棱镜后在棱镜的另一端形成七彩的光线。最终效果应该和图片中的一致。光线的行为应该符合现实棱镜的物理光学.

滤镜：脏玻璃滤镜如果是纯色背景，应该如何修改滤镜使之呈现脏玻璃般的模糊效果.

# Wall

利用grid布局实现图片中的这种线条。

# ProjectCard

1、
完成ProjectCard组件,这个组件是一张卡片，接收ProjectCardProps并将其渲染成一张卡片。卡片分为上中下三部分，其中使用AnimatedCircularProgressBar组件在卡片的上部分渲染score，score处于0<del>100之间，低于60时gaugePrimaryColor为红色，60</del>80为黄色，80~100为绿色。卡片的中部分渲染项目名称和创建与更新时间。卡片的下部分渲染两个列表，先是problem，然后是solution。其中problem列表项的有边应该是红色的'x'icon，而solution列表项的右边应该是向右的绿色箭头icon。
整个组件应该清晰、美观，并带有良好的中文注释。

2、
这是带动画的AnimatedCircularProgressBar示例

import { useEffect, useState } from "react";

import { AnimatedCircularProgressBar } from "@/components/magicui/animated-circular-progress-bar";

export function AnimatedCircularProgressBarDemo() {
const [value, setValue] = useState(0);

useEffect(() => {
const handleIncrement = (prev: number) => {
if (prev === 100) {
return 0;
}
return prev + 10;
};
setValue(handleIncrement);
const interval = setInterval(() => setValue(handleIncrement), 2000);
return () => clearInterval(interval);
}, []);

return (
<AnimatedCircularProgressBar max={100} min={0} value={value} gaugePrimaryColor="rgb(79 70 229)" gaugeSecondaryColor="rgba(0, 0, 0, 0.1)" />
);
}

1、把原来的AnimatedCircularProgressBar改成带动画从0到score
2、把x换成CircleAlert icon -> 换成ArrowRight icon，注意颜色要正确
