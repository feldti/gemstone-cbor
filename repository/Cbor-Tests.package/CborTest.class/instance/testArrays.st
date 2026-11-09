tests - collections
testArrays
	self assertRoundTrip: #() hex: '80'.
	self assertRoundTrip: #(1 2 3) hex: '83010203'.
	self assertRoundTrip: {1. #(2 3). #(4 5)} hex: '8301820203820405'.
	self assertRoundTrip: (1 to: 25) asArray hex: '98190102030405060708090a0b0c0d0e0f101112131415161718181819'.
	self assertEncoding: (OrderedCollection with: 1 with: 2) is: '820102'