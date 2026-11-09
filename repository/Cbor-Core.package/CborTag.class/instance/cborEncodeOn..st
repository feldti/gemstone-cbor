cbor
cborEncodeOn: aCborEncoder
	aCborEncoder writeTag: tag.
	aCborEncoder encode: value