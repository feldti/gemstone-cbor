reporting
report
	"Answer a text table; times in milliseconds (best of runs)."

	| ws ms |
	ms := [:us | us isNil ifTrue: ['-'] ifFalse: [((us / 100) rounded / 10.0) printString]].
	ws := WriteStream on: String new.
	ws nextPutAll: 'dataset | CBOR bytes | CBOR enc ms | CBOR dec ms | JSON bytes | JSON enc ms | JSON dec ms'; lf.
	self measure do: [:row |
		ws nextPutAll: (row at: 1);
			nextPutAll: ' | '; print: (row at: 2);
			nextPutAll: ' | '; nextPutAll: (ms value: (row at: 3));
			nextPutAll: ' | '; nextPutAll: (ms value: (row at: 4));
			nextPutAll: ' | '; nextPutAll: ((row at: 5) ifNil: ['-'] ifNotNil: [:s | s printString]);
			nextPutAll: ' | '; nextPutAll: (ms value: (row at: 6));
			nextPutAll: ' | '; nextPutAll: (ms value: (row at: 7)); lf].
	^ws contents