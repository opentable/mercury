# Frequently Asked Questions

## Why is usage of Smartling String Exclusion discouraged?
String exclusion mechanism in Smartling allows individual uploaded strings to be manually excluded from translations process.

In our experience, presence of excluded strings indicates incorrent Smartling usages such as:
* storage of date/time format strings
* storage of language-specific settings

This is usually accompanied by some form of manual (or automated) manipulation of downloaded Smartling resource files.
One of the goals of Mercury is to automate the translation process, which means removing any manipulation of downloaded resource files.

When Mercury detects presence of excluded strings, it will add a warning at the top of your pull request.
Recommended course of action is to move excluded strings to application config.
