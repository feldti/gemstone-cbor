server
respond: statusCode with: anObjectOrNil type: aMediaTypeString
	"Answer a ZnResponse; the body is anObjectOrNil encoded with the registry."

	| response |
	response := ZnResponse new.
	response statusLine: (ZnStatusLine code: statusCode).
	anObjectOrNil isNil
		ifFalse: [response entity: (ZnEntity with: (registry encode: anObjectOrNil) type: aMediaTypeString)].
	^response