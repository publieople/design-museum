/**
 * feTurbulence 颗粒噪点的 data URI。
 *
 * 两个容易踩的点都写在这里：
 * - baseFrequency 是 1/颗粒直径，0.5–0.9 才是胶片颗粒，再小就变成云；
 * - feTurbulence 连 alpha 通道都是随机值，不补一个 saturate 0 的 feColorMatrix，
 *   叠上去会发彩、还会发虚（词条 prompt 里也照这个写）。
 */
export function noiseUrl(frequency: number) {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">' +
    '<filter id="dm-grain">' +
    `<feTurbulence type="fractalNoise" baseFrequency="${frequency}" numOctaves="3" stitchTiles="stitch"/>` +
    '<feColorMatrix type="saturate" values="0"/>' +
    '</filter>' +
    '<rect width="100%" height="100%" filter="url(#dm-grain)"/>' +
    '</svg>'
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}
