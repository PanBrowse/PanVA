import Levenshtein as lv
from scipy.cluster.hierarchy import linkage, to_tree
from scipy.spatial.distance import squareform
import numpy as np


def keep(s, indices):
    return "".join(ch for i, ch in enumerate(s) if i in indices)


def create_lv_matrix(sequences, nrs_keep):
    seqs = sequences[["mRNA_id", "nuc_trimmed_seq"]]
    seqs["new_seq"] = [keep(s, nrs_keep) for s in seqs["nuc_trimmed_seq"]]
    size = len(sequences["mRNA_id"])

    # Create a zero matrix of w x h
    matrix = [[0] * size for i in range(size)]

    # Go one row at a time and fill until you reach the diagonal.
    for i in range(size):
        for j in range(0, i):
            matrix[i][j] = matrix[j][i] = 1 - lv.ratio(
                seqs["new_seq"][i], seqs["new_seq"][j]
            )

    return matrix


def create_linkage_matrix(data_matrix, output_file=None):
    # https://towardsdatascience.com/introduction-hierarchical-clustering-d3066c6b560e
    # https://www.cs.rice.edu/~ogilvie/comp571/2018/11/01/neighbor-joining.html
    # https://medium.com/geekculture/phylogenetic-trees-implement-in-python-3f9df96c0c32

    dists = squareform(data_matrix)
    linkage_matrix = linkage(dists, "average")

    if output_file:
        np.save(output_file, linkage_matrix)

    return linkage_matrix


def label_tree(n, data_labels):
    # Node is not a leaf; flatten all the leaves in the node's subtree
    if n["children"]:
        for child in n["children"]:
            label_tree(child, data_labels)
    else:
        n["name"] = data_labels[n["node_id"]]

    # Delete the node id since we don't need it anymore and
    # it makes for cleaner JSON
    del n["node_id"]


def add_node(node, parent):
    # First create the new node and append it to its parent's children
    newNode = dict(node_id=node.id, children=[])
    parent["children"].append(newNode)

    # Recursively add the current node's children
    if node.left:
        add_node(node.left, newNode)
    if node.right:
        add_node(node.right, newNode)


def create_d3_dendrogram(linkage_matrix, data_labels):
    tree = to_tree(linkage_matrix, rd=False)

    d3Dendro = dict(children=[], name="Root1")
    add_node(tree, d3Dendro)

    label_tree(d3Dendro["children"][0], data_labels)

    return d3Dendro
