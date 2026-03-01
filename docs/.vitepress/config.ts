import { defineConfig } from "vitepress";

export default defineConfig({
	title: "XcodeGraph",
	description:
		"Interactive dependency graph visualization for Tuist projects",
	base: "/xcodegrapher/",
	ignoreDeadLinks: [/^\/api\//, /^\/templates\//, /^\/.claude\//],

	head: [
		[
			"meta",
			{
				name: "og:description",
				content:
					"Interactive dependency graph visualization for Tuist projects",
			},
		],
	],

	themeConfig: {
		nav: [
			{ text: "Guide", link: "/guide/" },
			{ text: "Maintaining", link: "/maintaining/" },
			{ text: "Reference", link: "/reference/" },
			{ text: "API", link: "/xcodegrapher/api/", target: "_self" },
		],

		sidebar: {
			"/guide/": [
				{
					text: "Guide",
					items: [
						{ text: "Getting Started", link: "/guide/" },
						{
							text: "Swift Integration",
							link: "/guide/swift-integration",
						},
					],
				},
			],
			"/maintaining/": [
				{
					text: "Maintaining",
					items: [
						{ text: "Overview", link: "/maintaining/" },
						{ text: "Versioning", link: "/maintaining/versioning" },
						{
							text: "Migration Guide",
							link: "/maintaining/migration-guide",
						},
					],
				},
			],
			"/reference/": [
				{
					text: "Reference",
					items: [
						{ text: "Overview", link: "/reference/" },
						{
							text: "Layout Algorithm",
							link: "/reference/layout-algorithm",
						},
					],
				},
			],
		},

		socialLinks: [
			{ icon: "github", link: "https://github.com/ajkolean/xcodegrapher" },
		],

		editLink: {
			pattern:
				"https://github.com/ajkolean/xcodegrapher/edit/main/docs/:path",
		},

		search: {
			provider: "local",
		},
	},
});
