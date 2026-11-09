server
hasCborBody: request
	^request contentType notNil
		and: [request contentType matches: self class mediaType asZnMimeType]