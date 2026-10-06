import os
import osmnx as ox
from app.core import config


def load_graph():
    if os.path.exists(config.GRAPH_PATH):
        return ox.load_graphml(config.GRAPH_PATH)
    os.makedirs(os.path.dirname(config.GRAPH_PATH), exist_ok=True)
    G = ox.graph_from_point(config.GRAPH_CENTER, dist=config.GRAPH_DIST, network_type="drive")
    ox.save_graphml(G, config.GRAPH_PATH)
    return G


def nearest_node(G, lat, lng):
    return ox.distance.nearest_nodes(G, lng, lat)