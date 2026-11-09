tests
testGetRawBytes
	"Without a content reader the body arrives as a ByteArray (application/cbor is binary in Zinc)."

	| bytes |
	bytes := ZnClient new
		url: (self url: '/customers/42');
		accept: 'application/cbor';
		get.
	self assert: (bytes isKindOf: ByteArray).
	self assert: (Cbor hexFromBytes: bytes) equals: 'd99c42a2016341646102182a'