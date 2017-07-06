# Mercury User Guide
Mercury is a static content translation platform - [Interested? Watch a presentation.](https://www.youtube.com/watch?v=ByLO5SJXZ6Y)

#### Ready to integrate your repository with Mercury?
Please refer to the [Mercury integration runbook](https://github.com/opentable/mercury/blob/master/docs/integration-runbook.md) and [FAQ](https://github.com/opentable/mercury/blob/master/docs/faq.md).

# Mercury Maintainer Guide
After cloning the project, just run:
```
npm i
```
to install dependencies, then:
```
npm start
```
to run Mercury against a sandbox repo (You can change the [config file](https://github.com/opentable/mercury/blob/master/config/development.yml) that to run it against any repo with a `mercury.json` file).

To run tests:
```
npm test
```


### Logs Dashboard:
* [prod-sc](http://loglov3.otenv.com/app/kibana#/dashboard/9409a8f0-6192-11e7-a44d-6337dbecff74)
