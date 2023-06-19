"use client";
import { useOverwolfRouter } from "@/app/(overwolf)/components/overwolf-router";
import { ICONS, SPAWN_ICONS } from "@/app/lib/icons";
import nodes, { getID } from "@/app/lib/nodes";
import spawnNodes from "@/app/lib/spawn-nodes";
import {
  useDiscoveredNodesStore,
  useGlobalSettingsStore,
} from "@/app/lib/storage";
import { getTerritoryByPoint } from "@/app/lib/territories";
import leaflet from "leaflet";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useDict } from "../(i18n)/i18n-provider";
import useFilters from "../use-filters";
import CanvasMarker from "./canvas-marker";
import { useMap } from "./map";

export default function Nodes() {
  const map = useMap();
  const router = useOverwolfRouter();
  const params = useParams();
  const [groups, setGroups] = useState<leaflet.LayerGroup[]>([]);
  const searchParams = useSearchParams();
  const { discoveredNodes, markDiscoveredNode, unmarkDiscoveredNode } =
    useDiscoveredNodesStore();
  const isOverwolf = "value" in router;
  const search = useMemo(() => {
    return (
      (isOverwolf ? router.value.search : searchParams.get("search")) ?? ""
    ).toLowerCase();
  }, [searchParams, isOverwolf && router.value.search]);
  const dict = useDict();
  const iconSize = useGlobalSettingsStore((state) => state.iconSize);

  const paramsName = isOverwolf ? router.value.name : params.name;
  const paramsCoordinates = isOverwolf
    ? router.value.coordinates
    : params.coordinates;
  const [filters] = useFilters();

  const selectedName = paramsName && decodeURIComponent(paramsName);
  const coordinates =
    (paramsCoordinates && decodeURIComponent(paramsCoordinates))
      ?.replace("@", "")
      .split(",")
      .map(Number) ?? [];

  useEffect(() => {
    const groups: leaflet.LayerGroup[] = [];
    Object.entries(nodes).forEach(([_type, items]) => {
      const type = _type as keyof typeof nodes;
      const group = leaflet.layerGroup();
      group.addTo(map);

      items.forEach((item) => {
        const icon = ICONS[type];
        let isHighlighted = false;
        let isTrivial = false;

        if (selectedName && coordinates) {
          isHighlighted =
            item.name === selectedName &&
            item.x === coordinates[0] &&
            item.y === coordinates[1];
        }

        if (!filters.includes(type) && !isHighlighted) {
          isTrivial = true;
        } else if (search && !isHighlighted) {
          isTrivial = !(
            item.name.toLowerCase().includes(search) ||
            dict.nodes[type].toLowerCase().includes(search) ||
            ("attribute" in item &&
              item.attribute.toLowerCase().includes(search))
          );
        }
        const id = getID(item, type);
        let isDiscovered = discoveredNodes.includes(id);

        const attribute = "attribute" in item ? item.attribute : undefined;
        const marker = new CanvasMarker([item.x, item.y], {
          id,
          type,
          attribute,
          name: item.name,
          icon,
          radius: icon.radius * iconSize,
          isTrivial,
          isHighlighted,
          isDiscovered,
          interactive: !isTrivial,
        });

        marker.on("click", () => {
          if (location.pathname.startsWith("/embed")) {
            return;
          }
          if ("update" in router) {
            router.update({
              name: encodeURIComponent(item.name),
              coordinates: `@${item.x},${item.y}`,
            });
          } else {
            router.push(
              `${params.lang ?? ""}/nodes/${encodeURIComponent(item.name)}/@${
                item.x
              },${item.y}${location.search}`
            );
          }
        });

        let lastDiscoveredButton: HTMLButtonElement | undefined;
        marker.on("contextmenu", () => {
          if (isDiscovered) {
            unmarkDiscoveredNode(id);
            if (lastDiscoveredButton) {
              lastDiscoveredButton.innerText = "Mark as discovered";
            }
          } else {
            markDiscoveredNode(id);
            if (lastDiscoveredButton) {
              lastDiscoveredButton.innerText = "Unmark as discovered";
            }
          }
          isDiscovered = !isDiscovered;
        });
        const tooltipContent = () => {
          const territory = getTerritoryByPoint([item.x, item.y]);
          const attributeColor =
            "attribute" in icon && attribute && icon.attribute(attribute);
          let tooltipContent = `<p class="font-bold text-base">${item.name}</p><p class="text-gray-300 text-sm">${dict.nodes[type]}</p>`;
          if (territory) {
            tooltipContent += `<p class="text-amber-50 text-sm">${
              dict.territories[territory.id]
            }</p>`;
          }
          if ("description" in item) {
            tooltipContent += `<p class="border-t border-t-gray-700 mt-2 pt-2">${
              attributeColor
                ? `<div class="inline-block w-2 h-2 rounded-full mr-1" style="background: ${attributeColor}"></div>`
                : ""
            }${item.description}</p>`;
          }
          const div = document.createElement("div");
          div.innerHTML = tooltipContent;
          lastDiscoveredButton = document.createElement("button");
          lastDiscoveredButton.className =
            "mt-2 py-1 px-2 bg-neutral-900 rounded uppercase hide-on-print";
          lastDiscoveredButton.innerText = isDiscovered
            ? "Unmark as discovered"
            : "Mark as discovered";
          lastDiscoveredButton.onclick = () => {
            if (isDiscovered) {
              unmarkDiscoveredNode(id);
              if (lastDiscoveredButton) {
                lastDiscoveredButton.innerText = "Mark as discovered";
              }
            } else {
              markDiscoveredNode(id);
              if (lastDiscoveredButton) {
                lastDiscoveredButton.innerText = "Unmark as discovered";
              }
            }
            isDiscovered = !isDiscovered;
          };
          div.append(lastDiscoveredButton);
          const note = document.createElement("p");
          note.className = "text-gray-300 text-xs italic mt-2 hide-on-print";
          note.innerHTML = "Right click to toggle discovered";

          div.append(note);
          return div;
        };
        marker.bindTooltip(tooltipContent, {
          permanent: isHighlighted,
          interactive: isHighlighted,
          direction: "top",
          offset: [0, -icon.radius * iconSize],
        });

        marker.addTo(group);
        if (isHighlighted && !search) {
          map.setView(marker.getLatLng(), 5);
        }
      });

      groups.push(group);
    });
    Object.entries(spawnNodes).forEach(([_type, items]) => {
      const type = _type as keyof typeof spawnNodes;
      const group = leaflet.layerGroup();
      group.addTo(map);

      items.forEach((item) => {
        let isHighlighted = false;
        if (selectedName && coordinates) {
          isHighlighted =
            item.x === coordinates[0] && item.y === coordinates[1];
        }

        const icon = SPAWN_ICONS[type];
        const marker = new CanvasMarker([item.x, item.y], {
          id: item.id,
          type,
          name: type,
          icon,
          radius: icon.radius * iconSize,
        });
        const tooltipContent = () => {
          const territory = getTerritoryByPoint([item.x, item.y]);

          let tooltipContent = `<p class="text-gray-300 text-sm">${dict.nodes[type]}</p>`;
          if (territory) {
            tooltipContent += `<p class="text-amber-50 text-sm">${
              dict.territories[territory.id]
            }</p>`;
          }
          tooltipContent += `<p class="border-t border-t-gray-700 pt-2 text-gray-300 text-xs italic mt-2">This node spawns based on events</p>`;
          return tooltipContent;
        };

        marker.bindTooltip(tooltipContent, {
          direction: "top",
          offset: [0, -icon.radius * iconSize],
        });

        marker.on("click", () => {
          if (location.pathname.startsWith("/embed")) {
            return;
          }
          if ("update" in router) {
            router.update({
              name: encodeURIComponent(type),
              coordinates: `@${item.x},${item.y}`,
            });
          } else {
            router.push(
              `${params.lang ?? ""}/nodes/${encodeURIComponent(type)}/@${
                item.x
              },${item.y}${location.search}`
            );
          }
        });

        marker.addTo(group);
        if (isHighlighted && !search) {
          map.setView(marker.getLatLng(), 5);
        }
      });
      groups.push(group);
    });

    groups.forEach((group) => {
      group.eachLayer((layer) => {
        const marker = layer as CanvasMarker;
        if (marker.options.isHighlighted) {
          marker.bringToFront();
        }
      });
    });
    setGroups(groups);

    return () => {
      groups.forEach((group) => {
        group.remove();
      });
    };
  }, [dict]);

  useEffect(() => {
    const highlightedGroup = new leaflet.FeatureGroup();

    groups.forEach((group) => {
      group.eachLayer((layer) => {
        const marker = layer as CanvasMarker;
        let isHighlighted = false;
        let isTrivial = false;

        if (selectedName && coordinates) {
          const latLng = marker.getLatLng();
          isHighlighted =
            marker.options.name === selectedName &&
            latLng.lat === coordinates[0] &&
            latLng.lng === coordinates[1];
        }
        if (!filters.includes(marker.options.type) && !isHighlighted) {
          isTrivial = true;
        } else if (search && !isHighlighted) {
          isTrivial = !(
            marker.options.name.toLowerCase().includes(search) ||
            dict.nodes[marker.options.type].toLowerCase().includes(search) ||
            marker.options.attribute?.toLowerCase().includes(search)
          );
          if (!isTrivial) {
            highlightedGroup.addLayer(marker);
          }
        }
        const radius = marker.getRadius();
        const newRadius = marker.options.icon.radius * iconSize;
        if (
          isHighlighted !== marker.options.isHighlighted ||
          radius !== newRadius
        ) {
          if (isHighlighted) {
            marker.bringToFront();
            const tooltipContent = marker.getTooltip()!.getContent()!;
            marker.unbindTooltip();
            marker.bindTooltip(tooltipContent, {
              permanent: true,
              interactive: true,
              direction: "top",
              offset: [0, -marker.options.icon.radius * iconSize],
            });
            marker.openTooltip();
          } else {
            const tooltipContent = marker.getTooltip()!.getContent()!;
            marker.unbindTooltip();
            marker.bindTooltip(tooltipContent, {
              permanent: false,
              interactive: false,
              direction: "top",
              offset: [0, -marker.options.icon.radius * iconSize],
            });
          }
        }
        if (isTrivial !== marker.options.isTrivial) {
          if (isTrivial && marker.isTooltipOpen()) {
            marker.closeTooltip();
          }
          marker.setStyle({ interactive: !isTrivial });
        }
        const isDiscovered = discoveredNodes.includes(marker.options.id);

        if (
          isHighlighted === marker.options.isHighlighted &&
          isTrivial === marker.options.isTrivial &&
          isDiscovered === marker.options.isDiscovered &&
          radius === newRadius
        ) {
          return;
        }
        marker.options.isHighlighted = isHighlighted;
        marker.options.isTrivial = isTrivial;
        marker.options.isDiscovered = isDiscovered;
        if (radius !== newRadius) {
          marker.setRadius(marker.options.icon.radius * iconSize);
        }
        marker.update();
      });
    });

    const bounds = highlightedGroup.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(highlightedGroup.getBounds(), {
        duration: 1,
        maxZoom: 5,
      });
    }
  }, [
    groups,
    search,
    filters,
    discoveredNodes,
    iconSize,
    selectedName && coordinates,
  ]);

  return <></>;
}
