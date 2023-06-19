import { takeScreenshot } from "@/app/lib/screenshots";
import { NextResponse } from "next/server";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 628,
};

export const contentType = "image/webp";

export default async function Image({
  params: { name, coordinates },
}: {
  params: { name: string; coordinates: string };
}) {
  const url = `https://diablo4.th.gl/embed/nodes/${name}/${coordinates}`;
  const screenshot = await takeScreenshot(url);
  const response = new NextResponse(screenshot, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, stale-while-revalidate",
    },
  });
  return response;
}
