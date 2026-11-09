tests
testMalformedCborIs400
	"Truncated CBOR (array of 3 with only one element)."

	| client |
	client := ZnClient new.
	client
		url: (self url: '/customers');
		entity: (ZnEntity with: (Cbor bytesFromHex: '8301') type: 'application/cbor');
		post.
	self assert: client response code equals: 400