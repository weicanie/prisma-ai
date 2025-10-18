These user data directories are deprecated after `v5.0.2` but kept to support migration from older versions:

- ./projects
- ./resumes
- ./project_wikis
- ./packages/backend/prisma_agent_config.json

`./packages/backend/agent_output` will be removed entirely and will not be migrated to the new directory structure.
<br/>
You must log in again to trigger data migration.
<br/>
After `v5.0.2`, all user data is consolidated under `./user_data`.
