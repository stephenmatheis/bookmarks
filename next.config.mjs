/** @type {import('next').NextConfig} */
const nextConfig = {
    pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
    reactStrictMode: true,
    sassOptions: {
        silenceDeprecations: ['legacy-js-api'],
        logger: {
            /**
             * @param {string} message
             */
            warn(message) {
                console.warn(message);
            },
            /**
             * @param {string} message
             */
            debug(message) {
                console.log(message);
            },
        },
    },
};

export default nextConfig;
