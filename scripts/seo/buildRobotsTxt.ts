import AI_CRAWLERS from "@scripts/seo/aiCrawlers"

function buildGroup(agent: string): string {
    return `User-agent: ${agent}\nAllow: /\n`
}

function buildRobotsTxt(sitemapUrl: string): string {
    const groups = ["*", ...AI_CRAWLERS].map(buildGroup)

    return `${groups.join("\n")}\nSitemap: ${sitemapUrl}\n`
}

export default buildRobotsTxt
