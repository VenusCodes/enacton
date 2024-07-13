/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // add third party domain to allow access to fetch assets and other things.
    domains: ["loremflickr.com", "i.ibb.co"],
    // remotePatterns: [
    //   {
    //     protocol: "https",
    //     hostname: "loremflickr.com",
    //     port: "",
    //     pathname: "/*",
    //   },
    // ],
  },
};

export default nextConfig;
