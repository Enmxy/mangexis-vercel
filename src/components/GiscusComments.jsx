import Giscus from '@giscus/react'

const GiscusComments = ({ manga, chapter }) => {
  // Sayfa bazlı mapping için unique identifier
  const discussionId = chapter 
    ? `manga-${manga}-chapter-${chapter}`
    : `manga-${manga}`

  return (
    <div className="w-full">
      <Giscus
        id="comments"
        repo="Enmxy/mangexis-vercel"
        repoId="R_kgDOQM0tVA"
        category="General"
        categoryId="DIC_kwDOQM0tVM4CxTlt"
        mapping="specific"
        term={discussionId}
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
        theme="preferred_color_scheme"
        lang="tr"
        loading="lazy"
      />
    </div>
  )
}

export default GiscusComments
