import{_ as i,D as e,c as d,l as a,a as t,I as n,a4 as o,o as l}from"./chunks/framework.DonzCgw1.js";const f=JSON.parse('{"title":"Configuration","description":"","frontmatter":{},"headers":[],"relativePath":"v0.0.0/config.md","filePath":"v0.0.0/config.md","lastUpdated":1713907597000}'),h={name:"v0.0.0/config.md"},p={id:"configuration",tabindex:"-1"},c=a("a",{class:"header-anchor",href:"#configuration","aria-label":'Permalink to "Configuration <Badge type="info" text="v0.0.0" />"'},"​",-1),r=o(`<p>The PanVA application can be configured with a runtime configuration file <code>config.json</code> placed in the root directory of the application.</p><h2 id="options" tabindex="-1">Options <a class="header-anchor" href="#options" aria-label="Permalink to &quot;Options&quot;">​</a></h2><p>All fields are optional.</p><table><thead><tr><th>Field</th><th>Type</th><th>Default</th><th>Description</th></tr></thead><tbody><tr><td><code>apiUrl</code></td><td><code>string</code></td><td><code>&quot;/api/&quot;</code></td><td>Base URI of the API.</td></tr><tr><td><code>apps</code></td><td><code>string[]</code></td><td><code>[&quot;homology&quot;]</code></td><td>Apps that should be enabled.</td></tr><tr><td><code>homology</code></td><td><code>object</code></td><td></td><td>Configuration options for the <code>homology</code> app.</td></tr><tr><td><code>homology.alignmentMetadata</code></td><td><code>Metadata[]</code></td><td><code>[]</code></td><td>Alignment cell metadata.</td></tr><tr><td><code>homology.annotations</code></td><td><code>Annotation[]</code></td><td><code>[]</code></td><td>List of available annotations.</td></tr><tr><td><code>homology.defaultId</code></td><td><code>integer</code></td><td>The first id in the homologies list.</td><td>Default homology group to load.</td></tr><tr><td><code>homology.defaultSequenceMetadataColumns</code></td><td><code>string[]</code></td><td><code>[]</code></td><td>Default sequence metadata columns to be shown.</td></tr><tr><td><code>homology.homologyMetadata</code></td><td><code>Metadata[]</code></td><td><code>[]</code></td><td>Homology group metadata.</td></tr><tr><td><code>homology.sequenceMetadata</code></td><td><code>Metadata[]</code></td><td><code>[]</code></td><td>Sequence metadata, user-selectable.</td></tr><tr><td><code>homology.trees</code></td><td><code>Tree[]</code></td><td><code>[]</code></td><td>Additional trees.</td></tr><tr><td><code>homology.variableMetadata</code></td><td><code>Metadata[]</code></td><td><code>[]</code></td><td>Variable position metadata.</td></tr><tr><td><code>title</code></td><td><code>string</code></td><td><code>&quot;PanVA&quot;</code></td><td>Title of the application.</td></tr></tbody></table><h2 id="annotation" tabindex="-1">Annotation <a class="header-anchor" href="#annotation" aria-label="Permalink to &quot;Annotation&quot;">​</a></h2><p>Positions can be annotated with one or more features. You can configure which annotations should be displayed.</p><p>Each column should be configured as a JSON object with the following options:</p><table><thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Notes</th></tr></thead><tbody><tr><td><code>column</code></td><td><code>string</code></td><td>✔️</td><td>CSV column in <a href="./../../api/docs/data-format.html#annotationscsv-optional"><code>annotations.csv</code></a>.</td></tr><tr><td><code>label</code></td><td><code>string</code></td><td>✔️</td><td>Description of the annotation.</td></tr></tbody></table><h2 id="tree" tabindex="-1">Tree <a class="header-anchor" href="#tree" aria-label="Permalink to &quot;Tree&quot;">​</a></h2><p>Besides the default and custom dendrogram, PanVA can render additional trees in Newick for. You can configure which columns should be displayed.</p><p>Each column should be configured as a JSON object with the following options:</p><table><thead><tr><th>Field</th><th>Type</th><th>Notes</th></tr></thead><tbody><tr><td><code>filename</code></td><td><code>string</code></td><td>Filename of the tree file (in Newick format) in the root dataset directory.</td></tr><tr><td><code>label</code></td><td><code>string</code></td><td>Description of the tree.</td></tr></tbody></table><h2 id="metadata" tabindex="-1">Metadata <a class="header-anchor" href="#metadata" aria-label="Permalink to &quot;Metadata&quot;">​</a></h2><p>Metadata can be visualized in a number of different ways. You can configure which columns should be displayed.</p><p>Each column should be configured as a JSON object with the following options:</p><table><thead><tr><th>Field</th><th>Type</th><th>Notes</th></tr></thead><tbody><tr><td><code>column</code></td><td><code>string</code></td><td>CSV column in the respective file (see note below).</td></tr><tr><td><code>label</code></td><td><code>string</code></td><td>Short description of the column.</td></tr><tr><td><code>type</code></td><td><code>&quot;boolean&quot; | &quot;categorical&quot; | &quot;quantitative&quot;</code></td><td></td></tr></tbody></table><p>Based on the value of <code>type</code> these options are extended with the options as defined below.</p><p><strong>Important:</strong> The same metadata column can not be displayed more than once.</p><h3 id="files" tabindex="-1">Files <a class="header-anchor" href="#files" aria-label="Permalink to &quot;Files&quot;">​</a></h3><p>This type is used for several kinds of metadata, which are stored in multiple files:</p><ul><li><code>alignmentMetadata</code> is stored in <a href="./../../api/docs/data-format.html#alignmentscsv"><code>alignments.csv</code></a> and contains metadata for each position in each aligned gene sequence.</li><li><code>homologyMetadata</code> is stored in <a href="./../../api/docs/data-format.html#homologiesjson"><code>homologies.json</code></a> and contains metadata for each homology group.</li><li><code>sequenceMetadata</code> is stored in <a href="./../../api/docs/data-format.html#metadatacsv"><code>metadata.csv</code></a> and contains metadata for each aligned gene sequence (metadata is the same for all positions).</li><li><code>variableMetadata</code> is stored in <a href="./../../api/docs/data-format.html#variablecsv"><code>variable.csv</code></a> and contains metadata for each variable position (metadata is the same for all sequences).</li></ul><p>Metadata of type <code>boolean</code> in <code>variableMetadata</code> can also be used to filter positions.</p><h3 id="type-boolean" tabindex="-1">Type: Boolean <a class="header-anchor" href="#type-boolean" aria-label="Permalink to &quot;Type: Boolean&quot;">​</a></h3><table><thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Notes</th></tr></thead><tbody><tr><td><code>labels</code></td><td><code>object</code></td><td></td><td>Displayed in tooltip over column.</td></tr><tr><td><code>labels.true</code></td><td><code>string</code></td><td>✔️</td><td></td></tr><tr><td><code>labels.false</code></td><td><code>string</code></td><td>✔️</td><td></td></tr><tr><td><code>labels.null</code></td><td><code>string</code></td><td>✔️</td><td></td></tr><tr><td><code>values</code></td><td><code>object</code></td><td></td><td></td></tr><tr><td><code>values.true</code></td><td><code>string</code></td><td>✔️</td><td>Consider this CSV value to be <code>true</code>.</td></tr><tr><td><code>values.false</code></td><td><code>string</code></td><td>✔️</td><td>Consider this CSV value to be <code>false</code>.</td></tr></tbody></table><p>When <code>values</code> is omitted, the value will be matched (case-insensitive) against <code>&quot;true&quot; | &quot;t&quot; | &quot;yes&quot; | &quot;y&quot;</code> for <code>true</code> and <code>&quot;false&quot; | &quot;f&quot; | &quot;no&quot; | &quot;n&quot;</code> for <code>false</code>. All other values will be considered to be unknown (<code>null</code>).</p><h3 id="type-categorical" tabindex="-1">Type: Categorical <a class="header-anchor" href="#type-categorical" aria-label="Permalink to &quot;Type: Categorical&quot;">​</a></h3><table><thead><tr><th>Field</th><th>Type</th><th>Default</th><th>Notes</th></tr></thead><tbody><tr><td><code>width</code></td><td><code>number</code></td><td><code>120</code></td><td>Width of the column for sequence metadata.</td></tr></tbody></table><h3 id="type-quantitative" tabindex="-1">Type: Quantitative <a class="header-anchor" href="#type-quantitative" aria-label="Permalink to &quot;Type: Quantitative&quot;">​</a></h3><table><thead><tr><th>Field</th><th>Type</th><th>Default</th><th>Notes</th></tr></thead><tbody><tr><td><code>decimals</code></td><td><code>number</code></td><td><code>0</code></td><td>Maximum number of decimals to display. Trailing zeroes are removed.</td></tr><tr><td><code>maxValue</code></td><td><code>number</code></td><td>Maximum value in column</td><td>Maximum value to determine bar width.</td></tr><tr><td><code>suffix</code></td><td><code>string</code></td><td><code>&quot;&quot;</code></td><td>String to be placed behind the numeric value (e.g. <code>&quot;%&quot;</code>)</td></tr><tr><td><code>width</code></td><td><code>number</code></td><td><code>120</code></td><td>Width of the column for sequence metadata.</td></tr></tbody></table><h2 id="example-config" tabindex="-1">Example configuration file <a class="header-anchor" href="#example-config" aria-label="Permalink to &quot;Example configuration file {#example-config}&quot;">​</a></h2><div class="language-json vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  &quot;apiUrl&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;/pecto/&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  &quot;homology&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    &quot;defaultId&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;13803671&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    &quot;annotations&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;column&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;cds&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;label&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;CDS&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ],</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    &quot;sequenceMetadata&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;column&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ft16&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;label&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;FT16&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;type&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;quantitative&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;width&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">80</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;column&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;virulence&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;label&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Virulence&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;labels&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">          &quot;true&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Virulent&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">          &quot;false&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Avirulent&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">          &quot;null&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Unknown&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        },</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;type&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;boolean&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;values&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">          &quot;true&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;virulent&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">          &quot;false&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;avirulent&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;column&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;species&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;label&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Species&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;type&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;categorical&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;width&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">80</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;column&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;strain_name&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;label&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Strain&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;type&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;categorical&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        &quot;width&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">120</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  &quot;title&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;PanVA: Pectobacterium&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div>`,31);function k(u,E,g,y,q,F){const s=e("Badge");return l(),d("div",null,[a("h1",p,[t("Configuration "),n(s,{type:"info",text:"v0.0.0"}),t(),c]),r])}const b=i(h,[["render",k]]);export{f as __pageData,b as default};