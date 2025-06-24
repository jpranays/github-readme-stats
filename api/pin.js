import { renderRepoCard } from "../src/cards/repo-card.js";
import { blacklist } from "../src/common/blacklist.js";
import {
  clampValue,
  CONSTANTS,
  parseBoolean,
  renderError,
} from "../src/common/utils.js";
import { fetchNpmPackage } from "../src/fetchers/npm-fetcher.js";
import { fetchRepo } from "../src/fetchers/repo-fetcher.js";
import { isLocaleAvailable } from "../src/translations.js";

export default async (req, res) => {
  const {
    username,
    repo,
    hide_border,
    title_color,
    icon_color,
    text_color,
    bg_color,
    theme,
    show_owner,
    cache_seconds,
    locale,
    border_radius,
    border_color,
    description_lines_count,
    npm_package,
    hide_forks,
  } = req.query;

  res.setHeader("Content-Type", "image/svg+xml");

  if (blacklist.includes(username)) {
    return res.send(
      renderError("Something went wrong", "This username is blacklisted", {
        title_color,
        text_color,
        bg_color,
        border_color,
        theme,
      }),
    );
  }

  if (locale && !isLocaleAvailable(locale)) {
    return res.send(
      renderError("Something went wrong", "Language not found", {
        title_color,
        text_color,
        bg_color,
        border_color,
        theme,
      }),
    );
  }

  try {
    const repoData = await fetchRepo(username, repo);
    let downloads = null;

    if (npm_package) {
      const { downloads: npmDownloads } = await fetchNpmPackage(npm_package);
      downloads = npmDownloads;
    }

    let cacheSeconds = clampValue(
      parseInt(cache_seconds || CONSTANTS.CARD_CACHE_SECONDS, 10),
      CONSTANTS.TWELVE_HOURS,
      CONSTANTS.TWO_DAY,
    );
    cacheSeconds = process.env.CACHE_SECONDS
      ? parseInt(process.env.CACHE_SECONDS, 10) || cacheSeconds
      : cacheSeconds;

    res.setHeader(
      "Cache-Control",
      `max-age=${cacheSeconds}, s-maxage=${cacheSeconds}, stale-while-revalidate=${CONSTANTS.ONE_DAY}`,
    );

    return res.send(
      renderRepoCard(
        {
          ...repoData,
          downloads,
        },
        {
          hide_border: parseBoolean(hide_border),
          title_color,
          icon_color,
          text_color,
          bg_color,
          theme,
          border_radius,
          border_color,
          show_owner: parseBoolean(show_owner),
          locale: locale ? locale.toLowerCase() : null,
          description_lines_count,
          hide_forks: parseBoolean(hide_forks),
        },
      ),
    );
  } catch (err) {
    res.setHeader(
      "Cache-Control",
      `max-age=${CONSTANTS.ERROR_CACHE_SECONDS / 2}, s-maxage=${
        CONSTANTS.ERROR_CACHE_SECONDS
      }, stale-while-revalidate=${CONSTANTS.ONE_DAY}`,
    ); // Use lower cache period for errors.
    return res.send(
      renderError(err.message, err.secondaryMessage, {
        title_color,
        text_color,
        bg_color,
        border_color,
        theme,
      }),
    );
  }
};
