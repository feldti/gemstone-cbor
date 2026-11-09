tests
testInvalidBodyIs400WithProblemDetails
	"Well-formed CBOR that violates the contract (negative customer id)."

	| client problem |
	client := ZnClient new.
	client
		url: (self url: '/customers');
		entity: (ZnEntity with: (Cbor bytesFromHex: 'd99c42a201634164610224') type: 'application/cbor');
		post.
	self assert: client response code equals: 400.
	self assert: (client response contentType matches: 'application/concise-problem-details+cbor' asZnMimeType).
	problem := Cbor decode: client response entity bytes.
	self assert: (problem at: -1) equals: 'Bad Request'.
	self assert: ((problem at: -2) includesSubstring: 'id')