var marked = require("marked");
var titleToLink = require("./titleToLink");
var hljs = require("./highlight.js");

function unescape(html) {
	return html
		.replace(/&#39;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/&gt;/g, '>')
		.replace(/&lt;/g, '<')
		.replace(/&amp;/g, '&');
}

function escape(html) {
	return html
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

module.exports = function renderMarkdown(md, noRefs) {
	md = md.replace(/\[\[([^\]]+?)\s*\|\s*([a-z0-9 \-_\.]+)\]\]/gi, function(intraLink) {
		// [[text | intra link]]
		var match = /\[\[([^\]]+?)\s*\|\s*([a-z0-9 \-_\.]+)\]\]/gi.exec(intraLink);
		var link = titleToLink(match[2]);
		return "[" + match[1] + "](" + link + ".html)";
	}).replace(/\[\[([a-z0-9 \-_\.]+)\]\]/gi, function(intraLink) {
		// [[intra link]]
		var match = /\[\[(.+)\]\]/gi.exec(intraLink);
		var link = titleToLink(match[1]);
		return "[" + match[1] + "](" + link + ".html)";
	});
	var listOfHeadings = [];
	var renderer = new marked.Renderer();
	renderer.code = function(code, lang) {
		var html = false;
		if(lang === "html") lang = "xml";
		try {
			if(lang) html = hljs.highlight(lang, code).value;
			else html = hljs.highlightAuto(code).value;
		} catch(e) {
			html = escape(code);
		}
		return "<pre><code>" + html + "</code></pre>";
	};
	renderer.codespan = function(code) {
		code = unescape(code);
		var html = hljs.highlight("javascript", code).value;
		return "<code>" + html + "</code>";
	};
	renderer.heading = function(text, level, raw, options) {
		if(noRefs) {
			return '<h'
				+ level
				+ '>'
				+ text
				+ '</h'
				+ level
				+ '>\n';
		} else {
			var anchor = text.toLowerCase().replace(/\(.*?\)/g, "").trim().replace(/<.*?>|\&.*?;/g, "").replace(/[^\w]+/g, '-').replace(/^\-+|\-+$/g, "");
			listOfHeadings.push({
				anchor: anchor,
				text: text.replace(/\(.*?\)/g, ""),
				level: level
			});
			return '<h'
				+ level
				+ ' id="'
				+ anchor
				+ '"><a class="anchor" href="#'
				+ anchor
				+ '">&rarr;</a>'
				+ text
				+ '</h'
				+ level
				+ '>\n';
		}
	};
	renderer.table = function(header, body) {
		return '<table class="table table-bordered table-striped table-hover">\n'
			+ '<thead>\n'
			+ header
			+ '</thead>\n'
			+ '<tbody>\n'
			+ body
			+ '</tbody>\n'
			+ '</table>\n';
	};
	var html = marked(md, {
		renderer: renderer,
		gfm: true,
		tables: true,
		breaks: false,
		smartLists: true,
		smartypants: true
	});
	var contents = [];
	var currentLevel = listOfHeadings.map(function(h) {
		return h.level;
	}).reduce(function(a, b) { return Math.min(a, b); }, 1000) - 1;
	listOfHeadings.forEach(function(heading) {
		if(currentLevel === heading.level) {
			contents.push("</li><li>");
		} else if(currentLevel < heading.level - 1) {
			return;
		} else if(currentLevel < heading.level) {
			contents.push("<ul><li>");
			currentLevel++;
		} else if(currentLevel > heading.level) {
			while(currentLevel > heading.level) {
				contents.push("</li></ul>");
				currentLevel--;
			}
			contents.push("</li><li>");
		}
		contents.push("<a href=\"#",
			heading.anchor,
			"\">",
			heading.text,
			"</a>");
	});
	while(listOfHeadings.length > 0 && currentLevel > 0) {
		contents.push("</li></ul>");
		currentLevel--;
	}
	contents = contents.join("");
	if(contents) {
		return "<div class=\"contents\">" + contents + "</div>" + html;
	}
	return html;
}
