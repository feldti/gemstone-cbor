private
writeHalfBits: anInteger
	stream nextPut: 16rF9.
	self writeUnsigned: anInteger bytes: 2