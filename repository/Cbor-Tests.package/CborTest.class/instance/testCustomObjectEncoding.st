tests - api
testCustomObjectEncoding
	"Objects understanding #cborEncodeOn: control their own encoding; CborTag does that."

	self assertEncoding: (CborTag tag: 1000 value: #(1 'x')) is: 'd903e882016178'