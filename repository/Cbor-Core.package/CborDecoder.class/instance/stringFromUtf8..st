private - decoding
stringFromUtf8: aByteArray
	| result |
	aByteArray isEmpty ifTrue: [^unicodeStrings ifTrue: [Unicode7 new] ifFalse: [String new]].
	result := [unicodeStrings
			ifTrue: [aByteArray decodeFromUTF8ToUnicode]
			ifFalse: [aByteArray decodeFromUTF8ToString]]
		on: Error
		do: [:ex | ex return: nil].
	result isNil ifTrue: [^self signalError: 'invalid UTF-8 in text string'].
	^result