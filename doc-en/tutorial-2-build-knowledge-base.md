# Build a Knowledge Base in 5 Minutes

Share knowledge with AI.
After training, AI is broadly knowledgeable, but it lacks domain-specific, newly emerged, or factual information not present in the training data.

Before optimizing and mining highlights from your project experience, the AI will retrieve relevant knowledge from the knowledge base.
Therefore, the richer the project information and related knowledge you provide, the more accurate the AI's generated results will be.

## 1. Configure Local MinIO Service

Build and start the project.

Visit `localhost:9004` in your browser and log in:

```
# If you haven't modified environment variables in compose.yml:
Username: admin
Password: admin123.
```

Then create a bucket named `prisma-ai` (if it doesn't already exist),
and set the access policy to allow all anonymous read access:

<br/>

![1751190038578](<image/教程：(二)知识库构建/1751190038578.png>)

Generate an accessKey and write it to the OSS_ACCESSKEY and OSS_SECRETKEY fields in [environment file 2](/packages/backend/.env.production.example).
<br/>
Note that [environment file 2](/packages/backend/.env.production.example) needs to be renamed to `.env.production`.
<br/>
Finally, restart the project containers.

```
# Run in the repository root
docker compose -f compose.yaml up --attach prisma-ai-backend
```

## 2. Build a Code Knowledge Base

As the name suggests, the code knowledge base shares your project code with the AI. It can be your own project or an open-source project.

The project name in your uploaded experience must match the name on GitHub.

For example, if your project on GitHub is named "aaa", your project name should also be "aaa"; names like "aaa-admin-system" won't work.

So how do you build the project code knowledge base?

### Using your own project as an example

Go to the Knowledge Base page in the client and fill in the fields in order:

- Knowledge Name: any
- File Type: URL
- Knowledge Type: My project's GitHub repo
- Tags: any
- Content: GitHub repo URL

Then click Save.

![1751275030633](<image/教程：(二)知识库构建/1751275030633.png>)

Your project will be automatically cloned locally, then split with tree-sitter and langchain, embedded, and uploaded to the vector database.

### The same steps apply for open-source projects

## 3. Build a Domain Knowledge Base

Add knowledge via the client's Knowledge Base page.
Supported file types:

- Text
- PDF or Markdown documents
- Static page URL

## 4. Notes

Be sure to select the correct File Type and Knowledge Type.

## 5. What knowledge should I add?
First, project code is essential. Talk is cheap—show AI the code.

What if you can't provide company project code?
At least provide documentation covering project requirements/business, tech stack choices, architecture design, etc.—the more detailed, the better.

Next, for knowledge beyond code,
think of AI as a friendly senior who is broadly knowledgeable and eager to help improve your resume, but knows little about you specifically.

So it's best to let it get to know you well:

What roles are you targeting (frontend/backend/ML/test)?
What stage are you in (internship seeker, campus hire, 13 years of experience, 35 years of experience)?
What are your biggest weaknesses? Shallow project depth? Weak technical fundamentals?
Etc.
All of this is very important. It gives the AI clear scope and criteria to tailor its assistance.
