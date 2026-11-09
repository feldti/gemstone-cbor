instance creation
startOn: aPortNumber
	"Start a Zinc server answering CBOR requests on aPortNumber."

	^self new startOn: aPortNumber