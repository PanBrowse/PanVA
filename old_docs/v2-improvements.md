This document describes the improvements of the PanVA application compared to the version on https://github.com/astridvandenbrandt/PanVA-dev


# Application

* Restructured repository.
* Make both API and Frontend runtime configurable. \
  Instead of forks/branches for different configurations.
* Added single Dockerfile to run both API + Frontend.
* Added necessary documentation.
* Removed duplicated data from data format.
* Support dynamic metadata in homology groups, variable positions, annotations, individual alignment cells.
* Support annotations with multiple properties.
* Support multiple Newick trees.


# API

* Use Poetry for dependency management.
* Stream data files without passing through Pandas. \
  This reduces memory consumption considerably. \
  Bypass Python entirely in production using Apache.
* Refactor recursive functions to be non-recursive. \
  Removes necessity for `sys.setrecursionlimit` to prevent hitting limit.


# Frontend

## User experience (UX)

* Responsive layout with single scrollbar.
* Consistent modern look and feel (Ant Design).
* Simplified grouping interactions.
* Simplified tree switching.
* Position range selection.
* Row selection from CoreSNP node.
* Tooltip pinning.
* Searchable dropdowns where applicable.
* Collapsable sidebar blocks.
* Natural sorting of mRNA ids.
* User feedback while loading dataset.
* Prevent mixed data from multiple datasets between loads.
* Configurable position filters.
* Configurable metadata columns.
* Homology groups can be filtered by metadata.
* Complex sequence filtering on metadata.
* Legend showing nucleotides, aggregation, boolean icons and annotations.
* Setting for high DPI cell rendering.

## Code cleanup

* Use recommended Vue tooling (vite, pinia).
* Use TypeScript. \
  Prevent many bugs by adding static typing.
* Restructure application using best practices:
  * Move repeated hard-coded values to single constants file.
  * Separation of concerns.
  * Modular design.
  * Reusable, small components.
* Maintainable and well-documented. \
  Improves the developer experience and makes it easier for new developers to contribute.

## Performance

* Store a single copy of the data, that never changes. \
  Data is never copied or moved around (not even when sorting) to reduce memory consumption.
* Reference data using data indices. \
  Sorting and slicing is performed on arrays of data indices, which are small and fast. \
  This also prevents the use of `Array.includes` and `Array.indexOf` which are slow in performance.
* Lean heavily on memoized functions (`computed` in Vue, `getters` in Pinia).
* Debounced lazy-loaded tooltips.
* Draw Heatmap using `canvas` elements. \
  Instead of 100.000+ DOM elements that slow down the browser.
  Each row has its own `canvas` element, so only changed rows need to be redrawn.
* Don't redraw `svg`/`canvas` for hover effect or transitions, use `css` instead.
