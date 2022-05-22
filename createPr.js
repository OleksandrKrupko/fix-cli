const { exec } = require('child_process');
const simpleGit = require('simple-git');

module.exports = async function createFixPr({ fixBaseBranch }) {
  await simpleGit().push({
    '-u': null,
    '-f': null,
    origin: null,
    head: null,
  });

  exec(
    `gh pr create --fill --base ${fixBaseBranch}`,
    (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
      }

      if (stderr) {
        console.log(`stderr: ${stderr}`);
      }

      console.log(`stdout: ${stdout}`);

      // exec('gh pr view -w', (error, stdout, stderr) => {
      //   if (error) {
      //     console.log(`error: ${error.message}`);
      //     return;
      //   }
      //   if (stderr) {
      //     console.log(`stderr: ${stderr}`);
      //     return;
      //   }
      //   console.log(`stdout: ${stdout}`);
      // });
    }
  );
};
