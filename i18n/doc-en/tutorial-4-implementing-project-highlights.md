# Implementing Project Highlights

## 1. Configuration

Open the config file at packages/backend/prisma_agent_config.json

The CRAG options control whether to use a more precise knowledge retrieval that includes web search. Compared to ordinary retrieval, it's more accurate and richer.

You only need to configure the SerpAPI API key to enable it.

Register and log in to the SERPAPI platform: https://serpapi.com/

<br/>

Then create an API key and finally set it in the [environment file](/packages/backend/.env).

```bash
SERPAPI_API_KEY= 'your SERPAPI API key'
```

The topK options set how many knowledge chunks to retrieve at different stages. The more you retrieve, the more knowledge the AI can use. Be mindful of your context window limit and the size of your knowledge base.

## 2. Usage

On the Project Experience page in the client, select any project entry to use this feature.
Upload your project name (the one you cloned) and the highlight you want to implement, then collaborate via the CLI and Agent to complete the highlight.

After multiple rounds of analyze, plan, and review, a final implementation plan will be generated. You can implement the highlight according to this plan.
A ready-to-use prompt for that plan will also be generated. You can paste it into AI coding tools like Cursor or Windsurf to implement.

After each step is done, feed the result back to the AI and continue collaborating until the highlight is completed.

What you need to do most is to review the requirements analysis, cut unnecessary requirements, and correct unreasonable ones.

### Interacting with the Agent

Since the Agent's output can be long, the data you need to review will be placed in the agent_output folder (the exact path will be printed by the CLI—you don't need to find it yourself).

Files inside include:

- Requirements analysis and implementation plan
  - `analysis.md`: requirements analysis for the highlight
  - `analysis_step.md`: requirements analysis for each step of the highlight
  - `plan.json`: implementation plan for the highlight
  - `plan_step.json`: implementation plan for each step
- Implementation
  - `cursor_input.md`: prompt for the Cursor agent (automated)
  - `cursor_output.md`: summary after Cursor agent completes a step (automated)
  - `human_feedback.json`: your feedback after review (as an extra control)
- Others
  - `plan_step_for_execution.json`: concrete step plan (for debugging)
  - `interrupt_payload.json`: state when execution is interrupted (for debugging)
  - `knowledge_request.md`: domain knowledge requests (not implemented)

## 3. Workflow

See [Master project analysis, optimization and highlight mining in 2 minutes](./tutorial-3-project-experience-analysis-optimization-highlights.md)
