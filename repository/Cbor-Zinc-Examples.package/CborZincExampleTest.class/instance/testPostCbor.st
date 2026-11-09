tests
testPostCbor
	| client customer echoed |
	customer := CborTestCustomer name: 'Grace' id: 7 addresses: #() createdAt: nil.
	client := ZnClient new.
	client
		url: (self url: '/customers');
		accept: 'application/cbor';
		entity: (ZnEntity with: (example registry encode: customer) type: 'application/cbor');
		contentReader: [:entity | example registry decode: entity bytes].
	echoed := client post.
	self assert: client response code equals: 201.
	self assert: echoed name equals: 'Grace'.
	self assert: echoed id equals: 7