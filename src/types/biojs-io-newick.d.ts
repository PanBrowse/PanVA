declare module 'biojs-io-newick' {
  export interface TreeNode {
    name: string
    branch_length: number
    children?: TreeNode[]
  }
  export function parse_newick(data: string): TreeNode
}
