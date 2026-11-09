server
handleRequest: request
	"GET  /customers/<id>  -> 200 application/cbor
	 POST /customers       -> 201 application/cbor (echoes the decoded customer)
	 Content negotiation:  406 if the client does not accept CBOR,
	                       415 if a request body is not CBOR,
	                       400 with concise problem details if the body is invalid."

	(self acceptsCbor: request) ifFalse: [^self respond: 406 with: nil type: nil].
	request method asString = 'GET'
		ifTrue: [^self respond: 200 with: (self customerFor: request uri) type: self class mediaType].
	request method asString = 'POST'
		ifFalse: [^self respond: 405 with: nil type: nil].
	(self hasCborBody: request) ifFalse: [^self respond: 415 with: nil type: nil].
	^[self respond: 201 with: (registry decode: request entity bytes) type: self class mediaType]
		on: CborError
		do: [:ex | ex return: (self respond: 400
			with: (self problemTitle: 'Bad Request' detail: ex messageText)
			type: self class problemMediaType)]