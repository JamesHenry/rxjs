const { releaseChangelog, releasePublish, releaseVersion } = require('nx/src/command-line/release');
// There are multiple copies of outdated yargs in the workspace, access a known modern one
const yargs = require('nx/node_modules/yargs');

(async () => {
  try {
    const options = await yargs
      .version(false) // don't use the default meaning of version in yargs
      .option('version', {
        description: 'Explicit version specifier to use, if overriding conventional commits',
        type: 'string',
      })
      .option('dryRun', {
        alias: 'd',
        description: 'Whether or not to perform a dry-run of the release process, defaults to true',
        type: 'boolean',
        default: true,
      })
      .option('verbose', {
        description: 'Whether or not to enable verbose logging, defaults to false',
        type: 'boolean',
        default: false,
      })
      .parseAsync();

    const { workspaceVersion, projectsVersionData } = await releaseVersion({
      specifier: options.version,
      // stage package.json updates to be committed later by the changelog command
      stageChanges: true,
      dryRun: options.dryRun,
      verbose: options.verbose,
    });

    await releaseChangelog({
      versionData: projectsVersionData,
      version: workspaceVersion,
      interactive: 'workspace',
      dryRun: options.dryRun,
      verbose: options.verbose,
    });

    await releasePublish({
      dryRun: options.dryRun,
      verbose: options.verbose,
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
