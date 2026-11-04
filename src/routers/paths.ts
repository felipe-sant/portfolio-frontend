const ROUTES = {
    root: "/",
    home: "/",
    projects: "/projects",
    project: "/projects/:id",
    projectDocument: "/projects/:id/docs/:name",
    about: "/about",
    contact: "/contact",
    notFound: "*"
} as const

export default ROUTES
