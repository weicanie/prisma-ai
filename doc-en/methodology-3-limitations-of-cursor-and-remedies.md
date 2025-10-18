# Limitations of AI Coding Tools like Cursor and How to Overcome Them

Using Cursor as an example.

## Cursor’s limitations

### Mismatch between target audience and engineers’ needs

### Inherent limits of “ambient coding”

## How to overcome

The core issue is a design that strips engineers of control. There’s only one solution: take back control.

### Take back control

#### Typical workflow when using Cursor directly

- Provide prompts
  - Craft prompts from scratch
  - A high-quality prompt requires lots of boilerplate plus completeness, feasibility, and defensive considerations
- AI starts working
  - If the requirements are off, it still proceeds—every line of the prompt is treated as an instruction
  - Knowledge gaps (new topics, deep domain areas) cause hallucinations and weak results

#### Workflow with this project’s Agent

- Build a project code knowledge base and domain knowledge base
  - AI doesn’t know Tailwind v4? Add official migration docs to the KB and specify “use Tailwind v4” in requirements
  - AI misses the point? Query the code KB for a thorough requirements analysis and plan
- Provide the highlight/feature to implement

- Agent thinks and acts
  - Retrieve relevant code/knowledge for requirements analysis
  - Retrieve relevant code/knowledge for an overall highlight implementation plan
  - Retrieve relevant code/knowledge for detailed step analysis, reviews, and planning
  - Produce the final plan and high-quality prompts
- You review every stage—control returns to you

  - Want to correct things yourself? Fully supported
  - Not satisfied and want to give feedback? The AI will reflect and improve accordingly

- Send the prompt to Cursor’s coding agent
- Provide feedback based on execution results
- The Agent will analyze and plan further based on results

### Project Agent architecture

- Planner-Executor architecture + CRAG + human-in-the-loop AI Agent

  - Multi-round analysis and planning
  - Requirements review and plan review
  - Enhanced Planner-Executor for deeper, finer thinking/analysis/planning
  - CRAG-enhanced RAG for more precise and richer knowledge retrieval
  - Land highlights automatically by integrating with tools like Cursor/Windsurf via prompts
