private
enter
	"Called before writing the contents of a container or self-encoding object."

	depth >= maxDepth
		ifTrue: [^CborError signal: 'CBOR maximum nesting depth exceeded (cyclic structure?)'].
	depth := depth + 1