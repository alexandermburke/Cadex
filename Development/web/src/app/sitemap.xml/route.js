import { collection, getDocs } from "firebase/firestore"
import { db } from "@/firebase"

// (Optional) Force static generation if you don't need SSR
export const dynamic = "force-static"

export async function GET(request) {
  const now = new Date().toISOString()
  const snapshot = await getDocs(collection(db, "capCases"))
  const dynamicXmlArr = []
  snapshot.forEach(doc => {
    dynamicXmlArr.push(`
      <url>
        <loc>https://www.cadexlaw.com/casebriefs/summaries?caseId=${doc.id}</loc>
        <lastmod>${now}</lastmod>
        <priority>0.80</priority>
      </url>
    `)
  })

  const staticUrls = [
    "https://www.cadexlaw.com/",
    "https://www.cadexlaw.com/ailawtools/splash",
    "https://www.cadexlaw.com/pricing",
    "https://www.cadexlaw.com/admin/account",
    "https://www.cadexlaw.com/privacypolicy",
    "https://www.cadexlaw.com/termsandconditions",
    "https://www.cadexlaw.com/careers",
    "https://www.cadexlaw.com/casebriefs",
    "https://www.cadexlaw.com/casebriefs/allbriefs",
    "https://www.cadexlaw.com/casebriefs/analysis",
    "https://www.cadexlaw.com/casebriefs/summaries",
    "https://www.cadexlaw.com/lawtools/dictionary",
    "https://www.cadexlaw.com/ailawtools/flashcards",
    "https://www.cadexlaw.com/ailawtools/irac",
    "https://www.cadexlaw.com/ailawtools/lexapi",
    "https://www.cadexlaw.com/ailawtools/insights",
    "https://www.cadexlaw.com/ailawtools/examprep/mbe",
    "https://www.cadexlaw.com/subjects/contracts",
    "https://www.cadexlaw.com/subjects/torts",
    "https://www.cadexlaw.com/subjects/criminal",
    "https://www.cadexlaw.com/subjects/property",
    "https://www.cadexlaw.com/subjects/constitutional",
    "https://www.cadexlaw.com/videos/directory",
    "https://www.cadexlaw.com/lawtools/resumereview",
    "https://www.cadexlaw.com/lawtools/applicationreview",
    "https://www.cadexlaw.com/lawtools/interviewprep",
    "https://www.cadexlaw.com/lawtools/networking"
  ].map(url => `
    <url>
      <loc>${url}</loc>
      <lastmod>${now}</lastmod>
      <priority>0.80</priority>
    </url>
  `)

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 
  http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  ${staticUrls.join("\n")}
  ${dynamicXmlArr.join("\n")}
</urlset>`

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  })
}
