tests
testBlockBasedMapping
	| r bytes decoded |
	r := CborTypeRegistry new.
	r register: Association tag: 40010
		encode: [:assoc | Array with: assoc key with: assoc value]
		decode: [:pair | pair first -> pair last].
	bytes := r encode: 'a' -> 1.
	self assert: (self hexOf: bytes) equals: 'd99c4a82616101'.
	decoded := r decode: bytes.
	self assert: (decoded isKindOf: Association).
	self assert: decoded key equals: 'a'.
	self assert: decoded value equals: 1