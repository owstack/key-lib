KeyLib
=======

[![NPM Package](https://img.shields.io/npm/v/key-lib.svg?style=flat-square)](https://www.npmjs.org/package/key-lib)
[![Build Status](https://img.shields.io/travis/owstack/key-lib.svg?branch=master&style=flat-square)](https://travis-ci.org/owstack/key-lib)
[![Coverage Status](https://img.shields.io/coveralls/owstack/key-lib.svg?style=flat-square)](https://coveralls.io/r/owstack/key-lib)

A JavaScript cryptocurrency key library.

## Get Started

```
npm install key-lib
```

```
bower install key-lib
```

## Documentation

The complete docs are hosted here: [keyLib documentation](docs/index.md).

## Examples

* [Generate a random key](https://github.com/owstack/key-lib/blob/master/docs/examples.md#generate-a-random-address)
* [Generate a key from a SHA256 hash](https://github.com/owstack/key-lib/blob/master/docs/examples.md#generate-a-address-from-a-sha256-hash)
* [Import an address via WIF](https://github.com/owstack/key-lib/blob/master/docs/examples.md#import-an-address-via-wif)
* [Sign a Bitcoin message](https://github.com/owstack/key-lib/blob/master/docs/examples.md#sign-a-bitcoin-message)

## Security

If you find a security issue, please email security@openwalletstack.com.

## Contributing

Please send pull requests for bug fixes, code optimization, and ideas for improvement. For more information on how to contribute, please refer to our [CONTRIBUTING](https://github.com/owstack/key-lib/blob/master/CONTRIBUTING.md) file.

## Building the Browser Bundle

To build a key-lib full bundle for the browser:

```sh
gulp browser
```

This will generate files named `key-lib.js` and `key-lib.min.js`.

## Development & Tests

```sh
git clone https://github.com/owstack/key-lib
cd key-lib
npm install
```

Run all the tests:

```sh
gulp test
```

You can also run just the Node.js tests with `gulp test:node`, just the browser tests with `gulp test:browser`
or create a test coverage report (you can open `coverage/lcov-report/index.html` to visualize it) with `gulp coverage`.

## License

Code released under [the MIT license](https://github.com/owstack/key-lib/blob/master/LICENSE).

Copyright 2018 Open Wallet Stack. KeyLib is a trademark maintained by Open Wallet Stack.
