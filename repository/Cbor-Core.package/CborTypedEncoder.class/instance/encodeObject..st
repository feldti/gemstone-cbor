private
encodeObject: anObject
	"Registered classes take precedence over the built-in mapping.
	 Lookup is by exact class: subclasses must be registered themselves."

	| mapping |
	mapping := registry isNil ifFalse: [registry mappingForClass: anObject class].
	mapping isNil ifTrue: [^super encodeObject: anObject].
	self enter.
	mapping encode: anObject on: self.
	self leave