/**
 * StatsCard Lit Component - Mission Control Theme
 *
 * Reusable stats card component for displaying metrics.
 * Features bold left accent border, noise texture, and monospace typography.
 *
 * @example
 * ```html
 * <graph-stats-card label="Total" value="42"></graph-stats-card>
 * <graph-stats-card label="Selected" value="10" highlighted></graph-stats-card>
 * ```
 */
var __extends =
  (this && this.__extends) ||
  (() => {
    var extendStatics = (d, b) => {
      extendStatics =
        Object.setPrototypeOf ||
        (Array.isArray({ __proto__: [] }) &&
          ((d, b) => {
            d.__proto__ = b;
          })) ||
        ((d, b) => {
          for (var p in b) if (Object.hasOwn(b, p)) d[p] = b[p];
        });
      return extendStatics(d, b);
    };
    return (d, b) => {
      if (typeof b !== 'function' && b !== null)
        throw new TypeError(`Class extends value ${String(b)} is not a constructor or null`);
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
    };
  })();
var __makeTemplateObject =
  (this && this.__makeTemplateObject) ||
  ((cooked, raw) => {
    if (Object.defineProperty) {
      Object.defineProperty(cooked, 'raw', { value: raw });
    } else {
      cooked.raw = raw;
    }
    return cooked;
  });
Object.defineProperty(exports, '__esModule', { value: true });
exports.GraphStatsCard = void 0;
var lit_1 = require('lit');
var GraphStatsCard = /** @class */ ((_super) => {
  __extends(GraphStatsCard, _super);
  function GraphStatsCard() {
    return _super?.apply(this, arguments) || this;
  }
  // ========================================
  // Render
  // ========================================
  GraphStatsCard.prototype.render = function () {
    return (0, lit_1.html)(
      templateObject_1 ||
        (templateObject_1 = __makeTemplateObject(
          [
            '\n      <div class="container ',
            '">\n        <div class="label">',
            '</div>\n        <div class="value ',
            '">\n          ',
            '\n        </div>\n      </div>\n    ',
          ],
          [
            '\n      <div class="container ',
            '">\n        <div class="label">',
            '</div>\n        <div class="value ',
            '">\n          ',
            '\n        </div>\n      </div>\n    ',
          ],
        )),
      this.highlighted ? 'highlighted' : '',
      this.label,
      this.highlighted ? 'highlighted' : '',
      this.value,
    );
  };
  // ========================================
  // Styles
  // ========================================
  GraphStatsCard.styles = (0, lit_1.css)(
    templateObject_2 ||
      (templateObject_2 = __makeTemplateObject(
        [
          "\n    :host {\n      display: block;\n      flex: 1;\n    }\n\n    .container {\n      position: relative;\n      padding: var(--spacing-3) var(--spacing-md);\n      border-radius: var(--radii-sm);\n      background: var(--gradient-card);\n      border: var(--border-widths-thin) solid var(--colors-border);\n      border-left: var(--border-widths-thick) solid var(--colors-primary);\n      cursor: default;\n      transition:\n        transform var(--durations-normal) var(--easings-out),\n        box-shadow var(--durations-normal) var(--easings-out),\n        border-color var(--durations-normal) var(--easings-out);\n      overflow: hidden;\n    }\n\n    /* Noise texture overlay */\n    .container::before {\n      content: '';\n      position: absolute;\n      inset: 0;\n      background-image: var(--effect-noise);\n      opacity: var(--opacity-4);\n      pointer-events: none;\n      border-radius: inherit;\n    }\n\n    .container:hover {\n      transform: translateY(-2px);\n      box-shadow: var(--shadows-glow-primary);\n      border-left-color: var(--colors-primary);\n    }\n\n    .container.highlighted {\n      border-left-color: var(--colors-accent);\n    }\n\n    .container.highlighted:hover {\n      box-shadow: var(--shadows-glow-accent);\n    }\n\n    .label {\n      position: relative;\n      font-family: var(--fonts-mono);\n      font-size: var(--font-sizes-xs);\n      font-weight: var(--font-weights-medium);\n      letter-spacing: var(--letter-spacing-wider);\n      text-transform: uppercase;\n      color: var(--colors-primary);\n      opacity: var(--opacity-80);\n      margin-bottom: var(--spacing-1);\n    }\n\n    .container.highlighted .label {\n      color: var(--colors-accent);\n    }\n\n    .value {\n      position: relative;\n      font-family: var(--fonts-heading);\n      font-size: var(--font-sizes-h1);\n      font-weight: var(--font-weights-medium);\n      font-variant-numeric: tabular-nums;\n      color: var(--colors-foreground);\n      line-height: var(--line-heights-none);\n    }\n\n    .value.highlighted {\n      color: var(--colors-accent);\n      text-shadow: 0 0 20px rgba(var(--colors-accent-rgb), var(--opacity-40));\n    }\n\n    /* Subtle scan line effect */\n    .container::after {\n      content: '';\n      position: absolute;\n      inset: 0;\n      background: var(--effect-scanlines);\n      pointer-events: none;\n      border-radius: inherit;\n    }\n  ",
        ],
        [
          "\n    :host {\n      display: block;\n      flex: 1;\n    }\n\n    .container {\n      position: relative;\n      padding: var(--spacing-3) var(--spacing-md);\n      border-radius: var(--radii-sm);\n      background: var(--gradient-card);\n      border: var(--border-widths-thin) solid var(--colors-border);\n      border-left: var(--border-widths-thick) solid var(--colors-primary);\n      cursor: default;\n      transition:\n        transform var(--durations-normal) var(--easings-out),\n        box-shadow var(--durations-normal) var(--easings-out),\n        border-color var(--durations-normal) var(--easings-out);\n      overflow: hidden;\n    }\n\n    /* Noise texture overlay */\n    .container::before {\n      content: '';\n      position: absolute;\n      inset: 0;\n      background-image: var(--effect-noise);\n      opacity: var(--opacity-4);\n      pointer-events: none;\n      border-radius: inherit;\n    }\n\n    .container:hover {\n      transform: translateY(-2px);\n      box-shadow: var(--shadows-glow-primary);\n      border-left-color: var(--colors-primary);\n    }\n\n    .container.highlighted {\n      border-left-color: var(--colors-accent);\n    }\n\n    .container.highlighted:hover {\n      box-shadow: var(--shadows-glow-accent);\n    }\n\n    .label {\n      position: relative;\n      font-family: var(--fonts-mono);\n      font-size: var(--font-sizes-xs);\n      font-weight: var(--font-weights-medium);\n      letter-spacing: var(--letter-spacing-wider);\n      text-transform: uppercase;\n      color: var(--colors-primary);\n      opacity: var(--opacity-80);\n      margin-bottom: var(--spacing-1);\n    }\n\n    .container.highlighted .label {\n      color: var(--colors-accent);\n    }\n\n    .value {\n      position: relative;\n      font-family: var(--fonts-heading);\n      font-size: var(--font-sizes-h1);\n      font-weight: var(--font-weights-medium);\n      font-variant-numeric: tabular-nums;\n      color: var(--colors-foreground);\n      line-height: var(--line-heights-none);\n    }\n\n    .value.highlighted {\n      color: var(--colors-accent);\n      text-shadow: 0 0 20px rgba(var(--colors-accent-rgb), var(--opacity-40));\n    }\n\n    /* Subtle scan line effect */\n    .container::after {\n      content: '';\n      position: absolute;\n      inset: 0;\n      background: var(--effect-scanlines);\n      pointer-events: none;\n      border-radius: inherit;\n    }\n  ",
        ],
      )),
  );
  return GraphStatsCard;
})(lit_1.LitElement);
exports.GraphStatsCard = GraphStatsCard;
// Register custom element with HMR support
if (!customElements.get('graph-stats-card')) {
  customElements.define('graph-stats-card', GraphStatsCard);
}
var templateObject_1, templateObject_2;
