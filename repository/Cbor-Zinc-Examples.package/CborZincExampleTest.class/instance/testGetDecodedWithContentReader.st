tests
testGetDecodedWithContentReader
	"Client: ask for CBOR and let a content reader decode the body."

	| client customer |
	client := ZnClient new.
	client
		url: (self url: '/customers/42');
		accept: 'application/cbor';
		contentReader: [:entity | example registry decode: entity bytes].
	customer := client get.
	self assert: client response code equals: 200.
	self assert: (client response contentType matches: 'application/cbor' asZnMimeType).
	self assert: customer class equals: CborTestCustomer.
	self assert: customer name equals: 'Ada'.
	self assert: customer id equals: 42