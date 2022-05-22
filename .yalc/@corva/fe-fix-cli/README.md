# @corva/fe-fix-cli

This is a CLI that automates hot-fix creation process

## Development Information
This is a template repository to create new JS libraries that follow SEMVER and conventional commits best practices.
A person with the permission to create new repositories can press `Use this template`
![image](https://user-images.githubusercontent.com/47849720/150311875-5b606555-7f9d-4f21-9bd1-d807393be897.png)

## Instalation steps
Clone this repository and run `yarn` inside the directory. On postinstall git hooks would be configured for this repository.

## Development flow
To develop new feature or implement fix one need to create new branch from `main` one and name it properly: branch-type/JIRA_ID-jira_ticket_description i.e.
* `feature/DC-1234-add-Table-component`
* `fix/DR-9999-fix-broken-page`

When changes are ready please create commit with meaningful description using [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/). Commit message should have form `commit-type(JIRA_ID): commit message`. All types of commits could be found [here](./git-conventional-commits.json)

Please note that `feat` and `fix` commits messages will be used during automatic changelog creation while `chore`, `docs` and others will not.

Do not create 2 commits with same name and consider amending previous commit instead with `git commit --amend --no-edit`.

---
**⚠⚠⚠ In case commit introduces breaking changes incompatible with existing API special commit message have to be used. Just type `git commit` and [commit template](./scripts/COMMIT_TEMPLATE) will be opened to edit. The main difference with regular commit messages - such commit MUST have footer(s) BREAKING CHANGES⚠⚠⚠**

---

On merging the PR to `main` branch an automatic release flow will be triggered. New package version will be determined based on changes introduced by commit. `fix` corresponds to `patch`, `feat` to `minor` and `breaking changes` to `major` version release.

More details on semantic versioning could be found in official [SemVer specification](https://semver.org/).

Note: untill first major version is released the package is considered as under development and `breaking changes` will correspond to `minor` release.
