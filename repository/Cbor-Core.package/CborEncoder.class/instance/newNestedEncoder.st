private
newNestedEncoder
	"Answer a fresh encoder with the receiver's options, used to encode map keys
	 separately for canonical ordering. Subclasses add their own state."

	^self class new
		canonical: canonical;
		shortestFloats: shortestFloats;
		maxDepth: maxDepth - depth;
		yourself