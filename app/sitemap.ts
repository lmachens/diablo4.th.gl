import { MetadataRoute } from "next";
import nodes from "./lib/nodes";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const nodesMap = Object.values(nodes).flatMap((items) => {
    return items.map((node) => ({
      url: `https://diablo4.th.gl/nodes/${encodeURIComponent(node.name)}/@${
        node.x
      },${node.y}`,
      lastModified: now,
    }));
  });

  return [
    {
      url: "https://diablo4.th.gl",
      lastModified: now,
    },
    ...nodesMap,
  ];
}
