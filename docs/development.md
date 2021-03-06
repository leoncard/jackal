# Jackal Development Guide

## Testing

Jackal uses [Mocha](https://mochajs.org/) and [Chai](http://chaijs.com/) for tests, [ESLint](http://eslint.org/) for linting and [NYC](https://github.com/istanbuljs/nyc) for coverage reports.

Tests can be run using the `npm test` command. ESLint will run prior to the tests being run, _all_ linting errors should be fixed prior to pushing changes. Linting warnings should also be fixed, or at least surrounded with `eslint-disable` and `eslint-enable` comments if a good reason exists for not modifying the code.

HTML coverage reports will be generated and can be viewed by opening `/path/to/jackal/coverage/lcov-report/index.html` in a browser, a text summary will be printed after the tests have executed.

## Contributing

Jackal is now in a state which meets our needs for Contract testing and it is unlikely we will add any new features in the short term, if you would like to contribute to Jackal then some features we would like to see added include:

- an API interface to remove specific contracts from the running database by consumer, provider or both
- a UI to display the current state of the Jackal instance, including usage statistics

If you would like to contribute the above or any other features to Jackal, we welcome pull requests and will aim to review them as fast as we can.

## Releasing

For developers with contributor status, every push results in an updated `latest` image in [Dockerhub](https://hub.docker.com/r/findmypast/jackal/). Once you decide to create a new release based on [semver](http://semver.org/) run the following to create a tag and bump the `package.json` version:

```
npm version [ patch | minor | major ]
```

Then to push the changes and trigger a deploy:

```
git push && git push --tags
```

This will result in a new [github release](https://github.com/findmypast-oss/jackal/releases), new [npm release](https://www.npmjs.com/package/jackal) and a new [Dockerhub tagged image](https://hub.docker.com/r/findmypast/jackal/tags/).
