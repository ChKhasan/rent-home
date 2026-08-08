# IjaraAngular

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) and is currently maintained on Angular 22.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Runtime configuration

The SSR server reads the following environment variables at startup:

- `NEXTHOME_YANDEX_MAPS_API_KEY`: domain-restricted Yandex Maps JavaScript API key.
- `NEXTHOME_PRIMEUI_LICENSE_KEY`: PrimeUI/PrimeNG license key for PrimeNG 22 runtime validation.
- `NG_ALLOWED_HOSTS`: comma-separated Angular SSR host allowlist when the built-in defaults are not enough.
- `PORT`: SSR server port, defaults to `4000`.

The server exposes runtime-only browser keys through the non-cacheable `/assets/runtime-config.js`
endpoint. Static deployments must replace `browser/assets/runtime-config.js` during deployment without
committing real keys to the repository.

## Running unit tests

Run `ng test` to execute the unit tests via Vitest.

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
