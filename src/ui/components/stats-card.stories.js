/**
 * StatsCard Component Stories
 *
 * Reusable stats card component for displaying metrics.
 * Used across all right sidebar panels for consistent metric display.
 */
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
exports.AllVariants = exports.LargeNumber = exports.Highlighted = exports.Default = void 0;
var lit_1 = require('lit');
require('./stats-card');
var meta = {
  title: 'Design System/UI/StatsCard',
  component: 'graph-stats-card',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'The label text displayed above the value',
    },
    value: {
      control: 'text',
      description: 'The value to display (can be string or number)',
    },
    highlighted: {
      control: 'boolean',
      description: 'Whether to highlight the value with accent color',
    },
  },
};
exports.default = meta;
// ========================================
// Interactive Stories with Controls
// ========================================
exports.Default = {
  args: {
    label: 'Total',
    value: '42',
    highlighted: false,
  },
  render: (args) =>
    (0, lit_1.html)(
      templateObject_1 ||
        (templateObject_1 = __makeTemplateObject(
          [
            '\n    <div style="padding: 32px; background: #0a0a0f; width: 200px">\n      <graph-stats-card\n        label=',
            '\n        value=',
            '\n        ?highlighted=',
            '\n      ></graph-stats-card>\n    </div>\n  ',
          ],
          [
            '\n    <div style="padding: 32px; background: #0a0a0f; width: 200px">\n      <graph-stats-card\n        label=',
            '\n        value=',
            '\n        ?highlighted=',
            '\n      ></graph-stats-card>\n    </div>\n  ',
          ],
        )),
      args.label,
      args.value,
      args.highlighted,
    ),
};
exports.Highlighted = {
  args: {
    label: 'Selected',
    value: '10',
    highlighted: true,
  },
  render: (args) =>
    (0, lit_1.html)(
      templateObject_2 ||
        (templateObject_2 = __makeTemplateObject(
          [
            '\n    <div style="padding: 32px; background: #0a0a0f; width: 200px">\n      <graph-stats-card\n        label=',
            '\n        value=',
            '\n        ?highlighted=',
            '\n      ></graph-stats-card>\n    </div>\n  ',
          ],
          [
            '\n    <div style="padding: 32px; background: #0a0a0f; width: 200px">\n      <graph-stats-card\n        label=',
            '\n        value=',
            '\n        ?highlighted=',
            '\n      ></graph-stats-card>\n    </div>\n  ',
          ],
        )),
      args.label,
      args.value,
      args.highlighted,
    ),
};
exports.LargeNumber = {
  args: {
    label: 'Dependencies',
    value: '1,234',
    highlighted: false,
  },
  render: (args) =>
    (0, lit_1.html)(
      templateObject_3 ||
        (templateObject_3 = __makeTemplateObject(
          [
            '\n    <div style="padding: 32px; background: #0a0a0f; width: 200px">\n      <graph-stats-card\n        label=',
            '\n        value=',
            '\n        ?highlighted=',
            '\n      ></graph-stats-card>\n    </div>\n  ',
          ],
          [
            '\n    <div style="padding: 32px; background: #0a0a0f; width: 200px">\n      <graph-stats-card\n        label=',
            '\n        value=',
            '\n        ?highlighted=',
            '\n      ></graph-stats-card>\n    </div>\n  ',
          ],
        )),
      args.label,
      args.value,
      args.highlighted,
    ),
};
// ========================================
// Showcase Stories
// ========================================
exports.AllVariants = {
  tags: ['showcase'],
  name: '📚 All Variants',
  render: () =>
    (0, lit_1.html)(
      templateObject_4 ||
        (templateObject_4 = __makeTemplateObject(
          [
            '\n    <div\n      style="display: flex; gap: 16px; padding: 48px; background: #0a0a0f; flex-wrap: wrap"\n    >\n      <div style="width: 200px">\n        <graph-stats-card label="Total" value="42"></graph-stats-card>\n      </div>\n      <div style="width: 200px">\n        <graph-stats-card\n          label="Selected"\n          value="10"\n          highlighted\n        ></graph-stats-card>\n      </div>\n      <div style="width: 200px">\n        <graph-stats-card label="Dependencies" value="1,234"></graph-stats-card>\n      </div>\n      <div style="width: 200px">\n        <graph-stats-card\n          label="Active"\n          value="8"\n          highlighted\n        ></graph-stats-card>\n      </div>\n    </div>\n  ',
          ],
          [
            '\n    <div\n      style="display: flex; gap: 16px; padding: 48px; background: #0a0a0f; flex-wrap: wrap"\n    >\n      <div style="width: 200px">\n        <graph-stats-card label="Total" value="42"></graph-stats-card>\n      </div>\n      <div style="width: 200px">\n        <graph-stats-card\n          label="Selected"\n          value="10"\n          highlighted\n        ></graph-stats-card>\n      </div>\n      <div style="width: 200px">\n        <graph-stats-card label="Dependencies" value="1,234"></graph-stats-card>\n      </div>\n      <div style="width: 200px">\n        <graph-stats-card\n          label="Active"\n          value="8"\n          highlighted\n        ></graph-stats-card>\n      </div>\n    </div>\n  ',
          ],
        )),
    ),
};
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
