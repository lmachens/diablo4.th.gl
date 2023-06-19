/**
 * @type {import('next').NextConfig}
 */
const nextConfig =
  process.env.TARGET === "overwolf"
    ? {
        output: "export",
      }
    : {
        headers: async () => [
          {
            source: "/map/:all*(webp)",
            headers: [
              {
                key: "Cache-Control",
                value: "public, max-age=31536000, stale-while-revalidate",
              },
            ],
          },
        ],
      };

module.exports = nextConfig;
