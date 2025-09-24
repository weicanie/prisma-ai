import * as path from 'path';

export const projectsDirPath = path.join(process.cwd(), '..', '..', 'projects');
export const cloneProjectScriptPath = path.join(process.cwd(), 'scripts', 'clone_repo.sh');

export const deepwikiDownScriptPath = path.join(process.cwd(), 'scripts', 'deepwiki-down.sh');
export const deepwikiDownOutputPath = path.join(process.cwd(), '..', '..', 'project_wikis');
