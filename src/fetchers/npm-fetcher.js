import axios from "axios";

export const fetchNpmPackage = async (packageName) => {
  try {
    const response = await axios.get(
      `https://api.npmjs.org/downloads/point/last-week/${packageName}`,
    );
    return {
      packageName,
      downloads: response.data.downloads,
    };
  } catch (error) {
    console.error(`Error fetching data for package ${packageName}:`, error);
    return {
      packageName,
      downloads: null,
    };
  }
};
