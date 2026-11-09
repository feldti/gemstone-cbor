! ------------------------------------------------------------------
! CBOR over HTTP with Zinc - examples and tests (see docs/http.md)
! Requires Zinc HTTP Components and CborLibrary.gs (+ CborVectorTest-vectors.gs).
! Load with Topaz:  input CborZincExamples.gs   (then: commit)
! ------------------------------------------------------------------

set compile_env: 0

run
Object subclass: 'CborHttpExample'
	instVarNames: #( registry server )
	classVars: #()
	classInstVars: #()
	poolDictionaries: #()
	inDictionary: CborLibrary
	options: #()
%

run
TestCase subclass: 'CborZincExampleTest'
	instVarNames: #( example )
	classVars: #()
	classInstVars: #()
	poolDictionaries: #()
	inDictionary: CborLibrary
	options: #()
%

! ------------------- CborHttpExample
removeallmethods CborHttpExample
removeallclassmethods CborHttpExample

category: 'instance creation'
classmethod: CborHttpExample
startOn: aPortNumber
	"Start a Zinc server answering CBOR requests on aPortNumber."

	^self new startOn: aPortNumber
%

category: 'instance creation'
classmethod: CborHttpExample
new
	^self basicNew initialize
%

category: 'accessing'
classmethod: CborHttpExample
mediaType
	"RFC 8949, section 9.5"

	^'application/cbor'
%

category: 'accessing'
classmethod: CborHttpExample
problemMediaType
	"RFC 9290: Concise Problem Details"

	^'application/concise-problem-details+cbor'
%

category: 'initialization'
method: CborHttpExample
initialize
	registry := CborTypeRegistry new.
	registry register: CborTestCustomer tag: 40002.
	registry register: CborTestAddress tag: 40003
%

category: 'accessing'
method: CborHttpExample
registry
	^registry
%

category: 'server'
method: CborHttpExample
startOn: aPortNumber
	server := ZnServer startOn: aPortNumber.
	server onRequestRespond: [:request | self handleRequest: request]
%

category: 'server'
method: CborHttpExample
stop
	server isNil ifFalse: [server stop. server := nil]
%

category: 'server'
method: CborHttpExample
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
%

category: 'server'
method: CborHttpExample
acceptsCbor: request
	"A missing Accept header means the client accepts anything."

	| accept |
	accept := request headers at: 'Accept' ifAbsent: ['*/*'].
	^(accept includesSubstring: self class mediaType)
		or: [(accept includesSubstring: '*/*') or: [accept includesSubstring: 'application/*']]
%

category: 'server'
method: CborHttpExample
hasCborBody: request
	^request contentType notNil
		and: [request contentType matches: self class mediaType asZnMimeType]
%

category: 'server'
method: CborHttpExample
customerFor: aZnUrl
	"Example data; a real service would look the customer up."

	^CborTestCustomer name: 'Ada' id: 42 addresses: #() createdAt: nil
%

category: 'server'
method: CborHttpExample
respond: statusCode with: anObjectOrNil type: aMediaTypeString
	"Answer a ZnResponse; the body is anObjectOrNil encoded with the registry."

	| response |
	response := ZnResponse new.
	response statusLine: (ZnStatusLine code: statusCode).
	anObjectOrNil isNil
		ifFalse: [response entity: (ZnEntity with: (registry encode: anObjectOrNil) type: aMediaTypeString)].
	^response
%

category: 'server'
method: CborHttpExample
problemTitle: aTitle detail: aDetail
	"RFC 9290 concise problem details: negative integer keys, -1 title, -2 detail."

	^Dictionary new
		at: -1 put: aTitle;
		at: -2 put: aDetail;
		yourself
%

! ------------------- CborZincExampleTest
removeallmethods CborZincExampleTest
removeallclassmethods CborZincExampleTest

category: 'running'
method: CborZincExampleTest
setUp
	super setUp.
	example := CborHttpExample startOn: self port
%

category: 'running'
method: CborZincExampleTest
tearDown
	example stop.
	super tearDown
%

category: 'helpers'
method: CborZincExampleTest
port
	^18765
%

category: 'helpers'
method: CborZincExampleTest
url: aPath
	^'http://localhost:' , self port printString , aPath
%

category: 'tests'
method: CborZincExampleTest
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
%

category: 'tests'
method: CborZincExampleTest
testGetRawBytes
	"Without a content reader the body arrives as a ByteArray (application/cbor is binary in Zinc)."

	| bytes |
	bytes := ZnClient new
		url: (self url: '/customers/42');
		accept: 'application/cbor';
		get.
	self assert: (bytes isKindOf: ByteArray).
	self assert: (Cbor hexFromBytes: bytes) equals: 'd99c42a2016341646102182a'
%

category: 'tests'
method: CborZincExampleTest
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
%

category: 'tests'
method: CborZincExampleTest
testPostWrongContentTypeIs415
	| client |
	client := ZnClient new.
	client
		url: (self url: '/customers');
		entity: (ZnEntity with: '{"name":"Ada"}' type: 'application/json');
		post.
	self assert: client response code equals: 415
%

category: 'tests'
method: CborZincExampleTest
testNotAcceptableIs406
	| client |
	client := ZnClient new.
	client
		url: (self url: '/customers/42');
		accept: 'application/json';
		get.
	self assert: client response code equals: 406
%

category: 'tests'
method: CborZincExampleTest
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
%

category: 'tests'
method: CborZincExampleTest
testMalformedCborIs400
	"Truncated CBOR (array of 3 with only one element)."

	| client |
	client := ZnClient new.
	client
		url: (self url: '/customers');
		entity: (ZnEntity with: (Cbor bytesFromHex: '8301') type: 'application/cbor');
		post.
	self assert: client response code equals: 400
%
