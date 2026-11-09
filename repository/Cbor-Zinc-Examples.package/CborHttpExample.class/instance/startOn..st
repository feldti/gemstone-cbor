server
startOn: aPortNumber
	server := ZnServer startOn: aPortNumber.
	server onRequestRespond: [:request | self handleRequest: request]