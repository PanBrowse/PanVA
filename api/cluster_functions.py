import Levenshtein as lv
from scipy.cluster.hierarchy import linkage, to_tree
from scipy.spatial.distance import squareform
import numpy as np
import os
import tanglegram as tg


def keep(s, indices):
    return "".join(ch for i, ch in enumerate(s) if i in indices)


def load_linkage_matrix(linkage_matrix_path):
    # Skip if npy file already exists, or if csv is missing.
    if not os.path.isfile(linkage_matrix_path):
        return None
    return np.load(linkage_matrix_path)


def save_linkage_matrix(linkage_matrix_path, sequences):
    data_matrix = create_lv_matrix(
        sequences, list(range(1, len(sequences["nuc_trimmed_seq"][0]) + 1))
    )
    linkage_matrix = create_linkage_matrix(data_matrix)
    np.save(linkage_matrix_path, linkage_matrix)

    return linkage_matrix


def filtered_linkage_matrix(linkage_matrix, sequences, positions, labels):
    selected_data_matrix = create_lv_matrix(sequences, positions)
    selected_linkage_matrix = create_linkage_matrix(selected_data_matrix)

    untangled = tg.untangle(
        selected_linkage_matrix,
        linkage_matrix,
        labels,
        labels,
        method="step1side",
    )

    return untangled[0]


def create_lv_matrix(sequences, nrs_keep=None):
    seqs = sequences[["mRNA_id", "nuc_trimmed_seq"]].copy()
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


def create_linkage_matrix(data_matrix):
    # https://towardsdatascience.com/introduction-hierarchical-clustering-d3066c6b560e
    # https://www.cs.rice.edu/~ogilvie/comp571/2018/11/01/neighbor-joining.html
    # https://medium.com/geekculture/phylogenetic-trees-implement-in-python-3f9df96c0c32
    dists = squareform(data_matrix)
    return linkage(dists, "average")


def label_tree(n, labels):
    nodes = [n]

    while nodes:
        n = nodes.pop(0)

        if n["children"]:
            nodes.extend(n["children"])

        else:
            n["name"] = labels[n["node_id"]]

        # Delete the node id since we don't need it anymore and
        # it makes for cleaner JSON
        del n["node_id"]


def add_node(node, parent):
    nodes = [(node, parent)]

    while nodes:
        n, p = nodes.pop(0)

        # First create the new node and append it to its parent's children
        new_node = dict(node_id=n.id, children=[])
        p["children"].append(new_node)

        if n.left:
            nodes.append([n.left, new_node])
        if n.right:
            nodes.append([n.right, new_node])


def create_dendrogram(linkage_matrix, labels):
    dendrogram = dict(children=[])

    tree = to_tree(linkage_matrix, rd=False)
    add_node(tree, dendrogram)

    label_tree(dendrogram["children"][0], labels)

    return dendrogram
