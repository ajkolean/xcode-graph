import { defineConfig } from "vitepress";

export default defineConfig({
	title: "XcodeGraph",
	description:
		"Interactive dependency graph visualization for Tuist projects",
	base: "/xcode-graph/",
	ignoreDeadLinks: [/^\/api\//, /^\/templates\//, /^\/.claude\//],

	vue: {
		template: {
			compilerOptions: {
				isCustomElement: (tag: string) => tag.startsWith("xcode-graph-"),
			},
		},
	},

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
			{ text: "Demo", link: "/demo" },
			{ text: "Maintaining", link: "/maintaining/" },
			{ text: "Reference", link: "/reference/" },
			{ text: "API", link: "/xcode-graph/api/", target: "_self" },
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
			{ icon: "github", link: "https://github.com/ajkolean/xcode-graph" },
		],

		editLink: {
			pattern:
				"https://github.com/ajkolean/xcode-graph/edit/main/docs/:path",
		},

		search: {
			provider: "local",
		},
	},
});
