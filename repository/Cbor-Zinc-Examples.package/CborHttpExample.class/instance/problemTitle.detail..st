server
problemTitle: aTitle detail: aDetail
	"RFC 9290 concise problem details: negative integer keys, -1 title, -2 detail."

	^Dictionary new
		at: -1 put: aTitle;
		at: -2 put: aDetail;
		yourself