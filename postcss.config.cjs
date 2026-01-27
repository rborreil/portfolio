module.exports = (ctx) => ({
  plugins: [
    require("autoprefixer"),
    ...(ctx.env === "production" ? [require("cssnano")] : []),
  ],
});
