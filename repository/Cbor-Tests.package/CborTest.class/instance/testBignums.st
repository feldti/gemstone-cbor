tests - integers
testBignums
	| expected |
	self assertRoundTrip: 18446744073709551616 hex: 'c249010000000000000000'.
	self assertRoundTrip: -18446744073709551617 hex: 'c349010000000000000000'.
	"2^200 needs 26 bytes: 01 followed by 25 zero bytes"
	expected := WriteStream on: String new.
	expected nextPutAll: 'c2581a01'.
	25 timesRepeat: [expected nextPutAll: '00'].
	self assertRoundTrip: (2 raisedTo: 200) hex: expected contents.
	self assert: (self decodeHex: 'c240') equals: 0.
	self assert: (self decodeHex: 'c34100') equals: -1