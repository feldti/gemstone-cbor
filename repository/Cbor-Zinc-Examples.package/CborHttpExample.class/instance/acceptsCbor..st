server
acceptsCbor: request
	"A missing Accept header means the client accepts anything."

	| accept |
	accept := request headers at: 'Accept' ifAbsent: ['*/*'].
	^(accept includesSubstring: self class mediaType)
		or: [(accept includesSubstring: '*/*') or: [accept includesSubstring: 'application/*']]