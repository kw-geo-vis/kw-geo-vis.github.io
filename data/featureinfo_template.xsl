<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:esri_wms="http://www.esri.com/wms" xmlns="http://www.esri.com/wms">
  <!--
    <%@page contentType="text/html" pageEncoding="UTF-8"%>
   <!DOCTYPE html>
	<html lang="en">
  -->    
  <xsl:output 
    method="html" 
    indent="yes" 
    encoding="UTF-8" 
    omit-xml-declaration="yes"/> 
  <xsl:template match="/">    
  <!--<head>-->
	<html lang="en">
	<head>
        <style type="text/css">
		@media (max-height:200px) {
			body {
				font: 12px/1.5 "Helvetica Neue", Arial, Helvetica, sans-serif;
			}
			.record__head { 
				position: fixed !important;
			}
			
			.record { 
				height: 100%;
				overflow-x: hidden !important;
				overflow-y: scroll !important;
			}
		}

	
	
        </style>
      <link rel="stylesheet" type="text/css" href="https://kw-geo-vis.github.io/css/main-dist.css"/>
	  </head>
    <!--</head>
      <body>--> 
<body class="popup--Bedrock">
			<xsl:for-each select="esri_wms:FeatureInfoResponse">
				
				<xsl:if test="not(esri_wms:FeatureInfoCollection)">
				<div class="record">
							<div class="record__head">
								<h2 class="record__type">
								No Data
								</h2>
								</div>
							<div class="record__body">
								<div class="record__details">
								<p class="record__text">
									There is not data at this location for your
									chosen data set
								</p>
								<p class="record__text">
									Try another location or switch data layer
								</p>
								</div>
							</div>
				</div>
				</xsl:if>
				<xsl:for-each select="esri_wms:FeatureInfoCollection">
					    <div class="record">
							<div class="record__head">
								<h2 class="record__type">
									<xsl:if test="@layername = 'BGS.50k.Bedrock'">
										Bedrock
									</xsl:if>
									<xsl:if test="@layername = 'BGS.50k.Superficial.deposits'">
										Superficial 
									</xsl:if>
									<xsl:if test="@layername = 'BGS.50k.Artificial.ground'">
										Artificial
									</xsl:if>
								</h2>
							</div>
							<div class="record__body">
								<div class="record__details">
					
					<xsl:for-each select="esri_wms:FeatureInfo">
						<xsl:for-each select="esri_wms:Field">  					
							<xsl:if test="esri_wms:FieldName = 'LEX_RCS_D'">
								<h3 class="record__title"><xsl:value-of select="esri_wms:FeatureInfoCollection"/><xsl:value-of select="esri_wms:FieldValue"/></h3>
							</xsl:if>
							<xsl:if test="esri_wms:FieldName = 'ENVIRONMENT_D'">
								<p class="record__text"><xsl:value-of select="esri_wms:FieldValue"/></p>
						</xsl:if>
						</xsl:for-each>
					</xsl:for-each>
					
								</div>
							</div>
						</div>
				</xsl:for-each>
			</xsl:for-each>

</body>
</html>
    <!--</body>
    </html>-->
  </xsl:template>
   </xsl:stylesheet>