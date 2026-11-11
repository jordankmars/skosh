export const SECTIONS = [
	{
		title: "Basics",
		pages: [
			{ title: "Getting Started", href: "/docs" },
			{ title: "API", href: "/docs/api" },
		],
	},
	{
		title: "Guides",
		pages: [
			{ title: "Scrubbing", href: "/docs/scrubbing" },
			{ title: "Typing", href: "/docs/typing" },
			{ title: "Styling", href: "/docs/styling" },
		],
	},
];

export const DOCS = SECTIONS.flatMap((section) => section.pages);
