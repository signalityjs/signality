# Contributing

> 🚀 **Signality v0.1 is here!** We're just getting started, and there's a long road ahead to 1.0. Your contributions can help shape its future — every help matters! All contributors will be featured on our website and in the README. Join us on this journey! 🎉

We welcome contributions of all kinds - whether it's fixing bugs, adding features, improving documentation, or suggesting ideas.

If you're planning a larger change, we'd love to hear about it first! You can open an issue or start a discussion to share your ideas and get feedback before diving in.

## Getting Started

In order to make your contribution please make a fork of the repository. After you've pulled the code, follow these steps to kick-start the development:

1. Run `pnpm install` to install dependencies
2. Run `pnpm docs:dev` to launch the documentation site locally
3. Run `pnpm demos:dev` to launch the demo app for local testing

## Development Workflow

### Running Tests

Run all tests across the monorepo:

```bash
pnpm test
```

Run tests for a specific project:

```bash
nx test core
nx test cdk-interop
```

### Building

Build all packages:

```bash
pnpm build
```

Build a specific package:

```bash
nx build core
nx build cdk-interop
```

### Documentation

The documentation site is built with VitePress and includes interactive demos:

- `pnpm docs:dev` - Start development server
- `pnpm docs:build` - Build documentation

## Pull Request Process

1. We follow [Conventional Commits](https://www.conventionalcommits.org/) in our commit messages with the following scopes:

- `core`: changes to the core package
- `cdk-interop`: changes to the cdk-interop package
- `demos`: changes to the demo components
- `docs`: changes to documentation

Example: `feat(core): add new battery utility`

2. Take a look at our [Coding Standards](./CODING_STANDARDS.md) - these are guidelines to help maintain consistency

3. When reporting bugs or requesting features, using the issue templates helps us understand your needs better

4. When you're ready, create a Pull Request from your fork to the original repository

5. We'll check that tests pass and documentation is updated (if applicable) during the review process

## Issue Templates

When filing issues, please use the appropriate templates:

- **Bug Report**: for reporting bugs or unexpected behavior
- **Feature Request**: for proposing new features or enhancements
- **Documentation**: for documentation-related issues

## Architecture

This project is organized as an Nx monorepo with the following packages:

- **core**: Main package with browser utilities, element utilities, and reactive helpers
- **cdk-interop**: CDK integration utilities
- **demos**: Demo components built as custom elements for documentation
- **docs**: VitePress documentation site

### Package Structure

```
projects/
├── core/              # Main package
│   ├── browser/       # Browser API utilities
│   ├── elements/      # Element utilities
│   ├── utils/         # General utilities
│   └── internal/      # Internal helpers (private API)
├── cdk-interop/       # CDK integration
├── demos/             # Demo components
└── docs/              # Documentation site
```
