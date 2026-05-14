<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>XML Sitemap</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            color: #333;
            max-width: 75rem;
            margin: 0 auto;
            padding: 2rem;
          }
          h1 {
            font-size: 2rem;
            margin-bottom: 1rem;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 2rem;
          }
          th {
            text-align: left;
            border-bottom: 1px solid #ccc;
            padding: 1rem;
            font-size: 0.875rem;
            text-transform: uppercase;
            color: #666;
            background: #f9f9f9;
          }
          td {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid #eee;
            font-size: 0.9rem;
          }
          tr:hover td {
            background-color: #f8f9fa;
          }
          a {
            color: #0066cc;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          .count {
            font-size: 0.875rem;
            color: #666;
            margin-bottom: 2rem;
          }
        </style>
      </head>
      <body>
        <h1>XML Sitemap</h1>
        
        <xsl:if test="count(sitemap:sitemapindex/sitemap:sitemap) &gt; 0">
          <p class="count">
            This XML Sitemap Index contains <xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)"/> sitemaps.
          </p>
          <table>
            <thead>
              <tr>
                <th width="75%">Sitemap Location</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
                <tr>
                  <td>
                    <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </xsl:if>
        
        <xsl:if test="count(sitemap:urlset/sitemap:url) &gt; 0">
          <p class="count">
            This XML Sitemap contains <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> URLs.
          </p>
          <table>
            <thead>
              <tr>
                <th width="65%">Location</th>
                <th width="15%">Priority</th>
                <th width="20%">Change Frequency</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <tr>
                  <td>
                    <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
                  </td>
                  <td>
                    <xsl:value-of select="sitemap:priority"/>
                  </td>
                  <td>
                    <xsl:value-of select="sitemap:changefreq"/>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </xsl:if>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
