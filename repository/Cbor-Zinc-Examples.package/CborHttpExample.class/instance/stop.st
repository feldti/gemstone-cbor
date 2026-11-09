server
stop
	server isNil ifFalse: [server stop. server := nil]