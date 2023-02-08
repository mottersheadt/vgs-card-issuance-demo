# Ensure the nodejs server's port is open to the public so we can make requests.
watch -n 1 gh codespace -c $CODESPACE_NAME ports visibility 3000:public &