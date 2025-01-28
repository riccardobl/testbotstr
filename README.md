# Testbotstr

Deterministic generation of nostr private keys and handles for testing purposes.
To be used with local relays for development and testing of nostr apps.

USE ONLY FOR TESTING PURPOSES - THIS IS NOT SECURE - ANYONE CAN GUESS THE PRIVATE KEYS EASILY

## Usage

```bash
# node testbostr.js UserName <relay>
# eg. 
node testbostr.js Merchant
node testbostr.js Zapper
node testbostr.js Poster ws://localhost:7777
``` 