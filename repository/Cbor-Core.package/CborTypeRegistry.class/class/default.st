default instance
default
	"Answer the shared, persistent registry. Prefer selector-based registration
	 (#register:tag:, #register:typeName:) here, since it stores no blocks."

	Default isNil ifTrue: [Default := self new].
	^Default