// HOLY BAD CODE i cant be bothered to fix the svgs
export async function loadSvgIcon(filename) {
  try {

    const response = await fetch(`./svgs/${filename}`);
    let svgContent = await response.text();

    if (filename.includes("heart"))
      return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;

    svgContent = svgContent.replace(/fill="currentColor"/g, 'fill="white"');
    svgContent = svgContent.replace(/fill="[^"]*"/g, 'fill="white"');
    if (!svgContent.includes('fill=')) {
      svgContent = svgContent.replace(/<path/g, '<path fill="white"');
      svgContent = svgContent.replace(/<circle/g, '<circle fill="white"');
      svgContent = svgContent.replace(/<rect/g, '<rect fill="white"');
    }

    return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
  } catch (error) {
    console.error(`Failed to load SVG ${filename}:`, error);
    return '';
  }
}