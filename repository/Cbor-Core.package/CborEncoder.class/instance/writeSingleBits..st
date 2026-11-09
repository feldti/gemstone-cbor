private
writeSingleBits: anInteger
	stream nextPut: 16rFA.
	self writeUnsigned: anInteger bytes: 4