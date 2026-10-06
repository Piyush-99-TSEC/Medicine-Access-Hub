import networkx as nx
from app.routing.astar import astar


def build():
    G = nx.MultiDiGraph()
    for n, (y, x) in {1: (0, 0), 2: (0, 0.01), 3: (0.01, 0.01), 4: (0.01, 0)}.items():
        G.add_node(n, x=x, y=y)
    for a, b, length in [(1, 2, 1200), (2, 3, 1200), (1, 4, 3000), (4, 3, 1200)]:
        G.add_edge(a, b, length=length)
        G.add_edge(b, a, length=length)
    return G


def test_shortest_path():
    cost, path = astar(build(), 1, 3)
    assert path == [1, 2, 3] and cost == 2400


def test_no_route():
    G = build()
    G.add_node(9, x=1, y=1)
    assert astar(G, 1, 9) == (None, [])