# Mercury integration runbook

The goal of Mercury is to keep your project's static resource files and their translations in sync with Smartling at all times, and instantaneously support the addition of new languages to the existing ones, by means of GitHub Pull Requests.

If you want to integrate your repository with Mercury, please follow these steps:

### Step 1: create and push one or more en-US source file(s)

*N.B. If you already have and do not need to update source files, you can jump to [Step 2](#step-2-create-a-smartling-project).*

If you don't, you can create a source file with the strings you need to translate. One best practice is to put these files into a `locales/en-US` folder. As an example, you can take a look at [this project's source files](https://github.com/opentable/restaurant-messages-generator-api/tree/master/src/locales/en-us).  

JSON is the standard we'd recommend, even if Mercury supports many file types and it's likely you won't have to convert your existing resources.

### Step 2: create a Smartling project

*N.B. If you already have one, take note of the project ID, and then jump to [Step 3](#step-3-create-a-mercuryjson-file-in-).*

If you want to setup a new one, please get in touch with the MLP Team (multi-language@opentable.com), we'll be happy to provide guidance.

### Step 3: create a mercury.json file in /

The `mercury.json` file is the one addition you'll need to make to your project. Let's take a look at this example:

``` json
{
    "smartlingProjectId": "<smartling-test-projectid>",
    "translations": [{
        "input": {
            "src": ["src/locales/en-us/*.json", "!src/locales/en-us/config.json"]
        },
        "output": {
            "dest": "src/locales/${locale}/${filename}"
        }
    }]
}
```

#### The configuration properties:

|name|description|
|----|-----------|
|`workingBranch` (string, optional)|Default `master`, is the working github branch.|
|`smartlingProjectId` (string, required)|It is the ID of your smartling project that Mercury will look at. If unsure of what that is, just browse your Smartling project. The ID will be found in the URL: *https://dashboard.smartling.com/projects/{{ID}}/translations/dashboard.htm*|
|`translations` (array of objects, required)|It is a list of configurations that have two common properties: an input and an output. Mercury will read every file in each input path, and place its translations in the output path. In most cases this will be populated by just one object, but there might be cases in which you need more than one input-output mapping|
|`translations[index].input` (object, required)|The input details|
|`translations[index].input.src` (array of strings, required)|List of file paths globs. The `*` character can be used to match specific patterns and exclusions can be achieved by inserting `!` at the beginning of the path|
|`translations[index].output` (object, required)|The output details|
|`translations[index].output.dest` (string, required)|The path where Mercury will save the translations. Two string interpolations are used to build this path: `${locale}` will represent each of the supported languages that are returned by Smartling in form of translations, and `${filename}` will replicate the original filename that has been uploaded from the en-us folder. The string can be javascript interpolated, for instance `${locale.toLowerCase()` allows to obtain a lower-cased dest. It is required to at least use the `${locale}`, since it will differentiate the translated languages of the resource. For example, if we have a file called `src/locales/en-US/example.json` in the input path, and Smartling is setup to translate content in `es-MX` and `de-DE`, Mercury will create: `src/locales/es-MX/example.json`, `src/locales/de-DE/example.json`|

### Step 4: Mercury, a kind of magic!

At this point, you'll need to get in touch with the MLP Team (multi-language@opentable.com) and ask for your project to be included into the Mercury whitelist. This will be automated at some point, to achieve automatic detection of mercury.json files in any organization repo.

### Step 5: The Pull Request

Mercury will start by opening a PR that points to the master branch of the repo. The PR will contain a description with a breakdown by language of the status of each translation. It will be updated every time a translation is published in Smartling, until it gets to a 100% completion status, which means it's ready to go.

If you are under pressure to get some translations in, even if not all of them are done, no worries: you can merge that PR and Mercury will reopen a new one as soon as some new translations are published, restarting where it left off.

### DONE!

![freddie-mercury](https://cloud.githubusercontent.com/assets/6615104/24510866/4485fd64-1562-11e7-919d-13c7283edfdd.jpg)
