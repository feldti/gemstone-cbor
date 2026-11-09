initialization
initializeScale: aNumber
	runs := 5.
	seed := 12345.
	datasets := OrderedCollection new.
	datasets add: 'customers' -> (self customers: (1000 * aNumber) ceiling).
	datasets add: 'small ints' -> (self smallInts: (10000 * aNumber) ceiling).
	datasets add: 'floats' -> (self floats: (10000 * aNumber) ceiling).
	datasets add: 'strings' -> (self strings: (2000 * aNumber) ceiling).
	datasets add: 'bytes 64K' -> (self bytes: (65536 * aNumber) ceiling)