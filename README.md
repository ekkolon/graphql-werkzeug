<h1 align="center">GraphQL Werkzeug - badass directives for your GraphQL schema.</h1>

<p align="center">
  <br>
  <img src="assets/graphql-werkzeug-logo.svg" alt="angular-logo" width="80px" height="80px"/>
  <br>
  <br>
  <i>A powerful collection of pre-built directives for your next GraphQL project.</i>
  <br>
  <br>
</p>

<div align="center">
  <a href="https://npmjs.org/package/@ekkolon/graphql-werkzeug">
    <img src="https://img.shields.io/npm/v/@ekkolon/graphql-werkzeug.svg" />
  </a>&nbsp;
  <a href="https://github.com/google/gts">
    <img src="https://img.shields.io/badge/code%20style-google-blueviolet.svg" />
  </a>&nbsp;
  <br>
  <br>
</div>

<hr>

With [GraphQL Werkzeug][npm-url], you can easily compose types, enforce value restrictions and access permissions and add other important features to your GraphQL API.

Try it out today and see how it can improve your GraphQL development process.

_Note: This project is still under active development. Therefore, some features may change at any time._

## Table of contents

- [Features](#features)
  - [Directives](#directives)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [Authors](#authors)
- [License](#license)
- [Acknowledgements](#acknowledgements)
- [Feedback](#feedback)

## Features

### Directives

| Name                                      | Description                                                                |
| ----------------------------------------- | -------------------------------------------------------------------------- |
| [inherits](/docs/inherits_directive.md)   | Augments a type with fields from a set of other types in a GraphQL schema. |
| [length](/docs/length_directive.md)       | Enforce a minimum/maximum length for a string-valued field.                |
| auth (WIP)                                | Enforce access permissions on object types and object fields.              |
| [date](/docs/date_directive.md)           | Format Date strings.                                                       |
| [uppercase](/docs/uppercase_directive.md) | Convert string-valued field to uppercase                                   |
| [lowercase](/docs/lowercase_directive.md) | Convert string-valued field to lowercase                                   |

## Installation

Install GraphQL Werkzeug with npm

```bash
npm install @ekkolon/graphql-Werkzeug
```

Install GraphQL Werkzeug with yarn

```bash
yarn add @ekkolon/graphql-Werkzeug
```

## Usage

See the [Directives](#directives) section and click on the links to find out more about a specific directive's signature, usage and examples.

## Contributing

Contributions are always welcome!

Read through the [contribution guidelines](/CONTRIBUTING.md) to learn about submission process, coding rules, and more.

Please adhere to this project's [Code of Conduct](/CODE_OF_CONDUCT.md).

## Authors

- [@ekkolon](https://www.github.com/ekkolon)

## License

[Apache License 2.0](https://choosealicense.com/licenses/apache-2.0/)

## Acknowledgements

- [GraphQL Tools](https://github.com/ardatan/graphql-tools)
  GraphQL Werkzeug is built around tools provided by @graphql-tools.

## Feedback

If you have any feedback, please reach out to me via [E-Mail](mailto:18242749+ekkolon@users.noreply.github.com).

[gts-image]: https://img.shields.io/badge/code%20style-google-blueviolet.svg
[gts-url]: https://github.com/google/gts
[npm-image]: https://img.shields.io/npm/v/@ekkolon/graphql-werkzeug.svg
[npm-url]: https://npmjs.org/package/@ekkolon/graphql-werkzeug
[gql-werkzeug-logo]: assets/graphql-werkzeug-logo.svg
[github-email]: 18242749+ekkolon@users.noreply.github.com
