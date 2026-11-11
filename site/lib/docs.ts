export const SECTIONS = [
	{
		title: "Basics",
		pages: [{ title: "Hello World", href: "/docs" }],
	},
];

export const DOCS = SECTIONS.flatMap((section) => section.pages);
