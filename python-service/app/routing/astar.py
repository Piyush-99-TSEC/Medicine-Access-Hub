import heapq
from app.ranking.wsm import haversine_km


def astar(G, start, goal):
    gx, gy = G.nodes[goal]["x"], G.nodes[goal]["y"]

    def h(n):
        return haversine_km(G.nodes[n]["y"], G.nodes[n]["x"], gy, gx) * 1000

    heap = [(h(start), 0.0, start)]
    best, prev, done = {start: 0.0}, {}, set()
    while heap:
        _, cost, n = heapq.heappop(heap)
        if n in done:
            continue
        if n == goal:
            path = [n]
            while n in prev:
                n = prev[n]
                path.append(n)
            return cost, path[::-1]
        done.add(n)
        for nb, edges in G[n].items():
            new = cost + min(d.get("length", 0) for d in edges.values())
            if new < best.get(nb, float("inf")):
                best[nb], prev[nb] = new, n
                heapq.heappush(heap, (new + h(nb), new, nb))
    return None, []