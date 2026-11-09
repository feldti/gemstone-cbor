private
canInlineSmallIntegers
	"The inline path must not bypass a registry mapping for SmallInteger."

	^registry isNil or: [(registry mappingForClass: SmallInteger) isNil]