# WarFront.io Contributing Guidelines

Thank you for considering contributing to WarFront.io! Please read the following guidelines to ensure that your contributions are accepted.

For security related issues or vulnerabilities, please DO NOT create an issue or pull request on GitHub. Instead, contact us via email at [security@warfront.io](mailto:security@warfront.io).

## Feature Requests - I've got an idea!

If you have an idea how the game could be improved gameplay-wise, please head over to our [discord server](https://discord.gg/tvgfpeCGaD) and post about it there first. You can discuss your idea with the community there and if it is approved, you can create a feature request on GitHub.

For infrastructure or technical improvements, you can create a rfc (request for comments) on GitHub directly. This allows other contributors to discuss the idea before it is implemented.

## Bug Reports - This seems broken!

If you have found a bug in the game, you can do one of the following:
- If you are not sure on the technical details of the bug, you can post about it on our [discord server](https://discord.gg/tvgfpeCGaD).
- Create a new issue on GitHub. Please provide as much information as possible and follow the issue template.
- If you are able to fix the bug yourself, you can create a pull request with the fix.

Please check the [existing issues](https://github.com/WarFrontIO/client/issues) before creating a new one to make sure that the bug has not already been reported. 

## Pull Requests - I've got a fix!

### When to create a pull request

You can create a pull request if you have a fix for a bug or a feature that was approved on discord.
Pull requests for new features that were not discussed or other changes like fixing typos will not be accepted.

### Requirements for a pull request

Note that by making a pull request, you agree to license your code under the [MIT License](LICENSE).
This also means that you may not include code that is not your own or that you do not have the rights to use.

- The code must be formatted similar to the existing code. Most importantly, use tabs for indentation and the same bracket spacing.
- Test your changes and make sure that they work as expected and do not break existing functionality.
- If you are adding new functionality, make sure it is sufficiently documented in the code.
- If you are fixing a bug, make sure to reference the issue that you are fixing in the pull request.
- Only include the changes that are necessary for the fix or feature. Do not include unrelated changes like formatting or changes to package.json.
- Only ever address one issue or feature in a single pull request. If you have multiple changes, create multiple pull requests.

The ci pipeline will run tests on your code and check for formatting. If the tests fail, you will need to fix the issues before the pull request can be merged. For first time contributors, the test will not run automatically, a maintainer will start the tests manually when they are available.

### How to create a pull request

1. Fork the repository on GitHub. You can do this by clicking the "Fork" button on the top right of the repository page. We recommend to rename the fork to `WarFront-client` to make it easier to distinguish from your own repositories.
2. Clone your fork to your local machine. You can do this by running `git clone https://github.com/<your-username>/<repository-name>.git` in your terminal. Replace `<your-username>` with your GitHub username and `<repository-name>` with the name of the repository. Alternatively, you can use features of your IDE to clone the repository.
3. Create a new branch for your changes. You can do this by running `git checkout -b <branch-name>`. Replace `<branch-name>` with a descriptive name for your changes, e.g. `fix-bug-123`.
4. Make your changes in the new branch. You can do this by editing the files in your favorite editor or IDE.
5. Commit your changes. You can do this by running `git add .` to stage all changes and `git commit -m "Your commit message"` to commit the changes. Replace `Your commit message` with a short description of the changes you made.
6. Push your changes to your fork. You can do this by running `git push origin <branch-name>`. Replace `<branch-name>` with the name of the branch you created in step 3.
7. Create a [pull request](https://github.com/WarFrontIO/client/pull/new) on GitHub. Make sure to select the correct branch and fill out the pull request template.

That's it! Your pull request will be reviewed by a maintainer and merged if it meets the requirements.

If you have any questions or need help with creating a pull request, feel free to ask in our [discord server](https://discord.gg/tvgfpeCGaD).