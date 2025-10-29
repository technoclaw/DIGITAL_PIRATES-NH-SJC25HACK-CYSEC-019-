#!/bin/bash

# Read the entire email from stdin
EMAIL_CONTENT=$(cat -)

# Get sender and recipient from command line arguments
SENDER="$1"
RECIPIENT="$2"

# Encode the email content in base64
ENCODED_EMAIL=$(echo "$EMAIL_CONTENT" | base64 -w 0)

# Send to our email processor via HTTP API
curl -s -X POST \
  http://email-processor:8080/process-email \
  -H "Content-Type: application/json" \
  -d "{
    \"sender\": \"$SENDER\",
    \"recipient\": \"$RECIPIENT\", 
    \"content\": \"$ENCODED_EMAIL\"
  }" > /dev/null

# Always return success to Postfix
exit 0