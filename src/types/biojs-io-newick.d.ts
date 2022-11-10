/**
 * We use `biojs-io-newick` from NPM instead of https://github.com/jasondavies/newick.js
 * that was used before but only lives on GitHub. They are functionally the same, but
 * use different names for the result keys:
 * `branch_length` instead of `length`, and `children` instead of `branchset`.
 */

declare module 'biojs-io-newick' {
  export interface TreeNode {
    name: string
    branch_length: number
    children?: TreeNode[]
  }
  export function parse_newick(data: string): TreeNode
}
