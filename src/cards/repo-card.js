// @ts-check
import { Card } from "../common/Card.js";
import { I18n } from "../common/I18n.js";
import { icons } from "../common/icons.js";
import {
  encodeHTML,
  flexLayout,
  getCardColors,
  kFormatter,
  measureText,
  parseEmojis,
  wrapTextMultiline,
  iconWithLabel,
  createLanguageNode,
  clampValue,
} from "../common/utils.js";
import { repoCardLocales } from "../translations.js";

const ICON_SIZE = 16;
const DESCRIPTION_LINE_WIDTH = 59;
const DESCRIPTION_MAX_LINES = 3;

/**
 * Retrieves the repository description and wraps it to fit the card width.
 *
 * @param {string} label The repository description.
 * @param {string} textColor The color of the text.
 * @returns {string} Wrapped repo description SVG object.
 */
const getBadgeSVG = (label, textColor) => `
  <g data-testid="badge" class="badge" transform="translate(320, -18)">
    <rect stroke="${textColor}" stroke-width="1" width="70" height="20" x="-12" y="-14" ry="10" rx="10"></rect>
    <text
      x="23" y="-5"
      alignment-baseline="central"
      dominant-baseline="central"
      text-anchor="middle"
      fill="${textColor}"
    >
      ${label}
    </text>
  </g>
`;

/**
 * @typedef {import("../fetchers/types").RepositoryData} RepositoryData Repository data.
 * @typedef {import("./types").RepoCardOptions} RepoCardOptions Repo card options.
 */

/**
 * Renders repository card details.
 *
 * @param {RepositoryData} repo Repository data.
 * @param {Partial<RepoCardOptions>} options Card options.
 * @returns {string} Repository card SVG object.
 */
const renderRepoCard = (repo, options = {}) => {
  const {
    name,
    nameWithOwner,
    description,
    primaryLanguage,
    isArchived,
    isTemplate,
    starCount,
    forkCount,
  } = repo;
  const {
    hide_border = false,
    title_color,
    icon_color,
    text_color,
    bg_color,
    show_owner = false,
    theme = "default_repocard",
    border_radius,
    border_color,
    locale,
    description_lines_count,
  } = options;

  const lineHeight = 10;
  const header = show_owner ? nameWithOwner : name;
  const langName = (primaryLanguage && primaryLanguage.name) || "Unspecified";
  const langColor = (primaryLanguage && primaryLanguage.color) || "#333";
  const descriptionMaxLines = description_lines_count
    ? clampValue(description_lines_count, 1, DESCRIPTION_MAX_LINES)
    : DESCRIPTION_MAX_LINES;

  const desc = parseEmojis(description || "No description provided");
  const multiLineDescription = wrapTextMultiline(
    desc,
    DESCRIPTION_LINE_WIDTH,
    descriptionMaxLines,
  );
  const descriptionLinesCount = description_lines_count
    ? clampValue(description_lines_count, 1, DESCRIPTION_MAX_LINES)
    : multiLineDescription.length;

  const descriptionSvg = multiLineDescription
    .map((line) => `<tspan dy="1.2em" x="25">${encodeHTML(line)}</tspan>`)
    .join("");

  const height =
    (descriptionLinesCount > 1 ? 120 : 110) +
    descriptionLinesCount * lineHeight;

  const i18n = new I18n({
    locale,
    translations: repoCardLocales,
  });

  // returns theme based colors with proper overrides and defaults
  const colors = getCardColors({
    title_color,
    icon_color,
    text_color,
    bg_color,
    border_color,
    theme,
  });

  const svgLanguage = primaryLanguage
    ? createLanguageNode(langName, langColor)
    : "";

  const totalStars = kFormatter(starCount);
  const totalForks = kFormatter(forkCount);
  const svgStars = iconWithLabel(
    icons.star,
    totalStars,
    "stargazers",
    ICON_SIZE,
  );
  const svgForks = iconWithLabel(
    icons.fork,
    totalForks,
    "forkcount",
    ICON_SIZE,
  );

  const starAndForkCount = flexLayout({
    items: [svgLanguage, svgStars, svgForks],
    sizes: [
      measureText(langName, 12),
      ICON_SIZE + measureText(`${totalStars}`, 12),
      ICON_SIZE + measureText(`${totalForks}`, 12),
    ],
    gap: 25,
  }).join("");

  const card = new Card({
    defaultTitle: header.length > 35 ? `${header.slice(0, 35)}...` : header,
    titlePrefixIcon: icons.contribs,
    width: 400,
    height,
    border_radius,
    colors,
  });

  card.disableAnimations();
  card.setHideBorder(hide_border);
  card.setHideTitle(false);
  card.setCSS(`
    .description { font: 400 13px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${colors.textColor} }
    .gray { font: 400 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${colors.textColor} }
    .icon { fill: ${colors.iconColor} }
    .badge { font: 600 11px 'Segoe UI', Ubuntu, Sans-Serif; }
    .badge rect { opacity: 0.2 }
  `);

  return name === "react-fast-hooks"
    ? card.render(`
    ${
      isTemplate
        ? // @ts-ignore
          getBadgeSVG(i18n.t("repocard.template"), colors.textColor)
        : isArchived
          ? // @ts-ignore
            getBadgeSVG(i18n.t("repocard.archived"), colors.textColor)
          : ""
    }

    <text class="description" x="25" y="-5">
      ${descriptionSvg}
    </text>


 <g xmlns="http://www.w3.org/2000/svg" transform="translate(30, 65)">
    <g transform="translate(0, 0)">
        <g data-testid="primary-lang">
            <circle data-testid="lang-color" cx="0" cy="-5" r="6" fill="${langColor}" />
            <text data-testid="lang-name" class="gray" x="15">${langName}</text>
        </g>
    </g>
    <g transform="translate(82.24375, 0)">
        <g transform="translate(0, 0)">
            <svg class="icon" y="-12" viewBox="0 0 16 16" version="1.1" width="16" height="16">
                <path fill-rule="evenodd"
                    d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z" />
            </svg>
        </g>
        <g transform="translate(20, 0)">
            <text data-testid="stargazers" class="gray">${totalStars}</text>
        </g>
    </g>
    <g transform="translate(136.55625, 0)">
        <g transform="translate(0, 0)">
            <svg class="icon" y="-12" viewBox="0 0 16 16" version="1.1" width="16" height="16">
                <path fill-rule="evenodd"
                    d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z" />
            </svg>
        </g>
        <g transform="translate(20, 0)">
            <text data-testid="forkcount" class="gray">${totalForks}</text>
        </g>
    </g>
    <g transform="translate(184.2125, 0)">
        <g transform="translate(0, 0)">
            <svg class="icon" y="-12" viewBox="0 0 16 16" version="1.1" width="16" height="16">
                undefined
            </svg>
        </g>
        <g transform="translate(-8, -15)">
            <image
                href="https://packagephobia.com/badge?p=react-fast-hooks"
                clip-path="url(#clip)"
            />
        </g>
    </g>
    <g transform="translate(200, -100)">
        <image
            href="https://img.shields.io/npm/dw/react-fast-hooks.svg?label=Downloads"
            clip-path="url(#clip)"
        />
    </g>

</g>
   
   
    
  `)
    : card.render(`
    ${
      isTemplate
        ? // @ts-ignore
          getBadgeSVG(i18n.t("repocard.template"), colors.textColor)
        : isArchived
          ? // @ts-ignore
            getBadgeSVG(i18n.t("repocard.archived"), colors.textColor)
          : ""
    }

    <text class="description" x="25" y="-5">
      ${descriptionSvg}
    </text>

    <g transform="translate(30, ${height - 75})">
      ${starAndForkCount}
    </g>
  `);
};

export { renderRepoCard };
export default renderRepoCard;
