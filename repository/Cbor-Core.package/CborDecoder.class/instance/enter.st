private - decoding
enter
	depth := depth + 1.
	depth > maxDepth ifTrue: [^self signalError: 'maximum nesting depth exceeded']