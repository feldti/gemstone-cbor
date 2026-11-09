tests
testCanonicalEncodingUsesRegistryForKeys
	"Map keys are encoded by a nested encoder in canonical mode; it must know the registry."

	| r d bytes decoded |
	r := self registry.
	d := Dictionary new.
	d at: (self p: 1 _: 2) put: 'a'.
	bytes := r encodeCanonical: d.
	self assert: (self hexOf: bytes) equals: 'a1d99c418201026161'.
	decoded := r decode: bytes.
	self assert: (decoded at: (self p: 1 _: 2)) equals: 'a'