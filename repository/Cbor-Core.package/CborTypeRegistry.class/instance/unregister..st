registering
unregister: aClass
	"Remove the mapping for aClass. Answer the removed mapping or nil."

	| mapping |
	mapping := byClass removeKey: aClass ifAbsent: [nil].
	mapping isNil ifTrue: [^nil].
	mapping tag isNil ifFalse: [byTag removeKey: mapping tag ifAbsent: [nil]].
	mapping typeName isNil ifFalse: [byName removeKey: mapping typeName ifAbsent: [nil]].
	^mapping