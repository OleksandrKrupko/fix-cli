const ENVS_NAMES = {
  DEV: 'DEV',
  RELEASE: 'RELEASE',
  BETA: 'BETA',
  PROD: 'PROD',
};

module.exports = [
  {
    name: ENVS_NAMES.DEV,
    branch: 'main',
    getFixBranchNameForTicketId: ticketId => `fix/${ticketId}`,
    getTicketIdFromFixBranch: fixBranchName =>
      fixBranchName.match(/^fix\/(\w+-\d+).*/)?.[1],
    applyFixForEnvs: [],
  },
  {
    name: ENVS_NAMES.RELEASE,
    branch: 'ask',
    getFixBranchNameForTicketId: ticketId => `release-fix/${ticketId}`,
    getTicketIdFromFixBranch: fixBranchName =>
      fixBranchName.match(/^release-fix\/(\w+-\d+).*/)?.[1],
    applyFixForEnvs: [ENVS_NAMES.DEV],
  },
  {
    name: ENVS_NAMES.BETA,
    branch: 'beta',
    getFixBranchNameForTicketId: ticketId => `beta-fix/${ticketId}`,
    getTicketIdFromFixBranch: fixBranchName =>
      fixBranchName.match(/^beta-fix\/(\w+-\d+).*/)?.[1],
    applyFixForEnvs: [ENVS_NAMES.RELEASE, ENVS_NAMES.DEV],
  },
  {
    name: ENVS_NAMES.PROD,
    branch: 'production',
    getFixBranchNameForTicketId: ticketId => `hot-fix/${ticketId}`,
    getTicketIdFromFixBranch: fixBranchName =>
      fixBranchName.match(/^hot-fix\/(\w+-\d+).*/)?.[1],
    applyFixForEnvs: [ENVS_NAMES.BETA, ENVS_NAMES.RELEASE, ENVS_NAMES.DEV],
  },
];
