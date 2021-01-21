## Boat Finder React App

A boats listing page that displays their info: images, price, model, manufacturer, location.

The header contains a search block which:
* Filter by manufacturer (a dropdown with manufacturers from the API)
* Filter by price (min and max value)
* Sort by date and price (a dropdown with options to sort asc and desc)

The page URL updates with the filtering options so that users can share the URL and have the same search results.

> The state management will be done using **MobX-State-Tree (MST)** - functional reactive state library

## Scripts

#### `yarn start`

Run the app in the development mode on [http://localhost:3000](http://localhost:3000)

#### `yarn test`

not implemented

#### `yarn build`

Builds the app for production to the `build` folder.

## Tech Stack
- [x] React
- [x] Typescript
- [x] Mobx
- [x] MobX-State-Tree
- [x] React select
- [x] Material UI
- [x] Styled components
