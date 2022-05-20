const simpleGit = require('simple-git');

module.exports = { getCurrentBranchName };

async function getCurrentBranchName() {
  return await simpleGit().revparse({ '--abbrev-ref': null, HEAD: null });
}
