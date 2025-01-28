import { useWebSocketImplementation } from 'nostr-tools/relay'
import WebSocket from 'ws'
useWebSocketImplementation(WebSocket)

import {  getPublicKey, finalizeEvent } from 'nostr-tools';
import { bech32 } from 'bech32';
import crypto from 'crypto';
import { Relay } from 'nostr-tools/relay';
import * as nip19 from 'nostr-tools/nip19';

function generateNsecFromSeed(seed) {
    const privateKey = crypto.createHash('sha256').update(seed).digest();
    const words = bech32.toWords(privateKey);
    const nsec = bech32.encode('nsec', words);
    return { nsec, privateKey: Buffer.from(privateKey).toString('hex') };
}

function deriveAvatar(seed) {
    const hashHex = crypto.createHash('sha256').update(seed).digest('hex');
    return `https://robohash.org/${hashHex}`;
}

function createMetadataEvent(privateKey, username, avatar, npub, pubkey) {
    const metadata = {
        name: username,
        displayName: username,
        display_name: username,
        picture: avatar,
        pubkey,
        npub,
        about: "Hello, I'm a test robot generated with https://github.com/riccardobl/testbotstr"
    };    
    const event = {
        kind: 0,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: JSON.stringify(metadata),
        pubkey,
    };
    const signedEvent = finalizeEvent(event, privateKey);
    return signedEvent;
}

async function publishToRelay(event, relayUrl, nsec) {
    const relay = await Relay.connect(relayUrl);
    relay.onnotice = (notice) => {
        console.log('Relay notice:', notice);
    };
    const { data:sk } = nip19.decode(nsec);
    const signedEvent = finalizeEvent(event, sk);
    await relay.publish(signedEvent);
    await relay.close();
}

async function main(username, relayUrl) {
    const seed = crypto.createHash('sha256').update(username).digest('hex');
    const { nsec, privateKey } = generateNsecFromSeed(seed);

    const pubkey = getPublicKey(privateKey);
    const npub = nip19.npubEncode(pubkey);

    const avatar = deriveAvatar(seed);
    const metadataEvent = createMetadataEvent(privateKey, username, avatar, npub, pubkey);
    console.info("Username:           ", username);
    console.info("Relay:              ", relayUrl);
    console.info();
    console.info("Private key (nsec): ", nsec);
    console.info("Public key  (npub): ", npub);
    console.info();
    console.info("Private key (hex ): ", privateKey);
    console.info("Public key  (hex ): ", pubkey);
    console.info();

    try {
        await publishToRelay(metadataEvent, relayUrl, nsec);
    } catch (err) {
        console.error('Failed to publish metadata event:', err);
    }
}

const username = process.argv[2];
const relayUrl = (process.argv[3] || 'wss://nostr.rblb.it:7777');
 
if (!username) {
    console.error('Usage: node testbotstr.js <username> [relayUrl]');
    process.exit(1);
}

main(username, relayUrl).catch(console.error);