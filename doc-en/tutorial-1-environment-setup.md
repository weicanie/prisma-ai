# Environment Setup in 5 Minutes

## Project Environment

You only need to configure the following environment variables in the [environment file](/packages/backend/.env.example):

<br/>

### 1. LLM and Pinecone

1) Register and log in to DeepSeek, then top up a small amount (a few RMB is enough):
<br/>
https://platform.deepseek.com/

```bash
API_KEY_DEEPSEEK = "your DeepSeek API key"
```

2) You can get an OpenAI API key for free during the beta:
<br/>
Apply for a free beta key from this repo:
https://github.com/chatanywhere/GPT_API_free

```bash
OPENAI_API_KEY = 'your OpenAI API key'
OPENAI_API_BASE_URL = "https://api.chatanywhere.tech"
```

3) Get a free official Gemini API key: see [Get Gemini Model](./tutorial-8-get-gemini-api-key.md).

```bash
GOOGLEAI_API_KEY = 'your Gemini API key'
```

<br/>

4) Register and log in to Pinecone: https://www.pinecone.io/
<br/>
Then create an API key:

```bash
PINECONE_API_KEY = 'your Pinecone API key'
```

<br/>
> [!note]
> In versions after `v5.0.2`, the above API keys can also be configured in the client's user settings page. Settings in the client will override those in environment variables.
> ![1760578441573](image/教程：1、环境配置/1760578441573.png)

### 2. Email Sending Service

If you don't need real email verification codes, you can skip this step.
Otherwise,
<br>

Using QQ Mail as an example, configure the mailbox and obtain the login credential code: [QQ Mail configuration and credential code](./email-sending-service-setup.md)

```bash
DIRECT_CAPTCHA = 'false'
EMAIL_PASS = 'QQ mail credential code'
EMAIL_FROM = 'your QQ email address'
EMAIL_HOST = 'smtp.qq.com'
EMAIL_PROT = 587

```

<br/>

### 3. JWT

If you don't plan to deploy publicly, you can use the following key pair directly:

```bash

# jwt (publicly exposed, DO NOT use on the public Internet!)
PUBLIC_KEY ="-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA5ovljZb25lqQK2EA0+lm9lX8H8FKpUTHpwwVva5J2wXwgB9x4NF4Ej1aM8ad1Ul1evY3vG8OynjB8s2jqeaeQHiJLzEmZ7L5b3hJ7IkVl5no/KzIGGFN+MgaAaliXTTps4Vaef8v+4/vk2FP0CW+wSOzQ64rsNx2wdP6r3Fa167ImTXTTT3bOCgFPZlxtAakaEl8IGaRMAqpkXNGBtub4FfrEQxe3jiRMk3+6tpBhoXLDHjqDFPwdA4u8aqthreaijCvHsY7TUZzFuPwx428WrWfScsEyhCSTpP3tEPLyspHVBR9IDBdx5X4FiIFtd4DB2mbGCywXDETGUYX4q6GawIDAQAB\n-----END PUBLIC KEY-----"

PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDmi+WNlvbmWpAr
YQDT6Wb2VfwfwUqlRMenDBW9rknbBfCAH3Hg0XgSPVozxp3VSXV69je8bw7KeMHy
zaOp5p5AeIkvMSZnsvlveEnsiRWXmej8rMgYYU34yBoBqWJdNOmzhVp5/y/7j++T
YU/QJb7BI7NDriuw3HbB0/qvcVrXrsiZNdNNPds4KAU9mXG0BqRoSXwgZpEwCqmR
c0YG25vgV+sRDF7eOJEyTf7q2kGGhcsMeOoMU/B0Di7xqq2Gt5qKMK8exjtNRnMW
4/DHjbxatZ9JywTKEJJOk/e0Q8vKykdUFH0gMF3HlfgWIgW13gMHaZsYLLBcMRMZ
RhfiroZrAgMBAAECggEACto5AxJBKxTGRpR5YoBRLXVcue3yYpc7QrzJ5TToGxxL
duyEAs45dbpXnapS0bB0jEY812zu6E8I6jIN6ziE6IoEAymwIh+FqF6kNDM7xfgj
xIkpniQudHCO8NcVX0fXXHEBkk6V5qSe5XQmOqkcMqFIlf4D5n5qRLOC0HFoklB8
EytG0ylBWV5PyM7TZ1ubN7wWRyWYCibX8qN1iU1gTgVb0NOlCj7GAIOlJjltLoK/
xFFfvdewrpINz0UJJzxeOAooqUn3gxykQRchs0iFYv+BsvW2ZWKgjw7bavrXkwCw
l/Z6nmlmq7KbXY54CpyG9kIPfbtmqlMrapE2xWbLAQKBgQD8oSgJNEvvg3kGkNeL
ePI+oxlUfsRqhprxiPBPSyo2Upg/Sc/rz7cvDhg4TkVO10nPbzZBYWdFWyoEzzJQ
lXyyzON4k0TN8JLbvcBXbneQMWrfcmg+OLxnCR2GXZ2znPA8NN4Ai5Lk7doAPVAk
D+vFEtL6w+1eJmRvzOSk+WxR6wKBgQDpn1EWp1X0cz0hbzeM7T3XQva658OTzfVP
2cJDwqu0GtiphbmY/Rg5dNCmAq9itzTSyBFHj4EptNYxKUmb5zqeWXFVysTTQffw
KU8umTalWuyW+bTQxDHm6473SQSl7PARNVzxLfbrhhCwDca2Uyp00w/NEt3Iuz+W
9LL+BWz9gQKBgQDWvbZmfIm/wqXxqtVNvTVNgR5a8JbNZjX28kwzWtU67+Jyia+v
5xTzbquv0PihF+ep6ALaeI1sKx4AkI9YaHljEz6Yk7Z8x+5N03HX4BLKAvexkHKD
0X50pw7t1E3lC5Y510aOeBYZewVABt5EiTQEhQfKGRmAWmotjqEcithEmQKBgQCt
xh+e5iF9jyptcDi1ztItCFZWeIZ1rsFGAAgMNwVZFo8KqbmAHuKh+k4o7d5fYz8b
ek3AGPJOf4DDWJ60JK7pkkZHNmhpa6xtK40GcFjBbnyFYIAquYUU6yqQrfOTKEb5
xeO4UiRU1IgdLGIexIXUGBqsw9fMs9t9Ac8SPB7yAQKBgQCQ7qG+ono3RvS7Voge
nAgI/9O3HOy8zWyP3565zNj/EEBSJi1d2L2O4nGmrrqfAy009oCKlHd+7WpFx/lj
i/gJrlUqz+CS7SMY02z8rSFgdUHm9RaOEIPE/jDPV5P6oI13AQcTg0onzB2SceiV
LC4uT3KJkA9LY3s4UvAIAKp0GA==\n-----END PRIVATE KEY-----"

```

If you need to generate your own key pair:
<br>

Run the following in the repository root:

```bash
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048
```

Then run:

```bash
openssl rsa -pubout -in private_key.pem -out public_key.pem
```

You will get the keys you need:

```bash
PUBLIC_KEY ="content of private_key.pem"

PRIVATE_KEY = "content of public_key.pem"
```

### Finally

Rename the [environment file](/packages/backend/.env.example) to `.env`.
Rename the [environment file 2](/packages/backend/.env.production.example) to `.env.production`.

## Other Environments

### 1. Docker

If you haven't installed `docker`, follow this guide to install it with zero failure: [Install Docker on Win/Linux/Mac in 1 minute](https://www.bilibili.com/video/BV1vm421T7Kw).

### 2. Git LFS

1)
Visit the Git LFS website: https://git-lfs.com/
Click the "Download" button to get the installer.
Run the downloaded .exe and follow the wizard to complete installation.

2)
After installation, enable Git LFS for your user account. This is a one-time operation.
Run the following command in any directory:

```bash
git lfs install
```

### 3. Git Bash (Windows)

If Git Bash is not installed on Windows, please install it.
Git Bash is usually installed by default when installing Git on Windows.
On Windows, run all project commands in Git Bash.
