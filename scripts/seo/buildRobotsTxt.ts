import AI_CRAWLERS from "@scripts/seo/aiCrawlers"
import CONTENT_SIGNAL from "@scripts/seo/contentSignal"

function buildGroup(agent: string): string {
    return `User-agent: ${agent}\nAllow: /\nContent-Signal: ${CONTENT_SIGNAL}\n`
}

function buildRobotsTxt(sitemapUrl: string): string {
    const groups = ["*", ...AI_CRAWLERS].map(buildGroup)

    return `${groups.join("\n")}\nSitemap: ${sitemapUrl}\n`
}

export default buildRobotsTxt
