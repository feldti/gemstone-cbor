writing - objects
writeArray: aSequenceableCollection
	self writeArrayHeader: aSequenceableCollection size.
	aSequenceableCollection do: [:each | self encode: each]