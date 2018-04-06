# Mercury

Mercury is a bot for handling in-code static translations. Developed at [OpenTable](https://www.opentable.com), [it](https://github.com/mercurybot) takes care of dozens of codebases by making automated Pull Requests to keep the code up to date with our translations.

#### How Mercury works

The bot looks for a `mercury.json` manifest file in a repository's root. It then locates the source files and keeps them updated with Smartling by using its API. Please refer to the [Mercury integration runbook](https://github.com/opentable/mercury/blob/master/docs/integration-runbook.md) and [FAQ](https://github.com/opentable/mercury/blob/master/docs/faq.md).

#### How to use Mercury in your organization

Mercury is available as [npm module](https://www.npmjs.com/package/mercury-bot) and needs to be configured to run with github and smartling API tokens.
If you wish to know more about it, [get in touch with us](mailto:fmaffei@opentable.com).

#### License
MIT
