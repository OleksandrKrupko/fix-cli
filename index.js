const { Command } = require('commander');
const simpleGit = require('simple-git');
const standardVersion = require('standard-version');

const envsConfigs = require('./config');
const gitUtils = require('./utils/git');
const prompts = require('./utils/prompts');
const createFixPr = require('./createPr');

async function wait(delay) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
}

async function bumpVersion() {
  standardVersion({
    noVerify: true,
    infile: 'docs/CHANGELOG.md',
    releaseAs: 'minor',
    skip: {
      tag: true,
    },
    // silent: true,
  })
    .then(() => {
      // standard-version is done
    })
    .catch(err => {
      console.error(`standard-version failed with message: ${err.message}`);
    });
}

const program = new Command();

async function main() {
  program
    .command('apply')
    .description('Split a string into substrings and display as an array')
    .action(async (str, options) => {
      const currentBranchName = await gitUtils.getCurrentBranchName();
      const fixCommitHash = await simpleGit().revparse({ HEAD: null });

      console.log({ currentBranchName, fixCommitHash });

      const envConfig = envsConfigs.find(config =>
        config.getTicketIdFromFixBranch(currentBranchName)
      );

      const fixTicketId = envConfig.getTicketIdFromFixBranch(currentBranchName);

      if (envConfig.standardVersionBump) {
        console.log(`bumping the version on branch: ${currentBranchName}`);
        await standardVersion(envConfig.standardVersionBump);
      }

      try {
        await simpleGit().push();
      } catch (error) {
        if (gitUtils.isGitPushError(error)) {
          const isAllowForcePush = await prompts.askForForcePush();
          if (isAllowForcePush) {
            console.log('you allowed force push');
            await simpleGit().push({
              '-f': null,
            });
          } else {
            console.log('you didn`t allow force push');
            throw new Error('End of the script');
          }
        }
      }

      for (let envName of envConfig.applyFixForEnvs) {
        const envToApplyFixConfig = envsConfigs.find(
          config => config.name === envName
        );
        console.log('checkout to branch:', envToApplyFixConfig.branch);

        let envBaseBranch;
        if (envToApplyFixConfig.branch === 'ask') {
          envBaseBranch = await prompts.askForReleaseBranch();
        } else {
          envBaseBranch = envToApplyFixConfig.branch;
        }

        await simpleGit().checkout(envBaseBranch);
        await simpleGit().pull();
        const fixBranchName =
          envToApplyFixConfig.getFixBranchNameForTicketId(fixTicketId);
        console.log('Creating a new branch', fixBranchName);
        await simpleGit().checkoutLocalBranch(fixBranchName);
        console.log('cherry-picking the fix');
        await simpleGit().raw('cherry-pick', fixCommitHash);

        if (envToApplyFixConfig.standardVersionBump) {
          console.log('bumping the version');
          await standardVersion(envToApplyFixConfig.standardVersionBump);
        }

        console.log(`creating a PR for branch: ${envBaseBranch}`);

        await createFixPr({
          fixBaseBranch: envBaseBranch,
        });

        await wait(2000);
      }
    });

  program
    .command('clean')
    .description('remove test branches')
    .action(async () => {
      const testTicketId = 'dc-777';

      for (let config of envsConfigs) {
        if (config.name !== 'PROD') {
          try {
            const branchName = config.getFixBranchNameForTicketId(testTicketId);
            console.log(`deleting ${branchName}`);
            await simpleGit().deleteLocalBranch(branchName, true);
          } catch (error) {
            console.log(error.message);
          }
        }
      }
    });

  await program.parseAsync();
}

main();
