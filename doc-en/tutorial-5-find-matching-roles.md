# Find Roles That Match You

The project provides an out-of-the-box job matching feature.
<br/>

First, it crawls a large volume of real job postings from a certain platform.
<br/>

Then, based on your resume, it finds roles that best fit you.

Open the Matching page in the client to use it.

## 0. Configure AI Models

On first use, configure the local AI models.

- Option 1: Build locally (takes time and disk space)

```
# Run in the prisma-ai directory
./scripts/model_setup.sh
```

- Option 2: Download model files from the QQ file group

> QQ file group: 1063068041. Follow the announcement to finish setup.

> Note: You need to configure the local SBERT model first to use it inside the container.

## 1. Crawl Job Data

The project includes a ready-to-use job crawler.
You only need to have the **Chrome browser** installed locally.
Just provide:

- Keywords: target job keywords
- City code: your target city
- Crawl count: number of jobs to crawl
  ![1751278046075](<image/教程：(四)获取匹配自己的岗位/1751278046075.png>)

How to get the city code?

### How to obtain the city code

1) Visit

[Target subdomain of a certain hiring site](https://m.zhipin.com/c101010100/?query=%E5%89%8D%E7%AB%AF)

2) Select the target city from the dropdown and navigate

3) The resulting URL will be `https://m.zhipin.com/<city-code>`

### Risks to Note

There is a risk of IP rate limiting. The author crawled nearly 2,000 entries with the initial crawler and
<br/>

the IP was limited for 1 day.
<br/>
With the current crawler, no such limit has been observed so far.
<br/>

This project doesn't include an IP proxy pool—implement it yourself if needed.
It doesn't automate human verification either; you may encounter manual verification (clicking a special button).

Of course, the project also supports manually inputting job data, then customizing and matching your resume to the roles.

## 2. Upload Job Data to the Knowledge Base

Ensure the local embedding model is configured before uploading.

![1751278235176](<image/教程：(四)获取匹配自己的岗位/1751278235176.png>)

Click Start Vectorization and wait patiently until the upload completes.

## 3. Match Roles

Enter:

- Recall count: how many matching roles to retrieve
- Re-rank count: how many top roles to select after re-ranking
  ![1751278415782](<image/教程：(四)获取匹配自己的岗位/1751278415782.png>)

Click Start Matching and wait—your matched roles will be displayed.
