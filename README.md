# Smart Properties App

Smart Properties App is a multi-tenant web application for Smart Propeties SaaS platform that externalizes business logic through centralized management and distributed real-time execution. The platform is designed to reduce time-to-change, rule duplication, and tight coupling across multiple applications by providing a readable proprietary DSL with governance and observability assisted by generative AI.

It supports controlled and traceable business logic experimentation through workspaces, auditing, caching, sandboxing, and fast execution strategies such as pre-compilation and JIT. By promoting a single source of truth for business rules and enabling multi-platform integration through SDKs, the platform improves reuse, consistency, and the speed of implementing, validating, and publishing changes.

## Goal for This App

Develop the multi-tenant web application with users, roles, workspaces, code editor, test case validation, and generative AI assistance.

## Related repositories

- Smart Properties API: https://github.com/edsoncn/smart-properties-api
- Smart Properties Compiler: https://github.com/edsoncn/smart-properties-compiler
- Smart Properties Web Demo: https://github.com/edsoncn/smart-properties-web-demo

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode.  
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page reloads when you make edits.  
You may also see lint errors in the console.

### `npm test`

Launches the test runner in interactive watch mode.  
See the [Create React App test documentation](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production in the `build` folder.  
It bundles React in production mode and optimizes the build for best performance.

The build is minified and the filenames include hashes.  
Your app is ready to be deployed.

See the [Create React App deployment documentation](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note:** this is a one-way operation. Once you `eject`, you cannot go back.

If you are not satisfied with the build tool and configuration choices, you can `eject` at any time. This command removes the single build dependency from your project.

Instead, it copies all configuration files and transitive dependencies such as webpack, Babel, and ESLint directly into your project so you have full control over them. All commands except `eject` will still work, but they will now point to the copied scripts so you can customize them.
