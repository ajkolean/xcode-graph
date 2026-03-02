import path from "node:path";
import { defineConfig } from "vitepress";
import typedocSidebar from "../api/typedoc-sidebar.json";

const root = path.resolve(__dirname, "../..");

export default defineConfig({
	title: "XcodeGraph",
	description:
		"Interactive dependency graph visualization for Xcode projects",
	base: "/xcode-graph/",
	ignoreDeadLinks: [/^\/api\//, /^\/templates\//, /^\/.claude\//],

	vue: {
		template: {
			compilerOptions: {
				isCustomElement: (tag: string) => tag.startsWith("xcode-graph-"),
			},
		},
	},

	vite: {
		resolve: {
			alias: {
				"@/": `${path.resolve(root, "src")}/`,
				"@components/": `${path.resolve(root, "src/components")}/`,
				"@graph/": `${path.resolve(root, "src/graph")}/`,
				"@ui/": `${path.resolve(root, "src/ui")}/`,
				"@shared/": `${path.resolve(root, "src/shared")}/`,
			},
		},
	},

	head: [
		["link", { rel: "icon", type: "image/x-icon", href: "/xcode-graph/favicon.ico" }],
		["link", { rel: "icon", type: "image/png", sizes: "32x32", href: "/xcode-graph/favicon-32x32.png" }],
		["link", { rel: "icon", type: "image/png", sizes: "16x16", href: "/xcode-graph/favicon-16x16.png" }],
		["link", { rel: "apple-touch-icon", sizes: "180x180", href: "/xcode-graph/apple-touch-icon.png" }],
		["link", { rel: "manifest", href: "/xcode-graph/site.webmanifest" }],
		[
			"meta",
			{
				name: "og:description",
				content:
					"Interactive dependency graph visualization for Xcode projects",
			},
		],
	],

	themeConfig: {
		logo: "/xcode-graph-icon.png",

		nav: [
			{ text: "Guide", link: "/guide/" },
			{ text: "Demo", link: "/demo" },
			{ text: "Maintaining", link: "/maintaining/" },
			{ text: "Reference", link: "/reference/" },
			{ text: "API", link: "/api/" },
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
					],
				},
			],
			"/reference/": [
				{
					text: "Reference",
					items: [
						{ text: "Overview", link: "/reference/" },
						{
							text: "Component API",
							link: "/reference/component-api",
						},
						{
							text: "Data Types",
							link: "/reference/data-types",
						},
						{
							text: "Layout Configuration",
							link: "/reference/layout-configuration",
						},
					],
				},
			],
			"/api/": typedocSidebar,
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
